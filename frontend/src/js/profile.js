const demoUser = {
    nickname: 'Игрок',
    age_group: '16-17',
    avatar: '',
    role: 'user',
    stats: {quests: 5, points: 320}
};

function updateProfileUI() {
    document.getElementById('profileNick').textContent = demoUser.nickname;
    document.getElementById('profileRole').textContent = demoUser.role === 'moderator' ? '🛡️ Модератор' : '👤 Игрок';
    document.getElementById('questCount').textContent = demoUser.stats.quests;
    document.getElementById('pointsCount').textContent = demoUser.stats.points;

    const avatarEl = document.getElementById('profileAvatar');
    if (demoUser.avatar) {
        avatarEl.innerHTML = `<img src="${demoUser.avatar}" alt="Аватар" class="avatar avatar-lg">`;
    } else {
        avatarEl.innerHTML = '<i class="fas fa-user"></i>';
    }
    document.getElementById('userNickShort').textContent = demoUser.nickname.charAt(0).toUpperCase();
}

function openEditProfileModal() {
    document.getElementById('editNickname').value = demoUser.nickname;
    document.getElementById('editAgeGroup').value = demoUser.age_group;
    document.getElementById('editAvatar').value = demoUser.avatar || '';
    document.getElementById('editProfileModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editProfileModal').classList.add('hidden');
}

function handleEditProfile(e) {
    e.preventDefault();
    const nickname = document.getElementById('editNickname').value.trim();
    const ageGroup = document.getElementById('editAgeGroup').value;
    const avatarUrl = document.getElementById('editAvatar').value.trim();

    if (!nickname) {
        alert('Никнейм обязателен');
        return;
    }

    demoUser.nickname = nickname;
    demoUser.age_group = ageGroup;
    demoUser.avatar = avatarUrl;

    updateProfileUI();
    closeEditModal();
    showToast('Профиль обновлён', 'success');
}

function resetProfile() {
    demoUser.nickname = 'Игрок';
    demoUser.age_group = '16-17';
    demoUser.avatar = '';
    demoUser.stats = {quests: 5, points: 320};
    updateProfileUI();
    showToast('Сеанс завершён', 'error');
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type || ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}