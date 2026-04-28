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
const logoutBtn = document.getElementById('logoutBtn');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

function handleLogout() {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
        window.location.href = 'login.html';
    }
}

logoutBtn?.addEventListener('click', handleLogout);
mobileLogoutBtn?.addEventListener('click', handleLogout);