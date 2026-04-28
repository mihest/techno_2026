// Копирование кода
const copyCodeBtn = document.getElementById('copyCodeBtn');
const inviteCodeSpan = document.getElementById('inviteCode');

copyCodeBtn?.addEventListener('click', () => {
    const code = inviteCodeSpan.textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Код скопирован в буфер обмена!');
    });
});

// Генерация нового кода
const generateNewCodeBtn = document.getElementById('generateNewCodeBtn');

generateNewCodeBtn?.addEventListener('click', () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    inviteCodeSpan.textContent = newCode;
    alert('Новый код приглашения сгенерирован!');
});


// Исключение участников
document.querySelectorAll('.remove-member').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const memberName = btn.closest('.member-item').querySelector('h4').textContent;
        if (confirm(`Вы уверены, что хотите исключить ${memberName} из команды?`)) {
            btn.closest('.member-item').remove();
            alert(`${memberName} исключён из команды`);
            updateMembersCount();
        }
    });
});

function updateMembersCount() {
    const members = document.querySelectorAll('.member-item').length;
    const membersSpan = document.querySelector('.team-meta span:last-child');
    if (membersSpan) {
        membersSpan.innerHTML = `<i class="fas fa-users"></i> ${members} / 6 участников`;
    }
}

// Покинуть команду
const leaveTeamBtn = document.getElementById('leaveTeamBtn');
leaveTeamBtn?.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите покинуть команду? Вы потеряете доступ к командным квестам.')) {
        alert('Вы покинули команду');
        window.location.href = 'profile.html';
    }
});

// Расформировать команду
const deleteTeamBtn = document.getElementById('deleteTeamBtn');
deleteTeamBtn?.addEventListener('click', () => {
    if (confirm('ВНИМАНИЕ! Это действие нельзя отменить. Вы уверены, что хотите расформировать команду?')) {
        alert('Команда расформирована');
        window.location.href = 'profile.html';
    }
});