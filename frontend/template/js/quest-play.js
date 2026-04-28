// Модальное окно сообщений
const messageModal = document.getElementById('messageModal');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalOkBtn = document.getElementById('modalOkBtn');

function showModal(type, title, message) {
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
    messageModal.classList.remove('active');
    document.body.style.overflow = '';
}

modalOkBtn?.addEventListener('click', closeModal);
messageModal?.addEventListener('click', (e) => {
    if (e.target === messageModal) closeModal();
});

// Модальное окно жалобы
const complaintModal = document.getElementById('complaintModal');
const closeComplaintModal = document.getElementById('closeComplaintModal');
const cancelComplaintBtn = document.getElementById('cancelComplaintBtn');
const complaintForm = document.getElementById('complaintForm');

function openComplaintModal(checkpointId, checkpointTitle) {
    document.getElementById('complaintCheckpointId').value = checkpointId;
    document.getElementById('complaintCheckpointTitle').value = checkpointTitle;
    document.getElementById('complaintReason').value = '';
    document.getElementById('complaintDescription').value = '';
    complaintModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeComplaintModalFunc() {
    complaintModal.classList.remove('active');
    document.body.style.overflow = '';
}

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
    
    if (!reason) {
        showModal('warning', 'Внимание', 'Выберите причину жалобы');
        return;
    }
    if (description.length < 20) {
        showModal('warning', 'Внимание', 'Описание должно содержать минимум 20 символов');
        return;
    }
    
    showModal('success', 'Жалоба отправлена', `Жалоба на чекпоинт "${checkpointTitle}" отправлена модератору. Спасибо за бдительность!`);
    closeComplaintModalFunc();
});

// Данные квеста
const questData = {
    id: 1,
    title: "Тайны Старого Арбата",
    description: "Увлекательный квест по историческим переулкам Арбата. Вам предстоит найти тайные знаки, разгадать загадки прошлого и узнать интересные факты о знаменитых жителях этого района.",
    district: "Арбат",
    city: "Москва",
    checkpoints: [
        {
            id: 1,
            title: "Памятник Булату Окуджаве",
            task: "Какой музыкальный инструмент изображён в руках у поэта?",
            questionType: "code",
            correctAnswer: "гитара",
            hints: ["Струнный музыкальный инструмент", "У него 6 струн", "Любимый инструмент бардов"],
            basePoints: 50,
            coords: [55.7483, 37.5907]
        },
        {
            id: 2,
            title: "Стена Виктора Цоя",
            task: "Какая известная песня Виктора Цоя начинается со слов 'Перемен!'?",
            questionType: "choice",
            options: ["Группа крови", "Звезда по имени Солнце", "Кукушка", "Хочу перемен!"],
            correctOption: 3,
            hints: ["Эта песня стала гимном перестройки", "Название содержит восклицательный знак", "Песня о желании изменений"],
            basePoints: 50,
            coords: [55.7490, 37.5930]
        },
        {
            id: 3,
            title: "Театр имени Вахтангова",
            task: "В каком году был основан этот театр?",
            questionType: "code",
            correctAnswer: "1921",
            hints: ["Основан в начале 1920-х годов", "Число от 1920 до 1925", "Год основания - 1921"],
            basePoints: 50,
            coords: [55.7503, 37.5945]
        }
    ]
};

let currentCheckpointIndex = 0;
let totalPoints = 0;
let hintsUsedOnCurrentCheckpoint = 0;
let map = null;
let placemarks = [];
let startTime = new Date();
let selectedOption = null;

function calculatePointsForCheckpoint(checkpoint) {
    let points = checkpoint.basePoints;
    points -= hintsUsedOnCurrentCheckpoint * 10;
    return Math.max(0, points);
}

