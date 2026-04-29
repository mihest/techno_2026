const API_BASE_URL = (
    window.AuthApi?.API_BASE_URL ||
    window.AUTH_API_BASE_URL ||
    localStorage.getItem('apiBaseUrl') ||
    'https://mihest.ru/api'
).replace(/\/$/, '');

const AGE_GROUP_IDS = {
    ...(window.AuthApi?.AGE_GROUP_IDS || {}),
    ...(window.QUEST_AGE_GROUP_IDS || {}),
    '14-15': '5705a746-c2fc-4cbe-98d2-a9e5c076f89b',
};

const AGE_GROUP_LABELS = {
    under14: 'Мне нет 14',
    '14-15': '14-15 лет',
    '15-16': '15-16 лет',
    '16-17': '16-17 лет',
    '18plus': 'Мне есть 18',
    '5705a746-c2fc-4cbe-98d2-a9e5c076f89b': '14-15 лет',
};

const SORT_MAP = {
    new: { sort_by: 'created_at', sort_order: 'desc' },
    old: { sort_by: 'created_at', sort_order: 'asc' },
    hard: { sort_by: 'difficulty', sort_order: 'desc' },
    easy: { sort_by: 'difficulty', sort_order: 'asc' },
};

let currentPage = 1;
let totalItems = 0;
const itemsPerPage = 9;
let requestVersion = 0;

let currentFilters = {
    category: '',
    difficulty: 'all',
    age: 'all',
    durationBucket: 'all',
    nearMe: false,
    radius: 1000,
    location: null,
    sort: 'new',
};

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

function getDifficultyStars(difficulty) {
    let stars = '';
    const level = Number(difficulty) || 0;

    for (let i = 1; i <= 5; i++) {
        stars += i <= level
            ? '<i class="fas fa-star star-active"></i>'
            : '<i class="fas fa-star star-inactive"></i>';
    }

    return stars;
}

function getDifficultyLevel(difficulty) {
    const level = Number(difficulty) || 0;
    if (level <= 2) return 'Мне только спросить';
    if (level === 3) return 'Я бы ещё поиграл';
    return 'Работают профи';
}

function getAgeGroupId(value) {
    if (!value || value === 'all') return null;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        return value;
    }

    return AGE_GROUP_IDS[value] || null;
}

