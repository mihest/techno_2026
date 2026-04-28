const form = document.getElementById('registerForm');
const submitBtn = document.getElementById('submitBtn');
const agreeCheckbox = document.getElementById('agreeRules');
const passwordField = document.getElementById('password');
const confirmField = document.getElementById('confirmPassword');
const usernameField = document.getElementById('username');
const emailField = document.getElementById('email');

function validateForm() {
    const isAgreed = agreeCheckbox.checked;
    const isPasswordValid = passwordField.value.length >= 6 && 
                            passwordField.value !== '123456' && 
                            passwordField.value !== 'qwerty';
    const isConfirmValid = passwordField.value === confirmField.value;
    const isUsernameValid = /^[a-zA-Z0-9_]{4,20}$/.test(usernameField.value);
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value);
    
    submitBtn.disabled = !(isAgreed && isPasswordValid && isConfirmValid && isUsernameValid && isEmailValid);
}

agreeCheckbox?.addEventListener('change', validateForm);
passwordField?.addEventListener('input', validateForm);
confirmField?.addEventListener('input', validateForm);
usernameField?.addEventListener('input', validateForm);
emailField?.addEventListener('input', validateForm);

form?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (passwordField.value !== confirmField.value) {
        alert('Пароли не совпадают!');
        return;
    }
    
    if (passwordField.value === '123456' || passwordField.value === 'qwerty') {
        alert('Пароль слишком простой! Придумайте более сложный пароль.');
        return;
    }
    
    alert('Регистрация успешна! Добро пожаловать в Imprezzio:Path!');
    window.location.href = '../index.html';
});

validateForm();