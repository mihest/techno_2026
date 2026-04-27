let currentStep = 1;
window.nextStep = function (step) {
    document.getElementById('step1').classList.toggle('hidden', step !== 1);
    document.getElementById('step2').classList.toggle('hidden', step !== 2);
    document.getElementById('step3').classList.toggle('hidden', step !== 3);
    document.getElementById('progressBar').style.width = (step * 33.33) + '%';
    if (step === 3) {
        document.getElementById('previewTitle').textContent = document.getElementById('qTitle').value || 'Название';
        document.getElementById('previewDistrict').textContent = document.getElementById('qDistrict').value || '—';
        document.getElementById('previewDiff').textContent = document.getElementById('qDifficulty').value;
        document.getElementById('previewDur').textContent = document.getElementById('qDuration').value || '60';
        document.getElementById('previewCP').textContent = document.querySelectorAll('#checkpointsContainer .checkpoint-item').length;
    }
};
window.addCheckpoint = function () {
    const container = document.getElementById('checkpointsContainer');
    const num = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'checkpoint-item';
    div.innerHTML = `<span class="checkpoint-number">${num}</span>
        <div class="flex-1">
          <input class="form-input" placeholder="Название точки">
          <input class="form-input mt-16" placeholder="Задание (мин. 20 символов)">
        </div>`;
    container.appendChild(div);
};
document.getElementById('progressBar').style.width = '33%';