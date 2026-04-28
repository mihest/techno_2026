// Данные
let checkpoints = [];
let editingIndex = null;
let map = null;
let placemark = null;
let selectedCoords = [55.751574, 37.573856];
let coverData = null;
let selectedCategories = [];

// Список категорий
const categoriesData = [
    "История", "Архитектура", "Техно", "Природа", "Искусство",
    "Еда", "Мистика", "Спорт", "Урбанистика", "Музыка",
    "Наука", "Гастрономия", "Медиа", "Игровая индустрия", "Волонтёрство"
];

function renderCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    container.innerHTML = categoriesData.map(cat => `
        <span class="category-chip" data-cat="${cat}">${cat}</span>
    `).join('');
    
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const cat = chip.dataset.cat;
            const idx = selectedCategories.indexOf(cat);
            if (idx === -1) {
                selectedCategories.push(cat);
                chip.classList.add('active');
            } else {
                selectedCategories.splice(idx, 1);
                chip.classList.remove('active');
            }
            updatePreview();
        });
    });
}

// Шаги
let currentStep = 1;
const totalSteps = 3;

function updateStepUI() {
    const steps = document.querySelectorAll('.step');
    const contents = document.querySelectorAll('.step-content');
    steps.forEach((step, idx) => {
        const stepNum = idx + 1;
        if (stepNum < currentStep) { step.classList.add('completed'); step.classList.remove('active'); }
        else if (stepNum === currentStep) { step.classList.add('active'); step.classList.remove('completed'); }
        else { step.classList.remove('active', 'completed'); }
    });
    contents.forEach((content, idx) => {
        if (idx + 1 === currentStep) content.classList.add('active');
        else content.classList.remove('active');
    });
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    if (currentStep === 1) { prevBtn.style.display = 'none'; nextBtn.style.display = 'flex'; submitBtn.style.display = 'none'; }
    else if (currentStep === totalSteps) { prevBtn.style.display = 'flex'; nextBtn.style.display = 'none'; submitBtn.style.display = 'flex'; }
    else { prevBtn.style.display = 'flex'; nextBtn.style.display = 'flex'; submitBtn.style.display = 'none'; }
}

function nextStep() {
    if (currentStep < totalSteps) {
        if (currentStep === 1) {
            const title = document.getElementById('questTitle').value;
            if (!title) { alert('Заполните название квеста'); return; }
        }
        currentStep++;
        updateStepUI();
        updatePreview();
    }
}

function prevStep() { if (currentStep > 1) { currentStep--; updateStepUI(); } }

document.querySelectorAll('.step').forEach(step => {
    step.addEventListener('click', () => {
        const stepNum = parseInt(step.dataset.step);
        if (stepNum <= currentStep + 1) { currentStep = stepNum; updateStepUI(); updatePreview(); }
    });
});

document.getElementById('prevBtn').addEventListener('click', prevStep);
document.getElementById('nextBtn').addEventListener('click', nextStep);

function getDifficultyText(level) {
    const levels = { 1: 'Очень легко', 2: 'Легко', 3: 'Средне', 4: 'Сложно', 5: 'Экстрим' };
    return levels[level] || 'Средне';
}

