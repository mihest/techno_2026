document.getElementById('tabLogin').onclick = () => {
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('tabRegister').classList.remove('active');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
};
document.getElementById('tabRegister').onclick = () => {
    document.getElementById('tabRegister').classList.add('active');
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
};
document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type=email]').value;
    const pwd = e.target.querySelector('input[type=password]').value;
    setTimeout(() => location.href = 'index.html', 500);
};
document.getElementById('registerForm').onsubmit = (e) => {
    e.preventDefault();
    setTimeout(() => location.href = 'index.html', 500);
};