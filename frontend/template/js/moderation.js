const API_BASE_URL = (
    window.AuthApi?.API_BASE_URL ||
    window.AUTH_API_BASE_URL ||
    localStorage.getItem('apiBaseUrl') ||
    'https://mihest.ru/api'
).replace(/\/$/, '');

const STATUS_BY_TAB = {
    pending: 'На модерации',
    approved: 'Опубликовано',
    rejected: 'Скрыто',
};

const STATUS_VIEW = {
    pending: {
        className: 'status-pending',
        icon: 'fa-hourglass-half',
        label: 'На модерации',
    },
    approved: {
        className: 'status-approved',
        icon: 'fa-check-circle',
        label: 'Опубликовано',
    },
    rejected: {
        className: 'status-rejected',
        icon: 'fa-times-circle',
        label: 'Скрыто',
    },
};

const SORT_BY_SELECT = {
    newest: { sort_by: 'created_at', sort_order: 'desc' },
    oldest: { sort_by: 'created_at', sort_order: 'asc' },
    author: { sort_by: 'created_at', sort_order: 'desc' },
};

let currentStatus = 'pending';
let moderationQuests = [];
let requestVersion = 0;
let currentModerationQuest = null;
let noticeTimerId = null;

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

function getQuestAuthor(quest) {
    return quest.author?.username ||
        quest.author?.nickname ||
        quest.client_extra?.author ||
        quest.author_id ||
        'Автор не указан';
}

function getQuestTabStatus(quest) {
    if (quest.status === 'На модерации') return 'pending';
    if (quest.status === 'Опубликовано') return 'approved';
    if (quest.status === 'Скрыто' || quest.status === 'Архив') return 'rejected';
    return currentStatus;
}

function getQuestIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('quest_id');
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
    const payload = {
        action,
        reason: reason || '',
    };

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

