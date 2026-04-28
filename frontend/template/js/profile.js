// Переключение вкладок
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const activeTab = document.getElementById(`${tabId}-tab`);
        if (activeTab) activeTab.classList.add('active');
    });
});

// Модальное окно редактирования профиля
const editProfileBtn = document.getElementById('editProfileBtn');
const editModal = document.getElementById('editProfileModal');
const closeEditModal = document.getElementById('closeEditModal');
const birthdateInput = document.getElementById('birthdateInput');
const birthdateText = document.getElementById('birthdateText');

function formatDateToRussian(dateString) {
    const date = new Date(dateString);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const age = calculateAge(dateString);
    return `${day} ${month} ${year} (${age} лет)`;
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function openEditModal() {
    editModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEditModalFunc() {
    editModal.classList.remove('active');
    document.body.style.overflow = '';
}

editProfileBtn?.addEventListener('click', openEditModal);
closeEditModal?.addEventListener('click', closeEditModalFunc);
editModal?.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModalFunc();
});

// Сохранение данных профиля
document.getElementById('editProfileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newBirthdate = birthdateInput.value;
    if (newBirthdate) {
        birthdateText.textContent = formatDateToRussian(newBirthdate);
    }
    alert('Данные профиля успешно обновлены!');
    closeEditModalFunc();
});

// Модальные окна команд
const createTeamBtn = document.getElementById('createTeamBtn');
const joinTeamBtn = document.getElementById('joinTeamBtn');
const createModal = document.getElementById('createTeamModal');
const joinModal = document.getElementById('joinTeamModal');
const closeCreateModal = document.getElementById('closeCreateModal');
const closeJoinModal = document.getElementById('closeJoinModal');

function openCreateModal() {
    createModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openJoinModal() {
    joinModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCreateModalFunc() {
    createModal.classList.remove('active');
    document.body.style.overflow = '';
}

function closeJoinModalFunc() {
    joinModal.classList.remove('active');
    document.body.style.overflow = '';
}

createTeamBtn?.addEventListener('click', openCreateModal);
joinTeamBtn?.addEventListener('click', openJoinModal);
closeCreateModal?.addEventListener('click', closeCreateModalFunc);
closeJoinModal?.addEventListener('click', closeJoinModalFunc);

createModal?.addEventListener('click', (e) => {
    if (e.target === createModal) closeCreateModalFunc();
});
joinModal?.addEventListener('click', (e) => {
    if (e.target === joinModal) closeJoinModalFunc();
});

// Обработка форм
document.getElementById('createTeamForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const teamName = e.target.querySelector('input[name="teamName"]').value;
    alert(`Команда "${teamName}" создана! Код команды: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    closeCreateModalFunc();
    e.target.reset();
});

document.getElementById('joinTeamForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Вы успешно вступили в команду!');
    closeJoinModalFunc();
    e.target.reset();
});