document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mode').forEach(btn => {
    btn.addEventListener('click', async () => {
      const mode = btn.dataset.mode;
      setBusy(true);
      hideError();

      const mascot = document.getElementById('mascot');
      mascot.classList.remove('hopping');
      void mascot.offsetWidth;
      mascot.classList.add('hopping');
      await new Promise(r => setTimeout(r, 400));

      try {
        const res = await chrome.runtime.sendMessage({ action: 'openRandom', mode });
        if (res && res.ok === false) {
          showError(res.error || 'Something went wrong.');
        } else {
          window.close();
        }
      } catch (e) {
        showError(e.message || String(e));
      } finally {
        setBusy(false);
      }
    });
  });
});

function setBusy(busy) {
  document.querySelectorAll('.mode').forEach(b => {
    if (busy) b.setAttribute('disabled', 'true');
    else b.removeAttribute('disabled');
  });
}

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError() {
  document.getElementById('error').classList.add('hidden');
}
