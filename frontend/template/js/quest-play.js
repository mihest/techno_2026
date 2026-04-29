const messageModal = document.getElementById('messageModal');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalOkBtn = document.getElementById('modalOkBtn');

const complaintModal = document.getElementById('complaintModal');
const closeComplaintModal = document.getElementById('closeComplaintModal');
const cancelComplaintBtn = document.getElementById('cancelComplaintBtn');
const complaintForm = document.getElementById('complaintForm');

const state = {
    quest: null,
    session: null,
    selectedAnswerId: null,
    map: null,
};

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showModal(type, title, message) {
    if (!messageModal) return;
    if (type === 'success') {
        modalIcon.className = 'fas fa-check-circle';
        modalIcon.style.color = 'var(--neon-green)';
    } else if (type === 'error') {
        modalIcon.className = 'fas fa-times-circle';
        modalIcon.style.color = 'var(--red)';
    } else if (type === 'warning') {
        modalIcon.className = 'fas fa-exclamation-triangle';
        modalIcon.style.color = 'var(--orange)';
    } else {
        modalIcon.className = 'fas fa-info-circle';
        modalIcon.style.color = 'var(--cyan)';
    }
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    messageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    messageModal?.classList.remove('active');
    document.body.style.overflow = '';
}

function openComplaintModal(checkpointId, checkpointTitle) {
    document.getElementById('complaintCheckpointId').value = checkpointId;
    document.getElementById('complaintCheckpointTitle').value = checkpointTitle;
    document.getElementById('complaintReason').value = '';
    document.getElementById('complaintDescription').value = '';
    complaintModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeComplaintModalFunc() {
    complaintModal?.classList.remove('active');
    document.body.style.overflow = '';
}

function getQuestId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('quest_id');
}