function renderProgress() {
    const container = document.getElementById('playContent');
    if (!container) return;
    
    const isCompleted = currentCheckpointIndex >= questData.checkpoints.length;
    
    let headerHtml = `
        <div class="play-header">
            <div class="quest-info">
                <h2><i class="fas fa-route" style="color: var(--yellow);"></i> ${questData.title}</h2>
                <p><i class="fas fa-location-dot"></i> ${questData.city}, ${questData.district}</p>
            </div>
            <div class="progress-block">
                <div class="checkpoint-circles" id="checkpointCircles"></div>
                <div class="points-badge">
                    <i class="fas fa-star"></i> <span id="pointsEarned">${totalPoints}</span> очков
                </div>
            </div>
        </div>
    `;
    
    if (!isCompleted) {
        container.innerHTML = headerHtml + `
            <div class="map-container">
                <div id="map"></div>
            </div>
            <div class="task-container" id="taskContainer"></div>
            <div class="action-buttons">
                <button class="btn btn-danger" id="abandonBtn"><i class="fas fa-times-circle"></i> Бросить квест</button>
            </div>
        `;
        renderCircles();
        renderCurrentTask();
        initMap();
    } else {
        const endTime = new Date();
        const totalMinutes = Math.floor((endTime - startTime) / 60000);
        const expectedTime = 90;
        const isFaster = totalMinutes < expectedTime;
        
        container.innerHTML = headerHtml + `
            <div class="task-container">
                <div class="completion-card">
                    <div class="completion-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h2>Поздравляем!</h2>
                    <p>Вы успешно прошли квест "${questData.title}"</p>
                    <div class="completion-stats">
                        <div class="completion-stat">
                            <div class="value">${totalPoints}</div>
                            <div>очков</div>
                        </div>
                        <div class="completion-stat">
                            <div class="value">${totalMinutes}</div>
                            <div>минут</div>
                        </div>
                        <div class="completion-stat">
                            <div class="value">${isFaster ? 'Быстрее' : 'Медленнее'}</div>
                            <div>запланированного</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="window.location.href='../index.html'">
                        <i class="fas fa-home"></i> Вернуться к квестам
                    </button>
                </div>
            </div>
        `;
    }
}

function renderCircles() {
    const circlesContainer = document.getElementById('checkpointCircles');
    if (circlesContainer) {
        circlesContainer.innerHTML = questData.checkpoints.map((cp, idx) => `
            <div class="circle ${idx < currentCheckpointIndex ? 'completed' : idx === currentCheckpointIndex ? 'active' : ''}" style="position: relative;">
                ${idx + 1}
                <div class="complaint-icon" onclick="event.stopPropagation(); openComplaintModal(${cp.id}, '${cp.title.replace(/'/g, "\\'")}')">
                    <i class="fas fa-flag"></i>
                </div>
            </div>
        `).join('');
    }
    const pointsSpan = document.getElementById('pointsEarned');
    if (pointsSpan) pointsSpan.textContent = totalPoints;
}

