// Модальное окно жалобы
const reportModal = document.getElementById('reportModal');
const closeModalBtn = document.getElementById('closeModalBtn');

window.showReportModal = function() {
    reportModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReportModal() {
    reportModal.classList.remove('active');
    document.body.style.overflow = '';
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeReportModal);
}

if (reportModal) {
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) closeReportModal();
    });
}

// Данные квеста
const urlParams = new URLSearchParams(window.location.search);
const questId = parseInt(urlParams.get('id')) || 1;

const questDetailData = {
    id: questId,
    title: "Тайны Старого Арбата",
    description: "Увлекательный квест по историческим переулкам Арбата. Вам предстоит найти тайные знаки, разгадать загадки прошлого и узнать интересные факты о знаменитых жителях этого района. Маршрут проходит через самые живописные места, включая легендарные дворики и памятники архитектуры.",
    cover: "https://picsum.photos/id/104/1200/500",
    district: "Арбат",
    city: "Москва",
    difficulty: 3,
    duration: 90,
    checkpoints: 5,
    ageGroup: "15-16",
    rules: "1. Следуйте указаниям карты\n2. На каждом чекпоинте отвечайте на вопросы\n3. Используйте подсказки только в крайнем случае\n4. Соблюдайте правила дорожного движения\n5. Уважайте местных жителей",
    warnings: "Будьте внимательны на пешеходных переходах! Возьмите с собой воду и заряженный телефон. В некоторых местах может не работать мобильный интернет.",
    whatToTake: "• Заряженный смартфон\n• Наушники\n• Бутылка воды\n• Удобная обувь\n• Зарядное устройство (power bank)"
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

function renderQuestDetail() {
    const container = document.getElementById('questDetail');
    if (!container) return;
    
    container.innerHTML = `
        <div class="quest-detail-wrapper">
            <div class="quest-hero">
                <div class="quest-hero-cover" style="background-image: url('${questDetailData.cover}');">
                    <div class="quest-hero-overlay"></div>
                </div>
                <div class="quest-hero-content">
                    <h1 class="quest-detail-title">${questDetailData.title}</h1>
                    <div class="quest-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${questDetailData.district}, ${questDetailData.city}</span>
                    </div>
                </div>
            </div>
            
            <div class="quest-content-grid">
                <div class="quest-main-info">
                    <div class="info-cards-row">
                        <div class="info-chip">
                            <div class="difficulty-stars">${getDifficultyStars(questDetailData.difficulty)}</div>
                            <span>${getDifficultyLevel(questDetailData.difficulty)}</span>
                        </div>
                        <div class="info-chip">
                            <i class="fas fa-clock"></i>
                            <span>${questDetailData.duration} минут</span>
                        </div>
                        <div class="info-chip">
                            <i class="fas fa-route"></i>
                            <span>${questDetailData.checkpoints} точек</span>
                        </div>
                        <div class="info-chip">
                            <i class="fas fa-users"></i>
                            <span>${questDetailData.ageGroup} лет</span>
                        </div>
                    </div>
                    
                    <div class="detail-block">
                        <h3><i class="fas fa-book-open"></i> Описание</h3>
                        <p>${questDetailData.description}</p>
                    </div>
                    
                    <div class="detail-block">
                        <h3><i class="fas fa-gavel"></i> Правила</h3>
                        <div class="content-box">${questDetailData.rules.replace(/\n/g, '<br>')}</div>
                    </div>
                    
                    <div class="detail-block">
                        <h3><i class="fas fa-exclamation-triangle"></i> Важные предупреждения</h3>
                        <div class="alert alert-warning">${questDetailData.warnings}</div>
                    </div>
                    
                    <div class="detail-block">
                        <h3><i class="fas fa-backpack"></i> Что взять с собой</h3>
                        <div class="content-box">${questDetailData.whatToTake.replace(/\n/g, '<br>')}</div>
                    </div>
                </div>
                
                <div class="quest-sidebar">
                    <div class="action-card">
                        <div class="action-card-icon">
                            <i class="fas fa-face-grin-stars"></i>
                        </div>
                        <h4>Готов к приключению?</h4>
                        <p>Нажми на кнопку и начни прохождение квеста прямо сейчас!</p>
                        <button class="btn btn-primary" onclick="startQuest()">
                            <i class="fas fa-play"></i> Начать квест
                        </button>
                        <button class="btn btn-outline" onclick="showReportModal()">
                            <i class="fas fa-flag"></i> Пожаловаться
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function startQuest() {
    window.location.href = `quest-play.html?id=${questDetailData.id}`;
}

const reportForm = document.getElementById('reportForm');
if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Жалоба отправлена модератору. Спасибо за бдительность!');
        closeReportModal();
        reportForm.reset();
    });
}

renderQuestDetail();