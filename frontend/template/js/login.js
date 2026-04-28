// Модальное окно восстановления пароля
const forgotLink = document.getElementById('forgotPasswordLink');
const forgotModal = document.getElementById('forgotModal');
const closeForgotModal = document.getElementById('closeForgotModal');

function openForgotModal() {
    forgotModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeForgotModalFunc() {
    forgotModal.classList.remove('active');
    document.body.style.overflow = '';
}

forgotLink?.addEventListener('click', (e) => {
    e.preventDefault();
    openForgotModal();
});

closeForgotModal?.addEventListener('click', closeForgotModalFunc);
forgotModal?.addEventListener('click', (e) => {
    if (e.target === forgotModal) closeForgotModalFunc();
});

// Форма входа
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const login = loginForm.querySelector('input[name="login"]').value;
    const password = loginForm.querySelector('input[name="password"]').value;
    
    if (login === 'alex@imprezzio.ru' && password === 'password123') {
        window.location.href = '../index.html';
    } else {
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
});

// Форма восстановления
document.getElementById('forgotForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Ссылка для восстановления пароля отправлена на вашу почту');
    closeForgotModalFunc();
});