function updatePreview() {
    const title = document.getElementById('questTitle').value || 'Название квеста';
    const city = document.getElementById('questCity').value || 'Город';
    const district = document.getElementById('questDistrict').value || 'Район';
    const duration = document.getElementById('questDuration').value || '0';
    const description = document.getElementById('questDescription').value || 'Описание квеста появится здесь...';
    const difficulty = parseInt(document.getElementById('questDifficulty').value) || 3;
    const ageGroupSelect = document.getElementById('questAgeGroup');
    const ageGroupText = ageGroupSelect.options[ageGroupSelect.selectedIndex]?.text || '14-15 лет';
    const warnings = document.getElementById('questWarnings').value;
    const rules = document.getElementById('questRules').value;
    const whatToTake = document.getElementById('questWhatToTake').value;
    
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= difficulty ? '<i class="fas fa-star" style="color: var(--yellow);"></i>' : '<i class="fas fa-star" style="color: var(--border);"></i>';
    }
    
    let coverHtml = coverData ? `<img src="${coverData}" class="preview-cover-img">` : `<div class="preview-placeholder"><i class="fas fa-image"></i> <span style="margin-left: 8px;">Нет обложки</span></div>`;
    
    let categoriesHtml = '';
    if (selectedCategories.length > 0) {
        categoriesHtml = `<div class="preview-categories" style="display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0;">${selectedCategories.map(cat => `<span style="background: rgba(255,255,27,0.15); padding:4px 12px; border-radius:20px; font-size:0.7rem; color:var(--yellow);">${cat}</span>`).join('')}</div>`;
    }
    
    let checkpointsHtml = '';
    if (checkpoints.length > 0) {
        checkpointsHtml = `<div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border);"><strong><i class="fas fa-list"></i> Чекпоинты (${checkpoints.length}):</strong>${checkpoints.map((cp, idx) => `<div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border);"><div style="width:28px; height:28px; background:var(--bg-card); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:700; color:var(--yellow);">${idx+1}</div><div style="flex:1;">${escapeHtml(cp.title)}</div><div style="font-size:0.7rem; color:var(--text-secondary);">${cp.questionType === 'code' ? 'Код-слово' : 'Выбор ответа'}</div></div>`).join('')}</div>`;
    } else {
        checkpointsHtml = `<div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border);"><em style="color:var(--text-secondary);">Чекпоинты не добавлены</em></div>`;
    }
    
    const previewCard = document.getElementById('previewCard');
    if (previewCard) {
        previewCard.innerHTML = `
            <div class="preview-header"><i class="fas fa-eye"></i><span>Предпросмотр квеста</span></div>
            <div class="preview-content">
                ${coverHtml}
                <h3>${escapeHtml(title)}</h3>
                <div style="display:flex; flex-wrap:wrap; gap:20px; margin-bottom:12px; font-size:0.8rem; color:var(--text-secondary);">
                    <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(city)}, ${escapeHtml(district)}</span>
                    <span><i class="fas fa-clock"></i> ${duration} мин</span>
                    <span><i class="fas fa-users"></i> ${ageGroupText}</span>
                </div>
                <div style="margin-bottom:12px;">${stars} <span style="margin-left:8px; color:var(--text-secondary);">${getDifficultyText(difficulty)}</span></div>
                ${categoriesHtml}
                <p><strong>Описание:</strong> ${escapeHtml(description.substring(0, 200))}${description.length > 200 ? '...' : ''}</p>
                ${warnings ? `<p><strong><i class="fas fa-exclamation-triangle"></i> Предупреждения:</strong> ${escapeHtml(warnings.substring(0, 150))}</p>` : ''}
                ${rules ? `<p><strong><i class="fas fa-gavel"></i> Правила:</strong> ${escapeHtml(rules.substring(0, 150))}</p>` : ''}
                ${whatToTake ? `<p><strong><i class="fas fa-backpack"></i> Что взять:</strong> ${escapeHtml(whatToTake.substring(0, 150))}</p>` : ''}
                ${checkpointsHtml}
            </div>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

['questTitle', 'questCity', 'questDistrict', 'questDuration', 'questDescription', 'questDifficulty', 'questAgeGroup', 'questWarnings', 'questRules', 'questWhatToTake'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', updatePreview);
        el.addEventListener('change', updatePreview);
    }
});

// Обложка
const dropzone = document.getElementById('dropzone');
const coverInput = document.getElementById('coverInput');
const coverPreviewDiv = document.getElementById('coverPreview');
if (dropzone) {
    dropzone.addEventListener('click', () => coverInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) handleCoverFile(file);
    });
}
if (coverInput) {
    coverInput.addEventListener('change', (e) => { if (e.target.files[0]) handleCoverFile(e.target.files[0]); });
}

function handleCoverFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        coverData = event.target.result;
        if (coverPreviewDiv) {
            coverPreviewDiv.innerHTML = `<div style="position:relative; display:inline-block;"><img src="${coverData}" style="max-width:200px; border-radius:16px; border:2px solid var(--yellow);"><button type="button" class="remove-cover" id="removeCoverBtn"><i class="fas fa-times"></i></button></div>`;
            const removeBtn = document.getElementById('removeCoverBtn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => { coverData = null; coverPreviewDiv.innerHTML = ''; coverInput.value = ''; updatePreview(); });
            }
        }
        updatePreview();
    };
    reader.readAsDataURL(file);
}

// Чекпоинты
function renderCheckpointsList() {
    const container = document.getElementById('checkpointsList');
    if (!container) return;
    if (checkpoints.length === 0) {
        container.innerHTML = `<div class="empty-checkpoints"><i class="fas fa-map-marker-alt"></i><p>Нет добавленных чекпоинтов</p><p>Нажмите "Добавить чекпоинт" чтобы создать первый</p></div>`;
    } else {
        container.innerHTML = checkpoints.map((cp, idx) => `
            <div class="checkpoint-card-preview">
                <div><strong>${idx + 1}. ${escapeHtml(cp.title)}</strong><div style="font-size:0.7rem; color:var(--text-secondary);">${cp.questionType === 'code' ? 'Код-слово' : 'Вопрос с вариантами'}</div></div>
                <div><button class="btn btn-outline btn-sm" onclick="window.editCheckpoint(${idx})"><i class="fas fa-pen"></i></button> <button class="btn btn-danger btn-sm" onclick="window.deleteCheckpoint(${idx})"><i class="fas fa-trash"></i></button></div>
            </div>
        `).join('');
    }
    const errorDiv = document.getElementById('checkpointError');
    if (errorDiv) {
        if (checkpoints.length >= 3) errorDiv.style.display = 'none';
        else errorDiv.style.display = 'block';
    }
    updatePreview();
}

window.deleteCheckpoint = function(index) {
    if (confirm('Удалить этот чекпоинт?')) { checkpoints.splice(index, 1); renderCheckpointsList(); }
};

window.editCheckpoint = function(index) {
    editingIndex = index;
    const cp = checkpoints[index];
    openCheckpointModal(cp.coords, cp);
};

// Функции для управления required атрибутами
function disableChoiceRequired() {
    const choiceInputs = ['option1', 'option2', 'option3', 'option4'];
    choiceInputs.forEach(name => {
        const input = document.querySelector(`#checkpointForm [name="${name}"]`);
        if (input) input.removeAttribute('required');
    });
    const correctRadio = document.querySelector('#checkpointForm [name="correctOption"]');
    if (correctRadio) correctRadio.removeAttribute('required');
}

