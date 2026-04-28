// Данные квестов
let moderationQuests = [
    {
        id: 1,
        title: "Тайны Старого Арбата",
        author: "alex_explorer",
        authorId: 101,
        submittedAt: "2025-04-15T14:30:00",
        status: "pending",
        description: "Увлекательный квест по историческим переулкам Арбата. Вам предстоит найти тайные знаки, разгадать загадки прошлого и узнать интересные факты о знаменитых жителях этого района.",
        district: "Арбат",
        city: "Москва",
        cover: "https://picsum.photos/id/104/400/200",
        difficulty: 3,
        duration: 90,
        ageGroup: "15-16",
        rules: "1. Следуйте указаниям карты\n2. На каждом чекпоинте отвечайте на вопросы\n3. Используйте подсказки только в крайнем случае",
        warnings: "Будьте внимательны на пешеходных переходах!",
        whatToTake: "Заряженный смартфон, вода, удобная обувь",
        categories: ["История", "Архитектура"],
        checkpoints: [
            { id: 1, title: "Памятник Окуджаве", task: "Какой инструмент изображён?", questionType: "code", correctAnswer: "гитара", hints: ["Музыкальный инструмент", "6 струн"], coords: [55.7483, 37.5907] },
            { id: 2, title: "Стена Цоя", task: "Какая песня начинается со слов 'Перемен!'?", questionType: "code", correctAnswer: "Хочу перемен", hints: ["Песня-гимн", "Название с восклицательным знаком"], coords: [55.7490, 37.5930] }
        ]
    },
    {
        id: 2,
        title: "Техно-парк Будущего",
        author: "tech_master",
        authorId: 102,
        submittedAt: "2025-04-16T10:15:00",
        status: "pending",
        description: "Исследуй технопарк и реши технологические головоломки.",
        district: "Сколково",
        city: "Москва",
        cover: "https://picsum.photos/id/0/400/200",
        difficulty: 4,
        duration: 120,
        ageGroup: "16-17",
        rules: "Используйте QR-коды для получения заданий.",
        warnings: "Не трогайте оборудование без разрешения",
        whatToTake: "Power bank, наушники",
        categories: ["Техно", "Наука"],
        checkpoints: [
            { id: 1, title: "VR-лаборатория", task: "Какой цвет у робота-помощника?", questionType: "code", correctAnswer: "синий", hints: ["Основной цвет", "Цвет неба"], coords: [55.698, 37.359] }
        ]
    },
    {
        id: 3,
        title: "Заброшенный завод",
        author: "urban_explorer",
        authorId: 106,
        submittedAt: "2025-04-17T09:00:00",
        status: "pending",
        description: "Исследование заброшенной промышленной зоны",
        district: "Красный Октябрь",
        city: "Волгоград",
        cover: "https://picsum.photos/id/15/400/200",
        difficulty: 5,
        duration: 150,
        ageGroup: "18plus",
        rules: "Не ходить в одиночку. Обязательно брать фонарик.",
        warnings: "Опасно! Местами скользко и темно",
        whatToTake: "Фонарик, перчатки, вода",
        categories: ["Мистика", "Урбанистика"],
        checkpoints: [
            { id: 1, title: "Вход в цех", task: "Сколько ступеней ведёт вниз?", questionType: "code", correctAnswer: "15", hints: ["Число", "Больше 10"], coords: [48.708, 44.513] }
        ]
    },
    {
        id: 4,
        title: "Гастрономический тур",
        author: "food_lover",
        authorId: 104,
        submittedAt: "2025-04-10T16:20:00",
        status: "approved",
        description: "Попробуй лучшие уличные закуски",
        district: "Китай-город",
        city: "Москва",
        cover: "https://picsum.photos/id/30/400/200",
        difficulty: 2,
        duration: 75,
        ageGroup: "14-15",
        rules: "Бери с собой воду и хорошее настроение.",
        warnings: "Учитывайте возможную аллергию",
        whatToTake: "Вода, деньги",
        categories: ["Еда", "Гастрономия"],
        checkpoints: []
    },
    {
        id: 5,
        title: "Граффити-тур",
        author: "street_artist",
        authorId: 105,
        submittedAt: "2025-04-05T11:00:00",
        status: "rejected",
        description: "Найди лучшие уличные работы",
        district: "Центр",
        city: "СПб",
        cover: "https://picsum.photos/id/96/400/200",
        difficulty: 2,
        duration: 60,
        ageGroup: "14-15",
        rules: "Уважай чужое творчество.",
        warnings: "Не прикасайся к свежим рисункам",
        whatToTake: "Фотоаппарат",
        categories: ["Искусство", "Урбанистика"],
        checkpoints: []
    }
];

let currentStatus = "pending";

function updateStats() {
    const pending = moderationQuests.filter(q => q.status === "pending").length;
    const approved = moderationQuests.filter(q => q.status === "approved").length;
    const rejected = moderationQuests.filter(q => q.status === "rejected").length;
    const total = moderationQuests.length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedCount').textContent = approved;
    document.getElementById('rejectedCount').textContent = rejected;
    document.getElementById('totalCount').textContent = total;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderQuestsList() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortSelect').value;
    
    let filtered = moderationQuests.filter(q => q.status === currentStatus);
    
    if (searchTerm) {
        filtered = filtered.filter(q => 
            q.title.toLowerCase().includes(searchTerm) || 
            q.author.toLowerCase().includes(searchTerm)
        );
    }
    
    if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    } else if (sortBy === 'oldest') {
        filtered.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    } else if (sortBy === 'author') {
        filtered.sort((a, b) => a.author.localeCompare(b.author));
    }
    
    const container = document.getElementById('questsList');
    
    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>Нет квестов в этой категории</p></div>`;
        return;
    }
    
    container.innerHTML = filtered.map(quest => `
        <div class="quest-row">
            <div class="quest-title">${escapeHtml(quest.title)}</div>
            <div class="quest-author"><i class="fas fa-user-circle"></i> ${escapeHtml(quest.author)}</div>
            <div class="quest-date"><i class="far fa-calendar-alt"></i> ${formatDate(quest.submittedAt)}</div>
            <div>
                <span class="status-badge ${quest.status === 'pending' ? 'status-pending' : quest.status === 'approved' ? 'status-approved' : 'status-rejected'}">
                    <i class="fas ${quest.status === 'pending' ? 'fa-hourglass-half' : quest.status === 'approved' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${quest.status === 'pending' ? 'На модерации' : quest.status === 'approved' ? 'Одобрен' : 'Отклонён'}
                </span>
            </div>
            <div>
                <button class="view-btn" onclick="window.location.href='moderation-review.html?id=${quest.id}'">
                    <i class="fas fa-eye"></i> Просмотр
                </button>
            </div>
        </div>
    `).join('');
}

// Инициализация событий
document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentStatus = tab.dataset.status;
        renderQuestsList();
    });
});

document.getElementById('searchInput')?.addEventListener('input', () => renderQuestsList());
document.getElementById('sortSelect')?.addEventListener('change', () => renderQuestsList());

// Загрузка
updateStats();
renderQuestsList();