function getCheckpointCoords(checkpoint) {
    const lat = Number(checkpoint?.lat);
    const lng = Number(checkpoint?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [lat, lng];
}

async function api(path, options = {}) {
    if (!window.AuthApi?.authorizedFetch) {
        throw new Error('Требуется авторизация');
    }
    return window.AuthApi.authorizedFetch(path, options);
}

async function fetchQuestById(questId) {
    return api(`/quests/${encodeURIComponent(questId)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });
}

async function startSession(questId, mode = 'solo') {
    return api(`/quests/${encodeURIComponent(questId)}/start`, {
        method: 'POST',
        body: JSON.stringify({ mode }),
    });
}

async function sendAnswer(sessionId, payload) {
    return api(`/sessions/${encodeURIComponent(sessionId)}/answer`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

function renderLoading(message = 'Загружаем квест...') {
    const container = document.getElementById('playContent');
    if (!container) return;
    container.innerHTML = `
        <div class="task-container">
            <div class="completion-card">
                <div class="completion-icon"><i class="fas fa-spinner fa-spin"></i></div>
                <h2>${escapeHtml(message)}</h2>
            </div>
        </div>
    `;
}

function renderLoadError(message) {
    const container = document.getElementById('playContent');
    if (!container) return;
    container.innerHTML = `
        <div class="task-container">
            <div class="completion-card">
                <div class="completion-icon"><i class="fas fa-triangle-exclamation"></i></div>
                <h2>Не удалось загрузить прохождение</h2>
                <p>${escapeHtml(message || 'Неизвестная ошибка')}</p>
                <button class="btn btn-primary" onclick="window.location.href='/'">
                    <i class="fas fa-home"></i> На главную
                </button>
            </div>
        </div>
    `;
}

function renderSessionProgress() {
    const circlesContainer = document.getElementById('checkpointCircles');
    if (!circlesContainer || !state.session) return;

    const total = Number(state.session.total_checkpoints || 0);
    const currentOrder = Number(state.session.current_checkpoint_order || 1);
    const status = String(state.session.status?.value || state.session.status || '').toLowerCase();

    const html = Array.from({ length: total }, (_, index) => {
        const order = index + 1;
        const isDone = order < currentOrder || (status === 'completed' && order <= total);
        const isActive = status === 'active' && order === currentOrder;
        return `<div class="circle ${isDone ? 'completed' : isActive ? 'active' : ''}">${order}</div>`;
    }).join('');

    circlesContainer.innerHTML = html;
}

function renderPassedCheckpoints() {
    const passed = Array.isArray(state.session?.passed_checkpoints) ? state.session.passed_checkpoints : [];
    if (!passed.length) return '';

    return `
        <div class="detail-block" style="margin-top: 20px;">
            <h3><i class="fas fa-check-circle"></i> Пройденные чекпоинты</h3>
            ${passed.map((cp) => `
                <div class="content-box" style="margin-top: 10px;">
                    <strong>${escapeHtml(cp.title)}</strong>
                    <p style="margin-top: 8px;">${escapeHtml(cp.task)}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderCurrentCheckpoint(cp) {
    const answers = Array.isArray(cp.answers) ? cp.answers : [];
    const hints = Array.isArray(cp.hints) ? cp.hints : [];
    const isChoice = cp.question_type === 'choice';

    const optionsHtml = isChoice
        ? `
            <div class="options-grid" id="optionsContainer">
                ${answers.map((opt) => `
                    <div class="option-btn" data-answer-id="${opt.id}">
                        <div class="option-marker"></div>
                        <div class="option-text">${escapeHtml(opt.answer_text)}</div>
                    </div>
                `).join('')}
            </div>
        `
        : `
            <div class="code-input-group">
                <label><i class="fas fa-keyboard"></i> Введите ответ</label>
                <input type="text" id="answerInput" class="code-input" placeholder="Введите код-слово...">
            </div>
        `;

    return `
        <div class="task-title">
            <div class="task-title-left">
                <i class="fas fa-map-pin"></i>
                <h3>${escapeHtml(cp.title)}</h3>
            </div>
            <button class="complaint-checkpoint-btn" onclick="openComplaintModal(${cp.id}, '${escapeHtml(cp.title)}')" title="Пожаловаться на чекпоинт">
                <i class="fas fa-flag"></i> Пожаловаться
            </button>
        </div>
        <div class="task-description"><p>${escapeHtml(cp.task)}</p></div>
        <div class="hints-section">
            <div class="hints-title">
                <i class="fas fa-lightbulb"></i>
                <span>Подсказки</span>
            </div>
            <div>
                ${hints.length
                    ? hints.map((hint, idx) => `<div class="content-box" style="margin-top: 10px;">${idx + 1}. ${escapeHtml(hint)}</div>`).join('')
                    : '<div class="content-box" style="margin-top: 10px;">Подсказок нет</div>'}
            </div>
        </div>
        ${optionsHtml}
        <button class="btn btn-primary" id="submitAnswerBtn">
            <i class="fas fa-check"></i> Отправить ответ
        </button>
    `;
}

function initMap() {
    const cp = state.session?.checkpoint;
    const coords = getCheckpointCoords(cp);
    if (!coords || typeof ymaps === 'undefined') return;

    ymaps.ready(() => {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        if (state.map) state.map.destroy();
        state.map = new ymaps.Map('map', {
            center: coords,
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl'],
        });

        state.map.geoObjects.add(new ymaps.Placemark(coords, {
            balloonContent: escapeHtml(cp.title || 'Чекпоинт'),
        }, {
            preset: 'islands#yellowIcon',
        }));
    });
}

function bindCurrentCheckpointEvents() {
    const current = state.session?.checkpoint;
    if (!current) return;

    if (current.question_type === 'choice') {
        state.selectedAnswerId = null;
        document.querySelectorAll('.option-btn').forEach((button) => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.option-btn').forEach((item) => item.classList.remove('selected'));
                button.classList.add('selected');
                state.selectedAnswerId = Number(button.dataset.answerId);
            });
        });
    }

    const submitButton = document.getElementById('submitAnswerBtn');
    submitButton?.addEventListener('click', async () => {
        try {
            let payload;
            if (current.question_type === 'choice') {
                if (!state.selectedAnswerId) {
                    showModal('warning', 'Внимание', 'Выберите вариант ответа');
                    return;
                }
                payload = { selected_answer_id: state.selectedAnswerId };
            } else {
                const text = String(document.getElementById('answerInput')?.value || '').trim();
                if (!text) {
                    showModal('warning', 'Внимание', 'Введите ответ');
                    return;
                }
                payload = { answer_text: text };
            }

            submitButton.disabled = true;
            const result = await sendAnswer(state.session.id, payload);
            state.session = {
                ...state.session,
                ...result,
            };

            showModal(result.is_correct ? 'success' : 'error', result.is_correct ? 'Верно' : 'Неверно', result.message || 'Ответ отправлен');
            renderPlayScreen();
        } catch (error) {
            showModal('error', 'Ошибка', error.message || 'Не удалось отправить ответ');
        } finally {
            submitButton.disabled = false;
        }
    });
}

function renderPlayScreen() {
    const container = document.getElementById('playContent');
    if (!container || !state.quest || !state.session) return;

    const location = String(state.quest.city_district || '');
    const status = String(state.session.status?.value || state.session.status || '').toLowerCase();

    const headerHtml = `
        <div class="play-header">
            <div class="quest-info">
                <h2><i class="fas fa-route" style="color: var(--yellow);"></i> ${escapeHtml(state.quest.title || 'Без названия')}</h2>
                <p><i class="fas fa-location-dot"></i> ${escapeHtml(location || 'Локация не указана')}</p>
            </div>
            <div class="progress-block">
                <div class="checkpoint-circles" id="checkpointCircles"></div>
            </div>
        </div>
    `;

    if (status === 'completed' || !state.session.checkpoint) {
        container.innerHTML = `
            ${headerHtml}
            <div class="task-container">
                <div class="completion-card">
                    <div class="completion-icon"><i class="fas fa-trophy"></i></div>
                    <h2>Квест пройден</h2>
                    <p>Поздравляем! Вы успешно завершили маршрут.</p>
                    <button class="btn btn-primary" onclick="window.location.href='/'">
                        <i class="fas fa-home"></i> Вернуться к квестам
                    </button>
                </div>
                ${renderPassedCheckpoints()}
            </div>
        `;
        renderSessionProgress();
        return;
    }

    container.innerHTML = `
        ${headerHtml}
        <div class="map-container"><div id="map"></div></div>
        <div class="task-container">
            ${renderCurrentCheckpoint(state.session.checkpoint)}
            ${renderPassedCheckpoints()}
        </div>
        <div class="action-buttons">
            <button class="btn btn-outline" id="backToQuestBtn"><i class="fas fa-arrow-left"></i> К описанию квеста</button>
        </div>
    `;

    renderSessionProgress();
    bindCurrentCheckpointEvents();
    initMap();
    document.getElementById('backToQuestBtn')?.addEventListener('click', () => {
        window.location.href = `/quest-detail?id=${encodeURIComponent(state.quest.id)}`;
    });
}

async function loadQuestAndStart() {
    const questId = getQuestId();
    if (!questId) {
        renderLoadError('В адресе страницы нет id квеста');
        return;
    }

    renderLoading('Запускаем сессию...');
    try {
        state.quest = await fetchQuestById(questId);
        state.session = await startSession(questId, 'solo');
        renderPlayScreen();
    } catch (error) {
        console.error('Quest play load failed', error);
        renderLoadError(error.message || 'Неизвестная ошибка');
    }
}

modalOkBtn?.addEventListener('click', closeModal);
messageModal?.addEventListener('click', (e) => {
    if (e.target === messageModal) closeModal();
});
closeComplaintModal?.addEventListener('click', closeComplaintModalFunc);
cancelComplaintBtn?.addEventListener('click', closeComplaintModalFunc);
complaintModal?.addEventListener('click', (e) => {
    if (e.target === complaintModal) closeComplaintModalFunc();
});
complaintForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const reason = document.getElementById('complaintReason').value;
    const description = document.getElementById('complaintDescription').value;
    const checkpointTitle = document.getElementById('complaintCheckpointTitle').value;
    if (!reason) return showModal('warning', 'Внимание', 'Выберите причину жалобы');
    if (description.length < 20) return showModal('warning', 'Внимание', 'Описание должно содержать минимум 20 символов');
    closeComplaintModalFunc();
    showModal('success', 'Жалоба отправлена', `Жалоба на чекпоинт "${checkpointTitle}" отправлена модератору.`);
});

window.openComplaintModal = openComplaintModal;
loadQuestAndStart();