function enableChoiceRequired() {
    const choiceInputs = ['option1', 'option2', 'option3', 'option4'];
    choiceInputs.forEach(name => {
        const input = document.querySelector(`#checkpointForm [name="${name}"]`);
        if (input) input.setAttribute('required', 'required');
    });
    const correctRadio = document.querySelector('#checkpointForm [name="correctOption"]');
    if (correctRadio) correctRadio.setAttribute('required', 'required');
}

function disableCodeRequired() {
    const codeInput = document.querySelector('#checkpointForm [name="correctCode"]');
    if (codeInput) codeInput.removeAttribute('required');
    const hintInputs = ['hint1', 'hint2', 'hint3'];
    hintInputs.forEach(name => {
        const input = document.querySelector(`#checkpointForm [name="${name}"]`);
        if (input) input.removeAttribute('required');
    });
}

function enableCodeRequired() {
    const codeInput = document.querySelector('#checkpointForm [name="correctCode"]');
    if (codeInput) codeInput.setAttribute('required', 'required');
    const hintInputs = ['hint1', 'hint2', 'hint3'];
    hintInputs.forEach(name => {
        const input = document.querySelector(`#checkpointForm [name="${name}"]`);
        if (input) input.setAttribute('required', 'required');
    });
}

// Карта
function initMap() {
    if (typeof ymaps === 'undefined') {
        console.error('Yandex Maps API not loaded');
        return;
    }
    ymaps.ready(() => {
        map = new ymaps.Map('map', { center: selectedCoords, zoom: 14, controls: ['zoomControl', 'fullscreenControl'] });
        placemark = new ymaps.Placemark(selectedCoords, {}, { preset: 'islands#redIcon', draggable: true });
        placemark.events.add('dragend', () => {
            selectedCoords = placemark.geometry.getCoordinates();
            const coordsInfo = document.getElementById('coordsInfo');
            if (coordsInfo) coordsInfo.innerHTML = `<i class="fas fa-location-dot"></i> Координаты: ${selectedCoords[0].toFixed(6)}, ${selectedCoords[1].toFixed(6)}`;
        });
        map.geoObjects.add(placemark);
        map.events.add('click', (e) => {
            selectedCoords = e.get('coords');
            placemark.geometry.setCoordinates(selectedCoords);
            const coordsInfo = document.getElementById('coordsInfo');
            if (coordsInfo) coordsInfo.innerHTML = `<i class="fas fa-location-dot"></i> Координаты: ${selectedCoords[0].toFixed(6)}, ${selectedCoords[1].toFixed(6)}`;
        });
    });
}

