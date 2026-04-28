// Данные квеста с 3 чекпоинтами
const quest = {
    id: 1,
    title: "Тайны Старого Арбата",
    author: "alex_explorer",
    authorId: 101,
    submittedAt: "2025-04-15T14:30:00",
    status: "pending",
    description: "Увлекательный квест по историческим переулкам Арбата. Вам предстоит найти тайные знаки, разгадать загадки прошлого и узнать интересные факты о знаменитых жителях этого района. Маршрут проходит через самые живописные места, включая легендарные дворики и памятники архитектуры.",
    district: "Арбат",
    city: "Москва",
    cover: "https://picsum.photos/id/104/800/400",
    difficulty: 3,
    duration: 90,
    ageGroup: "15-16",
    rules: "1. Следуйте указаниям карты\n2. На каждом чекпоинте отвечайте на вопросы\n3. Используйте подсказки только в крайнем случае\n4. Соблюдайте правила дорожного движения",
    warnings: "Будьте внимательны на пешеходных переходах! Возьмите с собой воду и заряженный телефон.",
    whatToTake: "Заряженный смартфон, вода, удобная обувь, наушники, power bank",
    categories: ["История", "Архитектура", "Культура"],
    checkpoints: [
        { 
            id: 1, 
            title: "Памятник Булату Окуджаве", 
            task: "Какой музыкальный инструмент изображён в руках у поэта?", 
            questionType: "code", 
            correctAnswer: "гитара", 
            hints: ["Струнный инструмент", "6 струн", "Инструмент бардов"],
            coords: [55.7483, 37.5907] 
        },
        { 
            id: 2, 
            title: "Стена Виктора Цоя", 
            task: "Какая известная песня Виктора Цоя начинается со слов 'Перемен!'?", 
            questionType: "code", 
            correctAnswer: "Хочу перемен", 
            hints: ["Песня стала гимном перестройки", "Название содержит восклицательный знак", "Песня о желании изменений"],
            coords: [55.7490, 37.5930] 
        },
        { 
            id: 3, 
            title: "Театр имени Вахтангова", 
            task: "В каком году был основан этот театр?", 
            questionType: "choice", 
            options: ["1918", "1921", "1924", "1930"],
            correctOption: 1,
            hints: ["Основан в начале 1920-х", "Связан с именем известного режиссёра", "Год основания - 1921"],
            coords: [55.7503, 37.5945] 
        }
    ]
};

let reviewMap = null;
let isRejectMode = false;

function getDifficultyStars(difficulty) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= difficulty ? '<i class="fas fa-star" style="color: var(--yellow);"></i>' : '<i class="fas fa-star" style="color: var(--border);"></i>';
    }
    return stars;
}

function getDifficultyLevel(difficulty) {
    if (difficulty <= 2) return 'Мне только спросить';
    if (difficulty === 3) return 'Я бы ещё поиграл';
    return 'Работают профи';
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
    }).replace(/\n/g, '<br>');
}

function initMap(checkpoints) {
    if (typeof ymaps === 'undefined') {
        console.error('Yandex Maps API not loaded');
        return;
    }
    
    ymaps.ready(() => {
        const center = checkpoints.length > 0 ? checkpoints[0].coords : [55.751574, 37.573856];
        if (reviewMap) {
            reviewMap.destroy();
        }
        reviewMap = new ymaps.Map('reviewMap', {
            center: center,
            zoom: 14,
            controls: ['zoomControl', 'fullscreenControl']
        });
        
        // Добавляем маркеры для всех чекпоинтов
        checkpoints.forEach((cp, idx) => {
            const hintContent = cp.hints ? `<br><br><strong>Подсказки:</strong> ${cp.hints.join(' • ')}` : '';
            const answerText = cp.questionType === 'code' ? cp.correctAnswer : (cp.options ? cp.options[cp.correctOption] : '');
            
            const placemark = new ymaps.Placemark(cp.coords, {
                balloonContent: `
                    <div style="font-family: Montserrat, sans-serif; max-width: 250px;">
                        <strong style="color: #00D3F4;">${idx + 1}. ${escapeHtml(cp.title)}</strong><br>
                        <strong>Задание:</strong> ${escapeHtml(cp.task)}<br>
                        <strong>Тип:</strong> ${cp.questionType === 'code' ? 'Код-слово' : 'Вопрос с вариантами'}<br>
                        <strong>Правильный ответ:</strong> ${escapeHtml(answerText)}<br>
                        ${hintContent}
                    </div>
                `
            }, {
                preset: 'islands#redIcon'
            });
            reviewMap.geoObjects.add(placemark);
        });
        
        // Автоматически подстраиваем зум под все точки
        if (checkpoints.length > 1) {
            const bounds = reviewMap.geoObjects.getBounds();
            if (bounds) reviewMap.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
        }
    });
}

