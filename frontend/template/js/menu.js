// Бургер-меню
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenuBtn = document.getElementById('closeMenuBtn');

function openMenu() {
    mobileMenu.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    mobileMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

burgerBtn?.addEventListener('click', openMenu);
closeMenuBtn?.addEventListener('click', closeMenu);
menuOverlay?.addEventListener('click', closeMenu);

// Выход из аккаунта
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

function isAuthorized() {
    if (!window.AuthApi?.getSession) return false;
    const session = window.AuthApi.getSession();
    return Boolean(session?.accessToken);
}

function updateAuthButtonsVisibility() {
    const authorized = isAuthorized();
    if (loginBtn) loginBtn.style.display = authorized ? 'none' : 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = authorized ? 'inline-flex' : 'none';
    if (mobileLogoutBtn) mobileLogoutBtn.style.display = authorized ? 'inline-flex' : 'none';
}

async function handleLogout() {
    if (!confirm('Вы уверены, что хотите выйти из аккаунта?')) return;

    try {
        if (window.AuthApi?.signOut) {
            await window.AuthApi.signOut();
        } else {
            localStorage.removeItem('imprezzio_auth');
            localStorage.removeItem('app_user');
        }
    } finally {
        window.location.href = 'login';
    }
}

logoutBtn?.addEventListener('click', handleLogout);
mobileLogoutBtn?.addEventListener('click', handleLogout);
updateAuthButtonsVisibility();