const modal = document.getElementById('checkpointModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

function openCheckpointModal(coords = [55.751574, 37.573856], cpData = null) {
    selectedCoords = coords;
    const form = document.getElementById('checkpointForm');
    if (form) form.reset();
    
    const codeFields = document.getElementById('codeFields');
    const choiceFields = document.getElementById('choiceFields');
    
    // По умолчанию показываем codeFields
    if (codeFields) codeFields.style.display = 'block';
    if (choiceFields) choiceFields.style.display = 'none';
    enableCodeRequired();
    disableChoiceRequired();
    
    const coordsInfo = document.getElementById('coordsInfo');
    if (coordsInfo) coordsInfo.innerHTML = `<i class="fas fa-location-dot"></i> Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`;
    
    if (cpData && form) {
        const titleInput = form.querySelector('[name="title"]');
        const taskInput = form.querySelector('[name="task"]');
        const typeSelect = form.querySelector('[name="questionType"]');
        if (titleInput) titleInput.value = cpData.title;
        if (taskInput) taskInput.value = cpData.task;
        if (typeSelect) typeSelect.value = cpData.questionType;
        
        if (cpData.questionType === 'code') {
            if (codeFields) codeFields.style.display = 'block';
            if (choiceFields) choiceFields.style.display = 'none';
            enableCodeRequired();
            disableChoiceRequired();
            
            const correctCodeInput = form.querySelector('[name="correctCode"]');
            if (correctCodeInput) correctCodeInput.value = cpData.correctCode;
            if (cpData.hints) {
                const hint1 = form.querySelector('[name="hint1"]');
                const hint2 = form.querySelector('[name="hint2"]');
                const hint3 = form.querySelector('[name="hint3"]');
                if (hint1) hint1.value = cpData.hints[0] || '';
                if (hint2) hint2.value = cpData.hints[1] || '';
                if (hint3) hint3.value = cpData.hints[2] || '';
            }
        } else {
            if (codeFields) codeFields.style.display = 'none';
            if (choiceFields) choiceFields.style.display = 'block';
            disableCodeRequired();
            enableChoiceRequired();
            
            for (let i = 0; i < cpData.options.length; i++) {
                const optionInput = form.querySelector(`[name="option${i+1}"]`);
                if (optionInput) optionInput.value = cpData.options[i];
            }
            const correctRadio = form.querySelector(`[name="correctOption"][value="${cpData.correctOption + 1}"]`);
            if (correctRadio) correctRadio.checked = true;
        }
        const pointRulesInput = form.querySelector('[name="pointRules"]');
        if (pointRulesInput) pointRulesInput.value = cpData.pointRules || '';
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    setTimeout(() => {
        if (!map) initMap();
        else { map.setCenter(selectedCoords, 14); if (placemark) placemark.geometry.setCoordinates(selectedCoords); }
    }, 100);
}

function closeCheckpointModal() { 
    if (modal) modal.classList.remove('active'); 
    document.body.style.overflow = ''; 
    editingIndex = null; 
}

const addCheckpointBtn = document.getElementById('addCheckpointBtn');
if (addCheckpointBtn) {
    addCheckpointBtn.addEventListener('click', () => { editingIndex = null; openCheckpointModal(); });
}
if (closeModalBtn) closeModalBtn.addEventListener('click', closeCheckpointModal);
if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeCheckpointModal);
if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeCheckpointModal(); });

