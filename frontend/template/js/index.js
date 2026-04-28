// Данные квестов
const questsData = [
    { id: 1, title: "Тайны Старого Арбата", description: "Прогулка по историческим переулкам с загадками прошлого", cover: "https://picsum.photos/id/104/400/200", district: "Арбат", city: "Москва", difficulty: 3, duration: 90, checkpoints: 5, ageGroup: "15-16", categories: ["history", "urban"], status: "active", createdAt: "2025-03-15" },
    { id: 2, title: "Техно-квест Цифровой мир", description: "Исследуй технопарк и реши технологические головоломки", cover: "https://picsum.photos/id/0/400/200", district: "Сколково", city: "Москва", difficulty: 4, duration: 120, checkpoints: 7, ageGroup: "16-17", categories: ["tech"], status: "active", createdAt: "2025-03-20" },
    { id: 3, title: "Граффити-тур", description: "Найди лучшие уличные работы и узнай истории их создания", cover: "https://picsum.photos/id/96/400/200", district: "Центр", city: "СПб", difficulty: 2, duration: 60, checkpoints: 4, ageGroup: "14-15", categories: ["art", "urban"], status: "active", createdAt: "2025-03-10" },
    { id: 4, title: "Заброшенный завод", description: "Мистическое приключение по индустриальным руинам", cover: "https://picsum.photos/id/15/400/200", district: "Красный Октябрь", city: "Волгоград", difficulty: 5, duration: 150, checkpoints: 8, ageGroup: "18plus", categories: ["urban", "mystic"], status: "active", createdAt: "2025-03-05" },
    { id: 5, title: "Гастрономический квест", description: "Попробуй лучшие уличные закуски", cover: "https://picsum.photos/id/30/400/200", district: "Китай-город", city: "Москва", difficulty: 2, duration: 75, checkpoints: 5, ageGroup: "14-15", categories: ["food", "urban"], status: "active", createdAt: "2025-03-18" },
    { id: 6, title: "Спортивный QR-челлендж", description: "Физическая активность + головоломки", cover: "https://picsum.photos/id/20/400/200", district: "Сокольники", city: "Москва", difficulty: 4, duration: 100, checkpoints: 6, ageGroup: "16-17", categories: ["sport", "urban"], status: "active", createdAt: "2025-03-12" },
    { id: 7, title: "Архитектурный код", description: "Разгадай тайны модернизма и сталинских высоток", cover: "https://picsum.photos/id/12/400/200", district: "Центр", city: "Москва", difficulty: 3, duration: 85, checkpoints: 5, ageGroup: "15-16", categories: ["history", "urban"], status: "active", createdAt: "2025-02-20" },
    { id: 8, title: "Музыкальный перекресток", description: "Места известных музыкантов", cover: "https://picsum.photos/id/29/400/200", district: "Василеостровский", city: "СПб", difficulty: 1, duration: 50, checkpoints: 4, ageGroup: "14-15", categories: ["art"], status: "active", createdAt: "2025-03-08" },
    { id: 9, title: "Научный квест Оптика", description: "Физические опыты и эксперименты", cover: "https://picsum.photos/id/1/400/200", district: "Воробьёвы горы", city: "Москва", difficulty: 4, duration: 110, checkpoints: 6, ageGroup: "16-17", categories: ["tech"], status: "active", createdAt: "2025-03-14" },
    { id: 10, title: "Киберпанк-район", description: "Неоновые улицы и инсталляции", cover: "https://picsum.photos/id/4/400/200", district: "Деловой центр", city: "Москва", difficulty: 5, duration: 135, checkpoints: 7, ageGroup: "18plus", categories: ["urban", "tech"], status: "active", createdAt: "2025-03-17" },
    { id: 11, title: "Эко-тропа Лосиный остров", description: "Природа в мегаполисе", cover: "https://picsum.photos/id/15/400/200", district: "Лосиный остров", city: "Москва", difficulty: 2, duration: 70, checkpoints: 5, ageGroup: "14-15", categories: ["nature"], status: "active", createdAt: "2025-03-19" },
    { id: 12, title: "Игровая индустрия", description: "Офисы разработчиков игр", cover: "https://picsum.photos/id/26/400/200", district: "Красная Пресня", city: "Москва", difficulty: 3, duration: 95, checkpoints: 5, ageGroup: "16-17", categories: ["tech"], status: "active", createdAt: "2025-03-16" }
];

let currentPage = 1;
let itemsPerPage = 9;
let currentFilters = {
    categories: [],
    difficulty: 'all',
    age: 'all',
    maxDuration: 240,
    nearMe: false,
    radius: 1000,
    sort: 'new'
};

function getDifficultyStars(difficulty) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= difficulty ? '<i class="fas fa-star star-active"></i>' : '<i class="fas fa-star star-inactive"></i>';
    }
    return stars;
}

function getDifficultyLevel(difficulty) {
    if (difficulty <= 2) return 'Мне только спросить';
    if (difficulty === 3) return 'Я бы ещё поиграл';
    return 'Работают профи';
}

function getCategoryName(cat) {
    const names = { history: 'История', urban: 'Город', tech: 'Техно', nature: 'Природа', art: 'Искусство', food: 'Еда', mystic: 'Мистика', sport: 'Спорт' };
    return names[cat] || cat;
}

