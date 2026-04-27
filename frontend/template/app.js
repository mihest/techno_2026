// Состояние
const appState = {
    currentUser: JSON.parse(localStorage.getItem('app_user') || 'null'),
    isAuthenticated: !!localStorage.getItem('app_user'),
};
function saveState() { localStorage.setItem('app_user', JSON.stringify(appState.currentUser)); }

function showToast(msg, type = '') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
}

function openModal(html) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal"><button class="modal-close">&times;</button><div>${html}</div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.modal-close').onclick = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}