const questionType = document.getElementById('questionType');
if (questionType) {
    questionType.addEventListener('change', (e) => {
        const codeFields = document.getElementById('codeFields');
        const choiceFields = document.getElementById('choiceFields');
        if (e.target.value === 'code') {
            if (codeFields) codeFields.style.display = 'block';
            if (choiceFields) choiceFields.style.display = 'none';
            enableCodeRequired();
            disableChoiceRequired();
        } else {
            if (codeFields) codeFields.style.display = 'none';
            if (choiceFields) choiceFields.style.display = 'block';
            disableCodeRequired();
            enableChoiceRequired();
        }
    });
}

const checkpointForm = document.getElementById('checkpointForm');
if (checkpointForm) {
    checkpointForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const formData = new FormData(checkpointForm);
        const title = formData.get('title');
        const task = formData.get('task');
        const questionTypeValue = formData.get('questionType');
        
        if (!title || !title.trim()) {
            alert('Введите название чекпоинта');
            return;
        }
        if (!task || !task.trim()) {
            alert('Введите задание для чекпоинта');
            return;
        }
        
        const checkpoint = {
            title: title.trim(),
            task: task.trim(),
            questionType: questionTypeValue,
            coords: selectedCoords,
            pointRules: formData.get('pointRules') || ''
        };
        
        if (checkpoint.questionType === 'code') {
            const correctCode = formData.get('correctCode');
            if (!correctCode || !correctCode.trim()) {
                alert('Введите правильный код-слово');
                return;
            }
            checkpoint.correctCode = correctCode.trim();
            checkpoint.hints = [
                formData.get('hint1') || '',
                formData.get('hint2') || '',
                formData.get('hint3') || ''
            ];
        } else {
            const options = [];
            let hasEmptyOption = false;
            for (let i = 1; i <= 4; i++) {
                const opt = formData.get(`option${i}`);
                if (!opt || !opt.trim()) {
                    hasEmptyOption = true;
                    break;
                }
                options.push(opt.trim());
            }
            if (hasEmptyOption) {
                alert('Заполните все варианты ответов');
                return;
            }
            const correctOption = formData.get('correctOption');
            if (!correctOption) {
                alert('Выберите правильный вариант ответа');
                return;
            }
            checkpoint.options = options;
            checkpoint.correctOption = parseInt(correctOption) - 1;
        }
        
        if (editingIndex !== null) {
            checkpoints[editingIndex] = checkpoint;
        } else {
            checkpoints.push(checkpoint);
        }
        
        renderCheckpointsList();
        closeCheckpointModal();
        
        // Очищаем форму
        checkpointForm.reset();
        const codeFields = document.getElementById('codeFields');
        const choiceFields = document.getElementById('choiceFields');
        if (codeFields) codeFields.style.display = 'block';
        if (choiceFields) choiceFields.style.display = 'none';
        enableCodeRequired();
        disableChoiceRequired();
    });
}

const submitBtn = document.getElementById('submitBtn');
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        const titleInput = document.getElementById('questTitle');
        if (!titleInput || !titleInput.value) { alert('Заполните название квеста'); currentStep = 1; updateStepUI(); return; }
        if (checkpoints.length < 3) { alert('Добавьте минимум 3 чекпоинта'); currentStep = 2; updateStepUI(); return; }
        alert('Квест успешно отправлен на модерацию! Ожидайте проверки (до 48 часов).');
    });
}

// Инициализация
renderCategories();
renderCheckpointsList();
updateStepUI();
updatePreview();