function getAgeGroupLabel(quest) {
    const value = quest.client_extra?.age_group?.label || quest.age_group_id;
    return AGE_GROUP_LABELS[value] || value || 'Возраст не указан';
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

function getCoverMarkup(quest) {
    const coverUrl = resolveCoverUrl(quest.cover_file);
    if (coverUrl) {
        return `<div class="quest-cover" style="background-image: url('${escapeAttr(coverUrl)}');"></div>`;
    }

    return `
        <div class="quest-cover" style="background: linear-gradient(135deg, var(--bg-card), rgba(255,255,27,0.14)); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-map-marked-alt" style="font-size:2rem; color:var(--yellow);"></i>
        </div>
    `;
}

function getCategoryTags(quest) {
    const categories = [
        quest.category,
        ...(Array.isArray(quest.client_extra?.categories) ? quest.client_extra.categories : []),
    ].filter(Boolean);
    const uniqueCategories = [...new Set(categories)];

    if (!uniqueCategories.length) {
        return '<span class="category-tag">Квест</span>';
    }

    return uniqueCategories
        .map((category) => `<span class="category-tag">${escapeHtml(category)}</span>`)
        .join('');
}

function getPublishedDate(quest) {
    const dateValue = quest.published_at || quest.created_at;
    if (!dateValue) return '';

    try {
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(dateValue));
    } catch {
        return '';
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

function buildQuestQueryParams() {
    const params = new URLSearchParams();
    const sort = SORT_MAP[currentFilters.sort] || SORT_MAP.new;
    const ageGroupId = getAgeGroupId(currentFilters.age);

    params.set('status', 'Опубликовано');
    params.set('sort_by', sort.sort_by);
    params.set('sort_order', sort.sort_order);
    params.set('from', String((currentPage - 1) * itemsPerPage));
    params.set('count', String(itemsPerPage));

    if (currentFilters.category) params.set('category', currentFilters.category);
    if (currentFilters.difficulty !== 'all') params.set('difficulty', currentFilters.difficulty);
    if (currentFilters.durationBucket !== 'all') params.set('duration_bucket', currentFilters.durationBucket);
    if (ageGroupId) params.set('age_group_id', ageGroupId);

    if (currentFilters.nearMe && currentFilters.location) {
        params.set('latitude', String(currentFilters.location.latitude));
        params.set('longitude', String(currentFilters.location.longitude));
        params.set('radius_meters', String(currentFilters.radius || 1000));
    }

    return params;
}

async function fetchQuests() {
    const params = buildQuestQueryParams();
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

function renderLoading() {
    const grid = document.getElementById('questsGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Загружаем квесты...</p>
        </div>
    `;
    document.getElementById('pagination').innerHTML = '';
}

function renderError(message) {
    const grid = document.getElementById('questsGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-triangle-exclamation"></i>
            <p>Не удалось загрузить квесты</p>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    document.getElementById('pagination').innerHTML = '';
}

function renderQuestsList(items) {
    const grid = document.getElementById('questsGrid');
    if (!grid) return;

    if (!items.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map-marked-alt"></i>
                <p>Квестов не найдено</p>
                <p>Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map((quest) => {
        const date = getPublishedDate(quest);
        const description = quest.description || 'Описание квеста пока не заполнено';
        const cityDistrict = quest.city_district || 'Локация не указана';

        return `
            <div class="quest-card">
                ${getCoverMarkup(quest)}
                <div class="quest-info">
                    <h3 class="quest-title">${escapeHtml(quest.title || 'Без названия')}</h3>
                    <div class="categories-tags">${getCategoryTags(quest)}</div>
                    <div class="quest-meta">
                        <span><i class="fas fa-users"></i> ${escapeHtml(getAgeGroupLabel(quest))}</span>
                        <span><i class="fas fa-clock"></i> ${Number(quest.duration_minutes) || 0} мин</span>
                    </div>
                    <div class="quest-meta">
                        <span><i class="fas fa-location-dot"></i> ${escapeHtml(cityDistrict)}</span>
                        ${date ? `<span><i class="fas fa-calendar"></i> ${escapeHtml(date)}</span>` : ''}
                    </div>
                    <div class="quest-meta">
                        <span class="difficulty-stars">${getDifficultyStars(quest.difficulty)}</span>
                        <span>${getDifficultyLevel(quest.difficulty)}</span>
                    </div>
                    <p class="quest-description">${escapeHtml(description)}</p>
                    <div class="quest-buttons">
                        <button class="btn btn-primary" onclick="startQuest('${escapeAttr(quest.id)}')"><i class="fas fa-play"></i> Начать</button>
                        <button class="btn btn-outline" onclick="showQuestDetail('${escapeAttr(quest.id)}')"><i class="fas fa-info-circle"></i> Детали</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');
    for (let page = start; page <= end; page++) pages.push(page);
    if (end < totalPages - 1) pages.push('...');
    if (end < totalPages) pages.push(totalPages);

    const pageButtons = pages.map((page) => {
        if (page === '...') return '<span class="page-btn" style="pointer-events:none;">...</span>';
        return `<button class="page-btn ${page === currentPage ? 'active' : ''}" onclick="changePage(${page})">${page}</button>`;
    }).join('');

    paginationDiv.innerHTML = `
        <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
        ${pageButtons}
        <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
    `;
}

async function loadQuests() {
    const version = ++requestVersion;
    renderLoading();

    try {
        const result = await fetchQuests();
        if (version !== requestVersion) return;

        const items = Array.isArray(result?.items) ? result.items : [];
        totalItems = Number(result?.total) || items.length;
        window.lastQuestsResponse = result;

        renderQuestsList(items);
        renderPagination();
    } catch (error) {
        if (version !== requestVersion) return;
        console.error('Quests load failed', error);
        renderError(error.message);
    }
}

function changePage(page) {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        loadQuests();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function startQuest(questId) {
    window.location.href = `quest-play.html?id=${encodeURIComponent(questId)}`;
}

function showQuestDetail(questId) {
    window.location.href = `quest-detail.html?id=${encodeURIComponent(questId)}`;
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            reject(new Error('Геолокация не поддерживается браузером'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }),
            () => reject(new Error('Не удалось получить местоположение')),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    });
}

function reloadFromFirstPage() {
    currentPage = 1;
    loadQuests();
}

function initFilters() {
    document.querySelectorAll('.category-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            const category = chip.dataset.cat;
            const isActive = currentFilters.category === category;

            document.querySelectorAll('.category-chip').forEach((item) => item.classList.remove('active'));
            currentFilters.category = isActive ? '' : category;
            if (!isActive) chip.classList.add('active');

            reloadFromFirstPage();
        });
    });

    document.getElementById('difficultySelect').addEventListener('change', (event) => {
        currentFilters.difficulty = event.target.value;
        reloadFromFirstPage();
    });

    document.getElementById('ageSelect').addEventListener('change', (event) => {
        currentFilters.age = event.target.value;
        reloadFromFirstPage();
    });

    document.getElementById('durationSelect').addEventListener('change', (event) => {
        currentFilters.durationBucket = event.target.value;
        reloadFromFirstPage();
    });

    document.getElementById('sortSelect').addEventListener('change', (event) => {
        currentFilters.sort = event.target.value;
        reloadFromFirstPage();
    });

    const nearMeCheckbox = document.getElementById('nearMeCheckbox');
    const radiusContainer = document.getElementById('radiusContainer');
    nearMeCheckbox.addEventListener('change', async (event) => {
        currentFilters.nearMe = event.target.checked;
        radiusContainer.classList.toggle('active', event.target.checked);

        if (event.target.checked) {
            try {
                currentFilters.location = await getCurrentLocation();
            } catch (error) {
                alert(error.message);
                currentFilters.nearMe = false;
                currentFilters.location = null;
                nearMeCheckbox.checked = false;
                radiusContainer.classList.remove('active');
            }
        } else {
            currentFilters.location = null;
        }

        reloadFromFirstPage();
    });

    document.getElementById('radiusValue').addEventListener('change', (event) => {
        currentFilters.radius = Number.parseInt(event.target.value, 10) || 1000;
        if (currentFilters.nearMe) reloadFromFirstPage();
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
        currentFilters = {
            category: '',
            difficulty: 'all',
            age: 'all',
            durationBucket: 'all',
            nearMe: false,
            radius: 1000,
            location: null,
            sort: 'new',
        };

        document.querySelectorAll('.category-chip').forEach((chip) => chip.classList.remove('active'));
        document.getElementById('difficultySelect').value = 'all';
        document.getElementById('ageSelect').value = 'all';
        document.getElementById('durationSelect').value = 'all';
        document.getElementById('sortSelect').value = 'new';
        document.getElementById('nearMeCheckbox').checked = false;
        document.getElementById('radiusValue').value = '1000';
        document.getElementById('radiusContainer').classList.remove('active');

        reloadFromFirstPage();
    });
}

initFilters();
loadQuests();