function renderCurrentTask() {
    const cp = questData.checkpoints[currentCheckpointIndex];
    const container = document.getElementById('taskContainer');
    if (!container || !cp) return;
    
    hintsUsedOnCurrentCheckpoint = 0;
    
    let hintsHtml = '';
    cp.hints.forEach((hint, idx) => {
        hintsHtml += `
            <div class="hint-card available" data-hint-index="${idx}" data-hint-text="${hint.replace(/"/g, '&quot;')}">
                <div class="hint-text">
                    <i class="fas fa-lightbulb"></i> 
                    <span>Подсказка ${idx + 1}</span>
                </div>
                <div class="hint-cost">-10 очков от награды</div>
            </div>
        `;
    });
    
    const currentPossiblePoints = calculatePointsForCheckpoint(cp);
    
    let taskContentHtml = `
        <div class="task-title">
            <div class="task-title-left">
                <i class="fas fa-map-pin"></i>
                <h3>${cp.title}</h3>
            </div>
            <button class="complaint-checkpoint-btn" onclick="openComplaintModal(${cp.id}, '${cp.title.replace(/'/g, "\\'")}')" title="Пожаловаться на чекпоинт">
                <i class="fas fa-flag"></i> Пожаловаться
            </button>
        </div>
        <div class="task-description">
            <p>${cp.task}</p>
        </div>
        <div class="points-info-bar">
            <span><i class="fas fa-star" style="color: var(--yellow);"></i> Базовая награда: ${cp.basePoints} очков</span>
            <span><i class="fas fa-lightbulb" style="color: var(--cyan);"></i> -10 очков за подсказку</span>
            <span><i class="fas fa-calculator" style="color: var(--mint);"></i> Текущая возможная награда: <strong style="color: var(--yellow);">${currentPossiblePoints}</strong> очков</span>
        </div>
        <div class="hints-section">
            <div class="hints-title">
                <i class="fas fa-lightbulb"></i>
                <span>Подсказки (можно открыть до ответа, каждая снижает награду на 10 очков)</span>
            </div>
            <div id="hintsContainer">${hintsHtml}</div>
        </div>
    `;
    
    if (cp.questionType === 'code') {
        taskContentHtml += `
            <div class="code-input-group">
                <label><i class="fas fa-keyboard"></i> Введите ответ</label>
                <input type="text" id="answerInput" class="code-input" placeholder="Введите код-слово...">
            </div>
            <button class="btn btn-primary" id="submitAnswerBtn">
                <i class="fas fa-check"></i> Проверить ответ
            </button>
        `;
    } else {
        let optionsHtml = '';
        cp.options.forEach((opt, idx) => {
            optionsHtml += `
                <div class="option-btn" data-option-index="${idx}">
                    <div class="option-marker"></div>
                    <div class="option-text">${opt}</div>
                </div>
            `;
        });
        taskContentHtml += `
            <div class="options-grid" id="optionsContainer">
                ${optionsHtml}
            </div>
            <button class="btn btn-primary" id="submitAnswerBtn">
                <i class="fas fa-check"></i> Ответить
            </button>
        `;
    }
    
    container.innerHTML = taskContentHtml;
    
    function updatePossiblePointsDisplay() {
        const newPossiblePoints = calculatePointsForCheckpoint(cp);
        const pointsSpan = document.querySelector('.points-info-bar span:last-child strong');
        if (pointsSpan) {
            pointsSpan.textContent = newPossiblePoints;
        }
    }
    
    document.querySelectorAll('.hint-card.available').forEach(hintCard => {
        hintCard.addEventListener('click', (e) => {
            e.stopPropagation();
            const hintText = hintCard.querySelector('.hint-text span:last-child')?.textContent || '';
            
            if (hintsUsedOnCurrentCheckpoint < 3) {
                hintsUsedOnCurrentCheckpoint++;
                showModal('info', 'Подсказка', hintText);
                hintCard.classList.remove('available');
                hintCard.classList.add('revealed');
                const costSpan = hintCard.querySelector('.hint-cost');
                if (costSpan) costSpan.innerHTML = 'использована (-10 очков)';
                updatePossiblePointsDisplay();
            } else {
                showModal('warning', 'Лимит подсказок', 'Вы уже использовали все 3 подсказки для этого вопроса');
            }
        });
    });
    
    if (cp.questionType === 'choice') {
        selectedOption = null;
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedOption = parseInt(btn.dataset.optionIndex);
            });
        });
        
        document.getElementById('submitAnswerBtn').onclick = () => {
            if (selectedOption === null) {
                showModal('warning', 'Внимание', 'Выберите вариант ответа');
                return;
            }
            if (selectedOption === cp.correctOption) {
                const earnedPoints = calculatePointsForCheckpoint(cp);
                totalPoints += earnedPoints;
                const hintsUsedMsg = hintsUsedOnCurrentCheckpoint > 0 ? ` (использовано подсказок: ${hintsUsedOnCurrentCheckpoint}, -${hintsUsedOnCurrentCheckpoint * 10} очков)` : '';
                showModal('success', 'Правильно!', `Ответ верный! Вы получили ${earnedPoints} очков${hintsUsedMsg}`);
                nextCheckpoint();
            } else {
                showModal('error', 'Неверно', 'Ответ неверный. Очки за этот вопрос не начислены.');
                nextCheckpoint();
            }
        };
    } else {
        document.getElementById('submitAnswerBtn').onclick = () => {
            const answer = document.getElementById('answerInput').value.trim().toLowerCase();
            if (!answer) {
                showModal('warning', 'Внимание', 'Введите ответ');
                return;
            }
            if (answer === cp.correctAnswer.toLowerCase()) {
                const earnedPoints = calculatePointsForCheckpoint(cp);
                totalPoints += earnedPoints;
                const hintsUsedMsg = hintsUsedOnCurrentCheckpoint > 0 ? ` (использовано подсказок: ${hintsUsedOnCurrentCheckpoint}, -${hintsUsedOnCurrentCheckpoint * 10} очков)` : '';
                showModal('success', 'Правильно!', `Ответ верный! Вы получили ${earnedPoints} очков${hintsUsedMsg}`);
                nextCheckpoint();
            } else {
                showModal('error', 'Неверно', 'Ответ неверный. Очки за этот вопрос не начислены.');
                nextCheckpoint();
            }
        };
    }
}

