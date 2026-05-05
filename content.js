(async function () {
  if (!isRepoPage()) return;

  let ctx;
  try {
    ctx = await chrome.runtime.sendMessage({ action: 'getOverlayContext' });
  } catch (_) {
    return;
  }
  if (!ctx || !ctx.repo) return;

  renderOverlay(ctx.mode, ctx.repo);
})();

function isRepoPage() {
  const m = location.pathname.match(/^\/([^/]+)\/([^/]+)\/?$/);
  if (!m) return false;
  const reserved = new Set([
    'settings', 'marketplace', 'explore', 'topics', 'collections',
    'trending', 'features', 'pricing', 'sponsors', 'about', 'contact',
    'security', 'login', 'join', 'organizations', 'notifications',
    'pulls', 'issues', 'codespaces', 'gist', 'new', 'search'
  ]);
  return !reserved.has(m[1]);
}

function modeEmoji(mode) {
  return { lucky: '🍀', words: '✏️', beginner: '🌱', deeper: '🔧' }[mode] || '🎲';
}

function modeLabel(mode) {
  return {
    lucky: "I'm Feeling Lucky",
    words: 'Words',
    beginner: 'Beginner code',
    deeper: 'Deeper code'
  }[mode] || 'Random';
}

function renderOverlay(mode, repo) {
  const card = document.createElement('div');
  card.id = 'rg-card';
  card.innerHTML = `
    <div class="rg-card-header">
      <span class="rg-card-emoji">${modeEmoji(mode)}</span>
      <span class="rg-card-mode">${modeLabel(mode)}</span>
      <button class="rg-card-close" title="Dismiss" aria-label="Dismiss">×</button>
    </div>
    <div class="rg-card-body">${renderBody(repo)}</div>
    <div class="rg-card-footer">
      <button class="rg-card-reroll">
        <span class="rg-dice">🎲</span>
        <span>Try another</span>
      </button>
    </div>
  `;
  document.body.appendChild(card);

  card.querySelector('.rg-card-close').addEventListener('click', () => card.remove());

  const rerollBtn = card.querySelector('.rg-card-reroll');
  rerollBtn.addEventListener('click', async () => {
    rerollBtn.disabled = true;
    rerollBtn.querySelector('.rg-dice').classList.add('spinning');
    try {
      await chrome.runtime.sendMessage({ action: 'openRandom', mode });
    } catch (_) { /* swallow */ }
    setTimeout(() => {
      rerollBtn.disabled = false;
      rerollBtn.querySelector('.rg-dice').classList.remove('spinning');
    }, 600);
  });
}

function renderBody(repo) {
  const lines = [];

  if (repo.description) {
    lines.push(`<div class="rg-desc">${escape(repo.description)}</div>`);
  }

  const days = Math.floor((Date.now() - new Date(repo.pushed_at).getTime()) / 86400000);
  const ago = days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
  lines.push(row('Last update', ago));

  if (repo.language) lines.push(row('Language', escape(repo.language)));
  if (repo.license && repo.license.spdx_id) lines.push(row('License', escape(repo.license.spdx_id)));
  lines.push(row('Stars', String(repo.stargazers_count)));
  lines.push(row('Open issues', String(repo.open_issues_count)));

  if (repo.topics && repo.topics.length) {
    const chips = repo.topics.slice(0, 5).map(t => `<span class="rg-topic">${escape(t)}</span>`).join('');
    lines.push(`<div class="rg-topics">${chips}</div>`);
  }

  return lines.join('');
}

function row(key, val) {
  return `<div class="rg-row"><span class="rg-key">${key}</span><span class="rg-val">${val}</span></div>`;
}

function escape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