function formatText(value) {
    return escapeHtml(value || '').replace(/\n/g, '<br>');
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

function normalizeCheckpoint(checkpoint, index) {
    const answers = Array.isArray(checkpoint.answers)
        ? [...checkpoint.answers].sort((a, b) => (a.option_order || 0) - (b.option_order || 0))
        : [];

    return {
        id: checkpoint.id ?? index + 1,
        order: checkpoint.order || index + 1,
        title: checkpoint.title || `Чекпоинт ${index + 1}`,
        task: checkpoint.task || '',
        questionType: checkpoint.question_type || 'code',
        address: checkpoint.address || '',
        pointRules: checkpoint.point_rules || '',
        lat: Number(checkpoint.lat),
        lng: Number(checkpoint.lng),
        hints: Array.isArray(checkpoint.hints) ? checkpoint.hints : [],
        answers,
    };
}

function renderSingleQuestLoading() {
    const container = document.getElementById('questsList');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Загружаем квест...</p>
        </div>
    `;
}

function renderSingleQuestError(message) {
    const container = document.getElementById('questsList');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-triangle-exclamation"></i>
            <p>Не удалось загрузить квест</p>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function setSingleQuestMode() {
    const headerTitle = document.querySelector('.moderation-header h1');
    const headerSubtitle = document.querySelector('.moderation-header p');
    if (headerTitle) headerTitle.innerHTML = '<i class="fas fa-eye"></i> Просмотр квеста';
    if (headerSubtitle) headerSubtitle.textContent = 'Детали квеста и чекпоинты';

    document.querySelector('.stats-grid')?.setAttribute('style', 'display:none;');
    document.querySelector('.tabs-container')?.setAttribute('style', 'display:none;');
    document.querySelector('.filters-panel')?.setAttribute('style', 'display:none;');
    document.querySelector('.table-header')?.setAttribute('style', 'display:none;');
}

function renderSingleQuest(quest) {
    const container = document.getElementById('questsList');
    if (!container) return;

    const checkpoints = (Array.isArray(quest.checkpoints) ? quest.checkpoints : []).map(normalizeCheckpoint);
    const author = getQuestAuthor(quest);
    const createdAt = formatDate(quest.created_at);

    container.innerHTML = `
        <div class="quest-row" style="display:block;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
                <a href="moderation.html" class="view-btn" style="text-decoration:none;"><i class="fas fa-arrow-left"></i> Назад</a>
                <span class="status-badge ${STATUS_VIEW[getQuestTabStatus(quest)]?.className || STATUS_VIEW.pending.className}">
                    <i class="fas ${(STATUS_VIEW[getQuestTabStatus(quest)]?.icon || STATUS_VIEW.pending.icon)}"></i>
                    ${(STATUS_VIEW[getQuestTabStatus(quest)]?.label || STATUS_VIEW.pending.label)}
                </span>
            </div>
            <h2 class="quest-title" style="margin-bottom:10px;">${escapeHtml(quest.title || 'Без названия')}</h2>
            <div class="quest-date" style="margin-bottom:6px;"><i class="fas fa-user"></i> ${escapeHtml(author)}</div>
            <div class="quest-date" style="margin-bottom:16px;"><i class="far fa-calendar-alt"></i> ${createdAt}</div>
            <p style="margin-bottom:10px;">${formatText(quest.description || 'Описание не указано')}</p>
            <div class="quest-date" style="margin-bottom:6px;"><i class="fas fa-location-dot"></i> ${escapeHtml(quest.city_district || 'Локация не указана')}</div>
            <div class="quest-date" style="margin-bottom:6px;"><i class="fas fa-clock"></i> ${Number(quest.duration_minutes) || 0} мин</div>
            <div class="quest-date" style="margin-bottom:16px;"><i class="fas fa-star"></i> Сложность: ${Number(quest.difficulty) || 0}/5</div>

            <h3 style="margin-bottom:10px;">Чекпоинты (${checkpoints.length})</h3>
            ${checkpoints.length ? checkpoints.map((cp) => `
                <div class="quest-row" style="margin-bottom:10px;">
                    <div class="quest-title">${escapeHtml(cp.order)}. ${escapeHtml(cp.title)}</div>
                    <div class="quest-date"><i class="fas fa-tag"></i> ${cp.questionType === 'choice' ? 'Выбор ответа' : 'Код-слово'}</div>
                    ${cp.address ? `<div class="quest-date"><i class="fas fa-location-dot"></i> ${escapeHtml(cp.address)}</div>` : ''}
                    <p style="margin:8px 0;">${formatText(cp.task || 'Задание не указано')}</p>
                    ${cp.pointRules ? `<p style="margin:8px 0;"><i class="fas fa-gavel"></i> ${formatText(cp.pointRules)}</p>` : ''}
                    ${(Number.isFinite(cp.lat) && Number.isFinite(cp.lng))
                        ? `<div class="quest-date"><i class="fas fa-crosshairs"></i> ${cp.lat}, ${cp.lng}</div>`
                        : ''}
                    ${cp.hints.length ? `<div class="quest-date"><i class="fas fa-lightbulb"></i> ${cp.hints.map(escapeHtml).join(' | ')}</div>` : ''}
                    ${cp.answers.length ? `<div class="quest-date"><i class="fas fa-list"></i> ${cp.answers.map((answer) => `${escapeHtml(answer.answer_text)}${answer.is_correct ? ' ✓' : ''}`).join(' | ')}</div>` : ''}
                </div>
            `).join('') : `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt"></i>
                    <p>Чекпоинты не добавлены</p>
                </div>
            `}
            <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:16px;">
                <button class="btn btn-success" id="approveQuestBtn">
                    <i class="fas fa-check-circle"></i> Одобрить квест
                </button>
                <button class="btn btn-danger" id="rejectQuestBtn">
                    <i class="fas fa-times-circle"></i> Отклонить квест
                </button>
            </div>
            <div id="rejectBlock" style="display:none; margin-top:12px;">
                <textarea id="rejectReasonInput" rows="4" class="search-input" style="width:100%;" placeholder="Укажите причину отклонения (минимум 10 символов)"></textarea>
                <div style="display:flex; gap:12px; margin-top:10px; justify-content:flex-end;">
                    <button class="btn btn-outline" id="cancelRejectBtn">Отмена</button>
                    <button class="btn btn-danger" id="confirmRejectBtn">Подтвердить отклонение</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('approveQuestBtn')?.addEventListener('click', onApproveQuest);
    document.getElementById('rejectQuestBtn')?.addEventListener('click', () => {
        const rejectBlock = document.getElementById('rejectBlock');
        if (rejectBlock) rejectBlock.style.display = 'block';
    });
    document.getElementById('cancelRejectBtn')?.addEventListener('click', () => {
        const rejectBlock = document.getElementById('rejectBlock');
        const input = document.getElementById('rejectReasonInput');
        if (rejectBlock) rejectBlock.style.display = 'none';
        if (input) input.value = '';
    });
    document.getElementById('confirmRejectBtn')?.addEventListener('click', onRejectQuest);
}

function setDecisionButtonsDisabled(disabled) {
    const approveBtn = document.getElementById('approveQuestBtn');
    const rejectBtn = document.getElementById('rejectQuestBtn');
    const confirmRejectBtn = document.getElementById('confirmRejectBtn');

    if (approveBtn) approveBtn.disabled = disabled;
    if (rejectBtn) rejectBtn.disabled = disabled;
    if (confirmRejectBtn) confirmRejectBtn.disabled = disabled;
}

async function onApproveQuest() {
    const quest = currentModerationQuest;
    if (!quest?.id) return;

    if (!window.confirm(`Одобрить квест "${quest.title || 'Без названия'}"?`)) return;

    setDecisionButtonsDisabled(true);

    try {
        await sendModerationDecision(quest.id, 'publish', '');
        showNotice('success', 'Квест успешно одобрен');
        currentModerationQuest = await fetchQuestById(quest.id);
        renderSingleQuest(currentModerationQuest);
    } catch (error) {
        console.error('Approve quest failed', error);
        showNotice('error', error.message || 'Не удалось одобрить квест');
    } finally {
        setDecisionButtonsDisabled(false);
    }
}

async function onRejectQuest() {
    const quest = currentModerationQuest;
    if (!quest?.id) return;

    const reasonInput = document.getElementById('rejectReasonInput');
    const reason = reasonInput?.value?.trim() || '';
    if (reason.length < 10) {
        showNotice('warning', 'Причина отклонения должна содержать минимум 10 символов');
        return;
    }

    if (!window.confirm(`Отклонить квест "${quest.title || 'Без названия'}"?`)) return;

    setDecisionButtonsDisabled(true);

    try {
        await sendModerationDecision(quest.id, 'reject', reason);
        showNotice('success', 'Квест отклонен');
        currentModerationQuest = await fetchQuestById(quest.id);
        renderSingleQuest(currentModerationQuest);
    } catch (error) {
        console.error('Reject quest failed', error);
        showNotice('error', error.message || 'Не удалось отклонить квест');
    } finally {
        setDecisionButtonsDisabled(false);
    }
}

function buildQuestParams(statusKey = currentStatus) {
    const params = new URLSearchParams();
    const sortValue = document.getElementById('sortSelect')?.value || 'newest';
    const sort = SORT_BY_SELECT[sortValue] || SORT_BY_SELECT.newest;

    params.set('status', STATUS_BY_TAB[statusKey] || STATUS_BY_TAB.pending);
    params.set('sort_by', sort.sort_by);
    params.set('sort_order', sort.sort_order);
    params.set('from', '0');
    params.set('count', '20');

    return params;
}

async function fetchModerationQuests(statusKey = currentStatus) {
    const params = buildQuestParams(statusKey);
    const response = await fetch(`${API_BASE_URL}/quests?${params.toString()}`, {
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

async function fetchStatusTotal(statusKey) {
    const params = buildQuestParams(statusKey);
    params.set('count', '1');

    const response = await fetch(`${API_BASE_URL}/quests?${params.toString()}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) return 0;

    const data = await response.json();
    return Number(data?.total) || 0;
}

async function updateStats() {
    try {
        const [pending, approved, rejected] = await Promise.all([
            fetchStatusTotal('pending'),
            fetchStatusTotal('approved'),
            fetchStatusTotal('rejected'),
        ]);

        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('approvedCount').textContent = approved;
        document.getElementById('rejectedCount').textContent = rejected;
        document.getElementById('totalCount').textContent = approved + rejected;
    } catch (error) {
        console.warn('Moderation stats load failed', error);
    }
}

function renderLoading() {
    const container = document.getElementById('questsList');
    if (!container) return;

    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Загружаем квесты...</p>
        </div>
    `;
}

function renderError(message) {
    const container = document.getElementById('questsList');
    if (!container) return;

    container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-triangle-exclamation"></i>
            <p>Не удалось загрузить квесты</p>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

function renderQuestsList() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const sortBy = document.getElementById('sortSelect').value;
    const container = document.getElementById('questsList');
    let quests = [...moderationQuests];

    if (searchTerm) {
        quests = quests.filter((quest) => {
            const author = getQuestAuthor(quest).toLowerCase();
            return (quest.title || '').toLowerCase().includes(searchTerm) || author.includes(searchTerm);
        });
    }

    if (sortBy === 'author') {
        quests.sort((a, b) => getQuestAuthor(a).localeCompare(getQuestAuthor(b)));
    }

    if (!quests.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Нет квестов в этой категории</p>
            </div>
        `;
        return;
    }

    container.innerHTML = quests.map((quest) => {
        const rowStatus = getQuestTabStatus(quest);
        const statusView = STATUS_VIEW[rowStatus] || STATUS_VIEW.pending;
        const author = getQuestAuthor(quest);
        const date = quest.created_at || quest.published_at;

        return `
            <div class="quest-row">
                <div class="quest-title">${escapeHtml(quest.title || 'Без названия')}</div>
                <div class="quest-author"><i class="fas fa-user-circle"></i> ${escapeHtml(author)}</div>
                <div class="quest-date"><i class="far fa-calendar-alt"></i> ${formatDate(date)}</div>
                <div>
                    <span class="status-badge ${statusView.className}">
                        <i class="fas ${statusView.icon}"></i>
                        ${statusView.label}
                    </span>
                </div>
                <div>
                    <button class="view-btn" onclick="window.location.href='moderation-review.html?id=${escapeAttr(quest.id)}'">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function loadModerationQuests() {
    const version = ++requestVersion;
    renderLoading();

    try {
        const result = await fetchModerationQuests(currentStatus);
        if (version !== requestVersion) return;

        moderationQuests = Array.isArray(result?.items) ? result.items : [];
        window.lastModerationQuestsResponse = result;
        renderQuestsList();
        updateStats();
    } catch (error) {
        if (version !== requestVersion) return;
        console.error('Moderation quests load failed', error);
        renderError(error.message);
    }
}

document.querySelectorAll('.tab-btn').forEach((tab) => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((item) => item.classList.remove('active'));
        tab.classList.add('active');
        currentStatus = tab.dataset.status;
        loadModerationQuests();
    });
});

document.getElementById('searchInput')?.addEventListener('input', renderQuestsList);
document.getElementById('sortSelect')?.addEventListener('change', loadModerationQuests);

async function initModerationPage() {
    const questId = getQuestIdFromUrl();

    if (!questId) {
        loadModerationQuests();
        return;
    }

    setSingleQuestMode();
    renderSingleQuestLoading();

    try {
        const quest = await fetchQuestById(questId);
        currentModerationQuest = quest;
        renderSingleQuest(currentModerationQuest);
    } catch (error) {
        console.error('Moderation single quest load failed', error);
        renderSingleQuestError(error.message || 'Неизвестная ошибка');
    }
}

initModerationPage();