function filterQuests() {
    let filtered = [...questsData];
    
    if (currentFilters.categories.length > 0) {
        filtered = filtered.filter(q => q.categories.some(cat => currentFilters.categories.includes(cat)));
    }
    
    if (currentFilters.difficulty !== 'all') {
        if (currentFilters.difficulty === 'easy') filtered = filtered.filter(q => q.difficulty <= 2);
        else if (currentFilters.difficulty === 'medium') filtered = filtered.filter(q => q.difficulty === 3);
        else if (currentFilters.difficulty === 'hard') filtered = filtered.filter(q => q.difficulty >= 4);
    }
    
    if (currentFilters.age !== 'all') {
        filtered = filtered.filter(q => q.ageGroup === currentFilters.age);
    }
    
    filtered = filtered.filter(q => q.duration <= currentFilters.maxDuration);
    filtered = filtered.filter(q => q.status === 'active');
    
    switch(currentFilters.sort) {
        case 'new': filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
        case 'old': filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
        case 'hard': filtered.sort((a, b) => b.difficulty - a.difficulty); break;
        case 'easy': filtered.sort((a, b) => a.difficulty - b.difficulty); break;
    }
    
    return filtered;
}

function renderQuests() {
    const filtered = filterQuests();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const pageQuests = filtered.slice(start, start + itemsPerPage);
    
    const grid = document.getElementById('questsGrid');
    if (pageQuests.length === 0) {
        grid.innerHTML = `<div class="empty-state"><i class="fas fa-map-marked-alt"></i><p>Квестов не найдено</p><p>Попробуйте изменить параметры фильтрации</p></div>`;
    } else {
        grid.innerHTML = pageQuests.map(quest => `
            <div class="quest-card">
                <div class="quest-cover" style="background-image: url('${quest.cover}');"></div>
                <div class="quest-info">
                    <h3 class="quest-title">${quest.title}</h3>
                    <div class="categories-tags">
                        ${quest.categories.map(c => `<span class="category-tag">${getCategoryName(c)}</span>`).join('')}
                    </div>
                    <div class="quest-meta">
                        <span><i class="fas fa-users"></i> ${quest.ageGroup} лет</span>
                        <span><i class="fas fa-clock"></i> ${quest.duration} мин</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${quest.checkpoints} точек</span>
                    </div>
                    <div class="quest-meta">
                        <span class="difficulty-stars">${getDifficultyStars(quest.difficulty)}</span>
                        <span>${getDifficultyLevel(quest.difficulty)}</span>
                    </div>
                    <p class="quest-description">${quest.description}</p>
                    <div class="quest-buttons">
                        <button class="btn btn-primary" onclick="startQuest(${quest.id})"><i class="fas fa-play"></i> Начать</button>
                        <button class="btn btn-outline" onclick="showQuestDetail(${quest.id})"><i class="fas fa-info-circle"></i> Детали</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    const paginationDiv = document.getElementById('pagination');
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let pagHtml = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        pagHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    pagHtml += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    paginationDiv.innerHTML = pagHtml;
}

function changePage(page) {
    const filtered = filterQuests();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderQuests();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function startQuest(questId) { window.location.href = `quest-play.html?id=${questId}`; }
function showQuestDetail(questId) { window.location.href = `quest-detail.html?id=${questId}`; }

function initFilters() {
    document.querySelectorAll('.category-chip').forEach(el => {
        el.addEventListener('click', () => {
            const cat = el.dataset.cat;
            const idx = currentFilters.categories.indexOf(cat);
            idx === -1 ? currentFilters.categories.push(cat) : currentFilters.categories.splice(idx, 1);
            el.classList.toggle('active');
            currentPage = 1;
            renderQuests();
        });
    });
    
    document.getElementById('difficultySelect').addEventListener('change', (e) => { currentFilters.difficulty = e.target.value; currentPage = 1; renderQuests(); });
    document.getElementById('ageSelect').addEventListener('change', (e) => { currentFilters.age = e.target.value; currentPage = 1; renderQuests(); });
    document.getElementById('durationSelect').addEventListener('change', (e) => {
        currentFilters.maxDuration = e.target.value === 'all' ? 240 : parseInt(e.target.value);
        currentPage = 1;
        renderQuests();
    });
    document.getElementById('sortSelect').addEventListener('change', (e) => { currentFilters.sort = e.target.value; currentPage = 1; renderQuests(); });
    
    const nearMeCheckbox = document.getElementById('nearMeCheckbox');
    const radiusContainer = document.getElementById('radiusContainer');
    nearMeCheckbox.addEventListener('change', (e) => {
        currentFilters.nearMe = e.target.checked;
        radiusContainer.classList.toggle('active', e.target.checked);
        if (e.target.checked && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => console.log('Location:', pos.coords),
                () => alert('Не удалось получить местоположение')
            );
        }
        renderQuests();
    });
    
    document.getElementById('radiusValue').addEventListener('change', (e) => { currentFilters.radius = parseInt(e.target.value); renderQuests(); });
    
    document.getElementById('resetFilters').addEventListener('click', () => {
        currentFilters = { categories: [], difficulty: 'all', age: 'all', maxDuration: 240, nearMe: false, radius: 1000, sort: 'new' };
        document.querySelectorAll('.category-chip').forEach(el => el.classList.remove('active'));
        document.getElementById('difficultySelect').value = 'all';
        document.getElementById('ageSelect').value = 'all';
        document.getElementById('durationSelect').value = 'all';
        document.getElementById('sortSelect').value = 'new';
        document.getElementById('nearMeCheckbox').checked = false;
        document.getElementById('radiusContainer').classList.remove('active');
        currentPage = 1;
        renderQuests();
    });
}

renderQuests();
initFilters();