function nextCheckpoint() {
    currentCheckpointIndex++;
    if (currentCheckpointIndex >= questData.checkpoints.length) {
        renderProgress();
    } else {
        updateMapMarkers();
        renderProgress();
    }
}

function initMap() {
    if (typeof ymaps === 'undefined') {
        setTimeout(initMap, 500);
        return;
    }
    
    const cp = questData.checkpoints[currentCheckpointIndex];
    ymaps.ready(() => {
        if (map) {
            map.destroy();
        }
        map = new ymaps.Map('map', {
            center: cp.coords,
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl']
        });
        
        placemarks = [];
        questData.checkpoints.forEach((point, idx) => {
            let color;
            if (idx < currentCheckpointIndex) color = '#02F4CA';
            else if (idx === currentCheckpointIndex) color = '#FFFF1B';
            else color = '#475569';
            
            const placemark = new ymaps.Placemark(point.coords, {
                balloonContent: `
                    <strong>${idx + 1}. ${point.title}</strong><br>
                    ${point.task}<br><br>
                    <button onclick="openComplaintModal(${point.id}, '${point.title.replace(/'/g, "\\'")}')" style="background: #ED1C24; color: white; border: none; padding: 5px 12px; border-radius: 20px; cursor: pointer; margin-top: 8px;">
                        <i class="fas fa-flag"></i> Пожаловаться
                    </button>
                `
            }, {
                preset: `islands#${color === '#FFFF1B' ? 'yellow' : color === '#02F4CA' ? 'green' : 'gray'}Icon`
            });
            map.geoObjects.add(placemark);
            placemarks.push(placemark);
        });
    });
}

function updateMapMarkers() {
    if (!map) return;
    const cp = questData.checkpoints[currentCheckpointIndex];
    map.setCenter(cp.coords, 15);
    placemarks.forEach((pm, idx) => {
        let color;
        if (idx < currentCheckpointIndex) color = '#02F4CA';
        else if (idx === currentCheckpointIndex) color = '#FFFF1B';
        else color = '#475569';
        pm.options.set('preset', `islands#${color === '#FFFF1B' ? 'yellow' : color === '#02F4CA' ? 'green' : 'gray'}Icon`);
    });
}

document.getElementById('playContent')?.addEventListener('click', (e) => {
    if (e.target.id === 'abandonBtn' || e.target.closest('#abandonBtn')) {
        showModal('warning', 'Бросить квест?', 'Весь прогресс будет потерян. Вы уверены?');
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn btn-danger';
        confirmBtn.textContent = 'Да, бросить';
        confirmBtn.onclick = () => {
            closeModal();
            window.location.href = '../index.html';
        };
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.textContent = 'Отмена';
        cancelBtn.onclick = closeModal;
        const modalButtons = document.querySelector('#messageModal .modal-buttons');
        modalButtons.innerHTML = '';
        modalButtons.appendChild(cancelBtn);
        modalButtons.appendChild(confirmBtn);
    }
});

window.openComplaintModal = openComplaintModal;
renderProgress();