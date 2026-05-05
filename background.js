const API = 'https://api.github.com';

function dateString(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildQuery(mode) {
  switch (mode) {
    case 'lucky':
      return `stars:>5 pushed:>${dateString(90)} archived:false is:public`;
    case 'words': {
      const topic = pick(['awesome', 'documentation', 'tutorial', 'learning', 'guide']);
      return `topic:${topic} pushed:>${dateString(90)} archived:false is:public`;
    }
    case 'beginner':
      return `good-first-issues:>3 pushed:>${dateString(60)} archived:false stars:50..5000 is:public`;
    case 'deeper':
      return `help-wanted-issues:>0 pushed:>${dateString(60)} archived:false stars:>500 is:public`;
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

async function searchRepos(query) {
  const url = `${API}/search/repositories?q=${encodeURIComponent(query)}&per_page=100`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (!res.ok) {
    if (res.status === 403 || res.status === 429) {
      throw new Error("GitHub's hourly limit hit. Try again in a bit.");
    }
    throw new Error(`GitHub error: ${res.status}`);
  }
  return res.json();
}

async function pickRandomRepo(mode) {
  const query = buildQuery(mode);
  const data = await searchRepos(query);
  const items = data.items || [];
  if (!items.length) throw new Error('No repos found for that mode. Try another.');
  return items[Math.floor(Math.random() * items.length)];
}

async function openRandom(mode) {
  const repo = await pickRandomRepo(mode);
  const tab = await chrome.tabs.create({ url: `https://github.com/${repo.full_name}` });
  await chrome.storage.session.set({
    [`tab:${tab.id}`]: { mode, repo }
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'openRandom') {
    openRandom(msg.mode).then(
      () => sendResponse({ ok: true }),
      err => sendResponse({ ok: false, error: err.message || String(err) })
    );
    return true;
  }
  if (msg.action === 'getOverlayContext') {
    const tabId = sender.tab && sender.tab.id;
    if (!tabId) { sendResponse(null); return false; }
    const key = `tab:${tabId}`;
    chrome.storage.session.get(key).then(
      result => sendResponse(result[key] || null),
      () => sendResponse(null)
    );
    return true;
  }
});

chrome.tabs.onRemoved.addListener(tabId => {
  chrome.storage.session.remove(`tab:${tabId}`).catch(() => {});
});