function renderQuest() {
    const container = document.getElementById('questContent');
    
    // Формируем HTML для чекпоинтов
    let checkpointsHtml = '';
    quest.checkpoints.forEach((cp, idx) => {
        const answerText = cp.questionType === 'code' ? cp.correctAnswer : (cp.options ? cp.options[cp.correctOption] : '');
        const typeText = cp.questionType === 'code' ? 'Код-слово' : 'Вопрос с вариантами';
        
        checkpointsHtml += `
            <div class="checkpoint-item">
                <div class="checkpoint-header">
                    <span class="checkpoint-number"><i class="fas fa-map-pin"></i> Чекпоинт ${idx + 1}</span>
                    <span class="checkpoint-type"><i class="fas fa-tag"></i> ${typeText}</span>
                </div>
                <div class="checkpoint-title">${escapeHtml(cp.title)}</div>
                <div class="checkpoint-task"><i class="fas fa-question-circle"></i> ${escapeHtml(cp.task)}</div>
                <div class="checkpoint-answer">
                    <i class="fas fa-check-circle" style="color: var(--neon-green);"></i> 
                    <strong>Правильный ответ:</strong> ${escapeHtml(answerText)}
                </div>
                ${cp.hints ? `
                    <div class="checkpoint-hints">
                        <i class="fas fa-lightbulb" style="color: var(--cyan);"></i>
                        <strong>Подсказки:</strong>
                        ${cp.hints.map(hint => `<span class="hint-tag">${escapeHtml(hint)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="checkpoint-coords">
                    <i class="fas fa-location-dot"></i> 
                    Координаты: ${cp.coords[0].toFixed(6)}, ${cp.coords[1].toFixed(6)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = `
        <!-- Шапка квеста -->
        <div class="quest-header">
            <h1><i class="fas fa-route"></i> ${escapeHtml(quest.title)}</h1>
            <div class="quest-meta-row">
                <span class="meta-item"><i class="fas fa-user"></i> Автор: ${escapeHtml(quest.author)}</span>
                <span class="meta-item"><i class="fas fa-calendar"></i> Дата отправки: ${formatDate(quest.submittedAt)}</span>
                <span class="status-badge status-pending">
                    <i class="fas fa-hourglass-half"></i> На модерации
                </span>
            </div>
        </div>
        
        <!-- Основная сетка -->
        <div class="review-grid">
            <!-- Левая колонка -->
            <div class="left-column">
                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Основная информация</h3>
                    <div class="info-row">
                        <div class="info-label">Локация</div>
                        <div class="info-value">${escapeHtml(quest.city)}, ${escapeHtml(quest.district)}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Сложность</div>
                        <div class="info-value">
                            <div class="difficulty-stars">${getDifficultyStars(quest.difficulty)}</div>
                            <div style="margin-top: 5px;">${getDifficultyLevel(quest.difficulty)}</div>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Длительность</div>
                        <div class="info-value">${quest.duration} минут</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Возрастная группа</div>
                        <div class="info-value">${quest.ageGroup}</div>
                    </div>
                </div>
                
                <div class="info-card">
                    <h3><i class="fas fa-tags"></i> Категории</h3>
                    <div class="categories-list">
                        ${quest.categories.map(cat => `<span class="category-badge">${escapeHtml(cat)}</span>`).join('')}
                    </div>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-image"></i> Обложка квеста</h3>
                    <img src="${quest.cover}" class="cover-image" alt="Обложка">
                </div>
                
                <div class="info-card">
                    <h3><i class="fas fa-align-left"></i> Описание</h3>
                    <p>${escapeHtml(quest.description)}</p>
                </div>
                
                <div class="info-card">
                    <h3><i class="fas fa-gavel"></i> Правила</h3>
                    <p>${escapeHtml(quest.rules) || 'Не указаны'}</p>
                </div>
                
                <div class="info-card">
                    <h3><i class="fas fa-exclamation-triangle"></i> Предупреждения</h3>
                    <p>${escapeHtml(quest.warnings) || 'Не указаны'}</p>
                </div>
                
                <div class="info-card">
                    <h3><i class="fas fa-backpack"></i> Что взять с собой</h3>
                    <p>${escapeHtml(quest.whatToTake) || 'Не указано'}</p>
                </div>
            </div>
            
            <!-- Правая колонка -->
            <div class="right-column">
                <div class="map-card">
                    <h3><i class="fas fa-map-marked-alt"></i> Карта маршрута</h3>
                    <div id="reviewMap"></div>
                </div>
                
                <div class="checkpoints-card">
                    <h3><i class="fas fa-list-check"></i> Чекпоинты (${quest.checkpoints.length})</h3>
                    <div class="checkpoints-list">
                        ${checkpointsHtml}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Кнопки действий -->
        <div class="action-buttons">
            <button class="btn btn-outline" id="cancelBtn" onclick="window.location.href='moderation.html'">
                <i class="fas fa-times"></i> Отмена
            </button>
            <button class="btn btn-success" id="approveBtn">
                <i class="fas fa-check-circle"></i> Одобрить квест
            </button>
            <button class="btn btn-danger" id="rejectStartBtn">
                <i class="fas fa-times-circle"></i> Отклонить квест
            </button>
        </div>
        
        <div class="reject-form" id="rejectForm">
            <h4><i class="fas fa-comment"></i> Причина отклонения</h4>
            <textarea id="rejectReason" rows="4" placeholder="Укажите причину, по которой квест отклоняется (минимум 20 символов)..."></textarea>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn btn-outline" id="cancelRejectBtn">Отмена</button>
                <button class="btn btn-danger" id="confirmRejectBtn">Подтвердить отклонение</button>
            </div>
        </div>
    `;
    
    // Инициализация карты
    setTimeout(() => {
        if (quest.checkpoints && quest.checkpoints.length > 0) {
            initMap(quest.checkpoints);
        }
    }, 200);
    
    // Обработчики событий
    document.getElementById('approveBtn')?.addEventListener('click', approveQuest);
    document.getElementById('rejectStartBtn')?.addEventListener('click', () => {
        document.getElementById('rejectForm').classList.add('active');
    });
    document.getElementById('cancelRejectBtn')?.addEventListener('click', () => {
        document.getElementById('rejectForm').classList.remove('active');
        document.getElementById('rejectReason').value = '';
    });
    document.getElementById('confirmRejectBtn')?.addEventListener('click', rejectQuest);
}

function approveQuest() {
    if (confirm(`Подтвердить одобрение квеста "${quest.title}"?`)) {
        alert(`Квест "${quest.title}" успешно одобрен и опубликован!`);
        window.location.href = 'moderation.html';
    }
}

function rejectQuest() {
    const reason = document.getElementById('rejectReason').value;
    if (reason.length < 20) {
        alert('Причина отклонения должна содержать минимум 20 символов');
        return;
    }
    if (confirm(`Вы уверены, что хотите отклонить квест "${quest.title}"?`)) {
        alert(`Квест "${quest.title}" отклонён. Причина отправлена автору.`);
        window.location.href = 'moderation.html';
    }
}

renderQuest();