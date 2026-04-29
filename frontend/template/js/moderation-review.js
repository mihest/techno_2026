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

let quest = null;
let reviewMap = null;
let noticeTimerId = null;

function getQuestId() {
    return new URLSearchParams(window.location.search).get('id');
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

function showNotice(type, message) {
    let notice = document.getElementById('moderationNotice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'moderationNotice';
        notice.style.position = 'fixed';
        notice.style.right = '20px';
        notice.style.bottom = '20px';
        notice.style.maxWidth = '360px';
        notice.style.padding = '12px 14px';
        notice.style.borderRadius = '12px';
        notice.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.35)';
        notice.style.zIndex = '9999';
        notice.style.fontWeight = '600';
        notice.style.lineHeight = '1.4';
        notice.style.border = '1px solid var(--border)';
        notice.style.opacity = '0';
        notice.style.transform = 'translateY(10px)';
        notice.style.transition = 'opacity .2s ease, transform .2s ease';
        document.body.appendChild(notice);
    }

    if (type === 'success') {
        notice.style.background = 'rgba(2, 244, 202, 0.18)';
        notice.style.color = 'var(--text-primary)';
        notice.style.borderColor = 'var(--neon-green)';
    } else if (type === 'warning') {
        notice.style.background = 'rgba(255, 255, 27, 0.15)';
        notice.style.color = 'var(--text-primary)';
        notice.style.borderColor = 'var(--yellow)';
    } else {
        notice.style.background = 'rgba(237, 28, 36, 0.14)';
        notice.style.color = 'var(--text-primary)';
        notice.style.borderColor = 'var(--red)';
    }

    notice.textContent = message;
    notice.style.opacity = '1';
    notice.style.transform = 'translateY(0)';

    if (noticeTimerId) clearTimeout(noticeTimerId);
    noticeTimerId = window.setTimeout(() => {
        notice.style.opacity = '0';
        notice.style.transform = 'translateY(10px)';
    }, 2800);
}

