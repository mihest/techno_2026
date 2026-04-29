const API_BASE_URL = (
    window.AuthApi?.API_BASE_URL ||
    window.AUTH_API_BASE_URL ||
    localStorage.getItem('apiBaseUrl') ||
    'https://mihest.ru/api'
).replace(/\/$/, '');

const AGE_GROUP_LABELS = {
    under14: 'Мне нет 14',
    '14-15': '14-15 лет',
    '15-16': '15-16 лет',
    '16-17': '16-17 лет',
    '18plus': 'Мне есть 18',
    '5705a746-c2fc-4cbe-98d2-a9e5c076f89b': '14-15 лет',
};

let questDetailData = null;

// Модальное окно жалобы
const reportModal = document.getElementById('reportModal');
const closeModalBtn = document.getElementById('closeModalBtn');

window.showReportModal = function () {
    reportModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
};

function closeReportModal() {
    reportModal?.classList.remove('active');
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

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
}

function formatText(value) {
    return escapeHtml(value).replace(/\n/g, '<br>');
}

function getQuestId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('quest_id');
}

function getBackendErrorMessage(errorData, fallback = 'Ошибка запроса') {
    const detail = errorData?.detail || errorData?.message;

    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail
            .map((item) => {
                if (typeof item === 'string') return item;
                return item?.msg || item?.message || JSON.stringify(item);
            })
            .join('\n');
    }
    if (typeof errorData === 'string') return errorData;

    return fallback;
}

async function fetchQuestById(questId) {
    if (window.AuthApi?.authorizedFetch) {
        return window.AuthApi.authorizedFetch(`/quests/${encodeURIComponent(questId)}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });
    }

    const response = await fetch(`${API_BASE_URL}/quests/${encodeURIComponent(questId)}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: { Accept: 'application/json' },
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        throw new Error(getBackendErrorMessage(data, `HTTP ${response.status}`));
    }

    return data;
}

function resolveCoverUrl(coverFile) {
    if (!coverFile) return '';
    if (/^(https?:)?\/\//i.test(coverFile) || coverFile.startsWith('data:')) return coverFile;

    const apiUrl = new URL(API_BASE_URL, window.location.origin);
    if (coverFile.startsWith('/')) {
        return `${apiUrl.origin}${coverFile}`;
    }

    return `${API_BASE_URL}/${coverFile.replace(/^\/+/, '')}`;
}

function parseRulesWarning(value) {
    const result = { rules: '', warnings: '', whatToTake: '', raw: value || '' };
    if (!value) return result;

    value.split('\n').forEach((line) => {
        const [key, ...rest] = line.split(':');
        const text = rest.join(':').trim();
        if (!text) return;

        if (/^warnings?$/i.test(key.trim())) result.warnings = text;
        else if (/^rules?$/i.test(key.trim())) result.rules = text;
        else if (/^what to take$/i.test(key.trim())) result.whatToTake = text;
    });

    return result;
}

function getAgeGroupLabel(quest) {
    const value = quest.client_extra?.age_group?.label || quest.age_group_id;
    return AGE_GROUP_LABELS[value] || value || 'Возраст не указан';
}

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
    if (!container || !questDetailData) return;

    const checkpoints = Array.isArray(questDetailData.checkpoints) ? questDetailData.checkpoints : [];
    const rulesWarning = parseRulesWarning(questDetailData.rules_warning);
    const coverUrl = resolveCoverUrl(questDetailData.cover_file);
    const location = questDetailData.city_district || 'Локация не указана';
    const rulesText = rulesWarning.rules || 'Правила не указаны';
    const warningsText = rulesWarning.warnings || 'Предупреждения не указаны';
    const whatToTakeText = rulesWarning.whatToTake || 'Список не указан';

    container.innerHTML = `
        <div class="quest-detail-wrapper">
            <div class="quest-hero">
                <div class="quest-hero-cover" style="background-image: url('${escapeAttr(coverUrl || '')}');">
                    <div class="quest-hero-overlay"></div>
                </div>
                <div class="quest-hero-content">
                    <h1 class="quest-detail-title">${escapeHtml(questDetailData.title || 'Без названия')}</h1>
                    <div class="quest-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${escapeHtml(location)}</span>
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
                            <span>${checkpoints.length} точек</span>
                        </div>
                        <div class="info-chip">
                            <i class="fas fa-users"></i>
                            <span>${escapeHtml(getAgeGroupLabel(questDetailData))}</span>
                        </div>
                    </div>
                    
                    <div class="detail-block">
                        <h3><i class="fas fa-book-open"></i> Описание</h3>
                        <p>${formatText(questDetailData.description || 'Описание не указано')}</p>
                    </div>
                    
                    <div class="detail-block">
                        <h3><i class="fas fa-gavel"></i> Правила</h3>
                        <div class="content-box">${formatText(rulesText)}</div>
                    </div>
                    
                    <div class="detail-block">
                        <h3><i class="fas fa-exclamation-triangle"></i> Важные предупреждения</h3>
                        <div class="alert alert-warning">${formatText(warningsText)}</div>
                    </div>
                    
                    <div class="detail-block">
                        <h3><i class="fas fa-backpack"></i> Что взять с собой</h3>
                        <div class="content-box">${formatText(whatToTakeText)}</div>
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
    if (!questDetailData?.id) return;
    window.location.href = `quest-play.html?id=${encodeURIComponent(questDetailData.id)}`;
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

function renderLoading() {
    const container = document.getElementById('questDetail');
    if (!container) return;

    container.innerHTML = `
        <div class="empty-state" style="padding: 40px 0;">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Загружаем квест...</p>
        </div>
    `;
}

function renderError(message) {
    const container = document.getElementById('questDetail');
    if (!container) return;

    container.innerHTML = `
        <div class="empty-state" style="padding: 40px 0;">
            <i class="fas fa-triangle-exclamation"></i>
            <p>Не удалось загрузить квест</p>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

async function loadQuestDetail() {
    const questId = getQuestId();
    if (!questId) {
        renderError('В адресе страницы нет id квеста');
        return;
    }

    renderLoading();

    try {
        questDetailData = await fetchQuestById(questId);
        renderQuestDetail();
    } catch (error) {
        console.error('Quest detail load failed', error);
        renderError(error.message || 'Неизвестная ошибка');
    }
}

loadQuestDetail();