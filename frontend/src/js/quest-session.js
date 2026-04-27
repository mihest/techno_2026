let cp = 1, total = 5, attempts = 0;
window.submitAnswer = function () {
    attempts++;
    if (attempts >= 5) {
        showToast('Попытки исчерпаны', 'error');
        return;
    }
    if (cp < total) {
        cp++;
        document.getElementById('sessionProgress').textContent = `${cp}/${total}`;
        document.getElementById('progressFill').style.width = (cp / total * 100) + '%';
        document.querySelector('.checkpoint-number.current').classList.replace('current', 'completed');
        showToast('Правильно! +10 очков', 'success');
    } else {
        showToast('Квест завершён! +50 очков', 'success');
        setTimeout(() => location.href = 'rating.html', 1500);
    }
};