function getAuthHeaders() {
    try {
        const session = JSON.parse(localStorage.getItem('imprezzio_auth') || 'null');
        if (!session?.accessToken) return {};

        return {
            Authorization: `${session.tokenType || 'Bearer'} ${session.accessToken}`,
        };
    } catch {
        return {};
    }
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
        headers: {
            Accept: 'application/json',
            ...getAuthHeaders(),
        },
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

async function sendModerationDecision(questId, action, reason = '') {
    const payload = { action, reason: reason || '' };

    if (window.AuthApi?.authorizedFetch) {
        return window.AuthApi.authorizedFetch(`/quests/${encodeURIComponent(questId)}/moderation/decision`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { Accept: 'application/json' },
        });
    }

    const response = await fetch(`${API_BASE_URL}/quests/${encodeURIComponent(questId)}/moderation/decision`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
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

function getDifficultyStars(difficulty) {
    let stars = '';
    const level = Number(difficulty) || 0;

    for (let i = 1; i <= 5; i++) {
        stars += i <= level
            ? '<i class="fas fa-star" style="color: var(--yellow);"></i>'
            : '<i class="fas fa-star" style="color: var(--border);"></i>';
    }

    return stars;
}

function getDifficultyLevel(difficulty) {
    const level = Number(difficulty) || 0;
    if (level <= 2) return 'Мне только спросить';
    if (level === 3) return 'Я бы ещё поиграл';
    return 'Работают профи';
}

function formatDate(dateString) {
    if (!dateString) return 'Дата не указана';

    try {
        return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    } catch {
        return 'Дата не указана';
    }
}

function getAgeGroupLabel(questData) {
    const value = questData.client_extra?.age_group?.label || questData.age_group_id;
    return AGE_GROUP_LABELS[value] || value || 'Возраст не указан';
}

function getAuthorLabel(questData) {
    return questData.author?.username ||
        questData.author?.nickname ||
        questData.client_extra?.author ||
        questData.author_id ||
        'Автор не указан';
}

function getCategories(questData) {
    const categories = [
        questData.category,
        ...(Array.isArray(questData.client_extra?.categories) ? questData.client_extra.categories : []),
    ].filter(Boolean);

    return [...new Set(categories)];
}

function parseRulesWarning(value) {
    const result = {
        rules: '',
        warnings: '',
        whatToTake: '',
        raw: value || '',
    };

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

function getCheckpointCoords(checkpoint) {
    const lat = Number(checkpoint.lat);
    const lng = Number(checkpoint.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return [lat, lng];
    }

    const pointCoords = checkpoint.point?.coordinates;
    if (Array.isArray(pointCoords) && pointCoords.length >= 2) {
        const pointLng = Number(pointCoords[0]);
        const pointLat = Number(pointCoords[1]);
        if (Number.isFinite(pointLat) && Number.isFinite(pointLng)) return [pointLat, pointLng];
    }

    return null;
}

function normalizeCheckpoint(checkpoint, index) {
    const answers = Array.isArray(checkpoint.answers) ? checkpoint.answers : [];
    const sortedAnswers = [...answers].sort((a, b) => (a.option_order || 0) - (b.option_order || 0));
    const correctAnswer = sortedAnswers.find((answer) => answer.is_correct);
    const coords = getCheckpointCoords(checkpoint);

    return {
        id: checkpoint.id ?? index,
        order: checkpoint.order || index + 1,
        title: checkpoint.title || `Чекпоинт ${index + 1}`,
        task: checkpoint.task || '',
        questionType: checkpoint.question_type || 'code',
        address: checkpoint.address || '',
        pointRules: checkpoint.point_rules || '',
        hints: Array.isArray(checkpoint.hints) ? checkpoint.hints : [],
        answers: sortedAnswers,
        answerText: correctAnswer?.answer_text || '',
        coords,
    };
}

function getCheckpointAnswerText(checkpoint) {
    if (checkpoint.answerText) return checkpoint.answerText;
    if (checkpoint.answers.length) {
        return checkpoint.answers
            .filter((answer) => answer.is_correct)
            .map((answer) => answer.answer_text)
            .join(', ');
    }

    return 'Не указан';
}

function getStatusView(status) {
    if (status === 'Опубликовано') {
        return { className: 'status-approved', icon: 'fa-check-circle', label: 'Опубликовано' };
    }
    if (status === 'Скрыто' || status === 'Архив') {
        return { className: 'status-rejected', icon: 'fa-times-circle', label: status };
    }

    return { className: 'status-pending', icon: 'fa-hourglass-half', label: status || 'На модерации' };
}

function initMap(checkpoints) {
    const mapEl = document.getElementById('reviewMap');
    if (!mapEl) return;

    const points = checkpoints.filter((checkpoint) => checkpoint.coords);
    if (!points.length) {
        mapEl.innerHTML = '<div class="empty-state"><i class="fas fa-map"></i><p>Координаты чекпоинтов не указаны</p></div>';
        return;
    }

    if (typeof ymaps === 'undefined') {
        mapEl.innerHTML = '<div class="empty-state"><i class="fas fa-map"></i><p>Карта не загрузилась</p></div>';
        return;
    }

    ymaps.ready(() => {
        if (reviewMap) reviewMap.destroy();

        reviewMap = new ymaps.Map('reviewMap', {
            center: points[0].coords,
            zoom: 14,
            controls: ['zoomControl', 'fullscreenControl'],
        });

        points.forEach((checkpoint, index) => {
            const hintsText = checkpoint.hints.length
                ? `<br><br><strong>Подсказки:</strong> ${checkpoint.hints.map(escapeHtml).join(' • ')}`
                : '';
            const answerText = getCheckpointAnswerText(checkpoint);

            const placemark = new ymaps.Placemark(checkpoint.coords, {
                balloonContent: `
                    <div style="font-family: Montserrat, sans-serif; max-width: 260px;">
                        <strong style="color: #00D3F4;">${index + 1}. ${escapeHtml(checkpoint.title)}</strong><br>
                        <strong>Задание:</strong> ${formatText(checkpoint.task)}<br>
                        <strong>Тип:</strong> ${checkpoint.questionType === 'code' ? 'Код-слово' : 'Вопрос с вариантами'}<br>
                        <strong>Правильный ответ:</strong> ${escapeHtml(answerText)}
                        ${hintsText}
                    </div>
                `,
            }, {
                preset: 'islands#redIcon',
            });

            reviewMap.geoObjects.add(placemark);
        });

        if (points.length > 1) {
            const bounds = reviewMap.geoObjects.getBounds();
            if (bounds) reviewMap.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
        }
    });
}

function renderLoading() {
    document.getElementById('questContent').innerHTML = `
        <div class="info-card">
            <h3><i class="fas fa-spinner fa-spin"></i> Загружаем квест...</h3>
        </div>
    `;
}

function renderError(message) {
    document.getElementById('questContent').innerHTML = `
        <div class="info-card">
            <h3><i class="fas fa-triangle-exclamation"></i> Не удалось загрузить квест</h3>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function renderCheckpoint(checkpoint, index) {
    const answerText = getCheckpointAnswerText(checkpoint);
    const typeText = checkpoint.questionType === 'code' ? 'Код-слово' : 'Вопрос с вариантами';
    const coordsText = checkpoint.coords
        ? `${checkpoint.coords[0].toFixed(6)}, ${checkpoint.coords[1].toFixed(6)}`
        : 'Не указаны';
    const answersHtml = checkpoint.answers.length
        ? `
            <div class="checkpoint-answer">
                <i class="fas fa-list-ul" style="color: var(--cyan);"></i>
                <strong>Варианты:</strong>
                ${checkpoint.answers.map((answer) => `
                    <span class="hint-tag">${escapeHtml(answer.answer_text)}${answer.is_correct ? ' ✓' : ''}</span>
                `).join('')}
            </div>
        `
        : '';

    return `
        <div class="checkpoint-item">
            <div class="checkpoint-header">
                <span class="checkpoint-number"><i class="fas fa-map-pin"></i> Чекпоинт ${checkpoint.order || index + 1}</span>
                <span class="checkpoint-type"><i class="fas fa-tag"></i> ${typeText}</span>
            </div>
            <div class="checkpoint-title">${escapeHtml(checkpoint.title)}</div>
            ${checkpoint.address ? `<div class="checkpoint-coords"><i class="fas fa-location-dot"></i> ${escapeHtml(checkpoint.address)}</div>` : ''}
            <div class="checkpoint-task"><i class="fas fa-question-circle"></i> ${formatText(checkpoint.task)}</div>
            <div class="checkpoint-answer">
                <i class="fas fa-check-circle" style="color: var(--neon-green);"></i>
                <strong>Правильный ответ:</strong> ${escapeHtml(answerText)}
            </div>
            ${answersHtml}
            ${checkpoint.hints.length ? `
                <div class="checkpoint-hints">
                    <i class="fas fa-lightbulb" style="color: var(--cyan);"></i>
                    <strong>Подсказки:</strong>
                    ${checkpoint.hints.map((hint) => `<span class="hint-tag">${escapeHtml(hint)}</span>`).join('')}
                </div>
            ` : ''}
            ${checkpoint.pointRules ? `
                <div class="checkpoint-task"><i class="fas fa-gavel"></i> ${formatText(checkpoint.pointRules)}</div>
            ` : ''}
            <div class="checkpoint-coords">
                <i class="fas fa-crosshairs"></i>
                Координаты: ${coordsText}
            </div>
        </div>
    `;
}

function renderQuest() {
    const container = document.getElementById('questContent');
    const checkpoints = (quest.checkpoints || []).map(normalizeCheckpoint);
    const statusView = getStatusView(quest.status);
    const rulesWarning = parseRulesWarning(quest.rules_warning);
    const categories = getCategories(quest);
    const coverUrl = resolveCoverUrl(quest.cover_file);
    const location = quest.city_district || 'Локация не указана';
    const coverHtml = coverUrl
        ? `<img src="${escapeAttr(coverUrl)}" class="cover-image" alt="Обложка">`
        : `<div class="preview-placeholder"><i class="fas fa-image"></i> Обложка не указана</div>`;

    container.innerHTML = `
        <div class="quest-header">
            <h1><i class="fas fa-route"></i> ${escapeHtml(quest.title || 'Без названия')}</h1>
            <div class="quest-meta-row">
                <span class="meta-item"><i class="fas fa-user"></i> Автор: ${escapeHtml(getAuthorLabel(quest))}</span>
                <span class="meta-item"><i class="fas fa-calendar"></i> Дата отправки: ${formatDate(quest.created_at)}</span>
                <span class="status-badge ${statusView.className}">
                    <i class="fas ${statusView.icon}"></i> ${escapeHtml(statusView.label)}
                </span>
            </div>
        </div>

        <div class="review-grid">
            <div class="left-column">
                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Основная информация</h3>
                    <div class="info-row">
                        <div class="info-label">Локация</div>
                        <div class="info-value">${escapeHtml(location)}</div>
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
                        <div class="info-value">${Number(quest.duration_minutes) || 0} минут</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Возрастная группа</div>
                        <div class="info-value">${escapeHtml(getAgeGroupLabel(quest))}</div>
                    </div>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-tags"></i> Категории</h3>
                    <div class="categories-list">
                        ${categories.length
                            ? categories.map((category) => `<span class="category-badge">${escapeHtml(category)}</span>`).join('')
                            : '<span class="category-badge">Квест</span>'}
                    </div>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-image"></i> Обложка квеста</h3>
                    ${coverHtml}
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-align-left"></i> Описание</h3>
                    <p>${formatText(quest.description) || 'Не указано'}</p>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-gavel"></i> Правила</h3>
                    <p>${formatText(rulesWarning.rules || rulesWarning.raw) || 'Не указаны'}</p>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-exclamation-triangle"></i> Предупреждения</h3>
                    <p>${formatText(rulesWarning.warnings) || 'Не указаны'}</p>
                </div>

                <div class="info-card">
                    <h3><i class="fas fa-backpack"></i> Что взять с собой</h3>
                    <p>${formatText(rulesWarning.whatToTake) || 'Не указано'}</p>
                </div>
            </div>

            <div class="right-column">
                <div class="map-card">
                    <h3><i class="fas fa-map-marked-alt"></i> Карта маршрута</h3>
                    <div id="reviewMap"></div>
                </div>

                <div class="checkpoints-card">
                    <h3><i class="fas fa-list-check"></i> Чекпоинты (${checkpoints.length})</h3>
                    <div class="checkpoints-list">
                        ${checkpoints.length
                            ? checkpoints.map(renderCheckpoint).join('')
                            : '<div class="empty-checkpoints"><i class="fas fa-map-marker-alt"></i><p>Чекпоинты не добавлены</p></div>'}
                    </div>
                </div>
            </div>
        </div>

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

    setTimeout(() => initMap(checkpoints), 200);

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
    if (!quest) return;
    if (!confirm(`Подтвердить одобрение квеста "${quest.title}"?`)) return;

    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectStartBtn');
    if (approveBtn) approveBtn.disabled = true;
    if (rejectBtn) rejectBtn.disabled = true;

    sendModerationDecision(quest.id, 'publish', '')
        .then(async () => {
            showNotice('success', 'Квест успешно одобрен');
            quest = await fetchQuestById(quest.id);
            renderQuest();
        })
        .catch((error) => {
            console.error('Approve quest failed', error);
            showNotice('error', error.message || 'Не удалось одобрить квест');
        })
        .finally(() => {
            if (approveBtn) approveBtn.disabled = false;
            if (rejectBtn) rejectBtn.disabled = false;
        });
}

function rejectQuest() {
    if (!quest) return;

    const reason = document.getElementById('rejectReason').value;
    if (reason.length < 20) {
        showNotice('warning', 'Причина отклонения должна содержать минимум 20 символов');
        return;
    }

    if (!confirm(`Вы уверены, что хотите отклонить квест "${quest.title}"?`)) return;

    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectStartBtn');
    const confirmRejectBtn = document.getElementById('confirmRejectBtn');
    if (approveBtn) approveBtn.disabled = true;
    if (rejectBtn) rejectBtn.disabled = true;
    if (confirmRejectBtn) confirmRejectBtn.disabled = true;

    sendModerationDecision(quest.id, 'reject', reason.trim())
        .then(async () => {
            showNotice('success', 'Квест отклонен');
            quest = await fetchQuestById(quest.id);
            renderQuest();
        })
        .catch((error) => {
            console.error('Reject quest failed', error);
            showNotice('error', error.message || 'Не удалось отклонить квест');
        })
        .finally(() => {
            if (approveBtn) approveBtn.disabled = false;
            if (rejectBtn) rejectBtn.disabled = false;
            if (confirmRejectBtn) confirmRejectBtn.disabled = false;
        });
}

async function loadQuest() {
    const questId = getQuestId();

    if (!questId) {
        renderError('В адресе страницы нет id квеста');
        return;
    }

    renderLoading();

    try {
        quest = await fetchQuestById(questId);
        window.lastModerationReviewQuest = quest;
        renderQuest();
    } catch (error) {
        console.error('Moderation review quest load failed', error);
        renderError(error.message);
    }
}

loadQuest();
