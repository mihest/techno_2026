function showToast(msg, type = '') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
}

function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('hidden');
}
function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('hidden');
}

function switchTab(tab) {
    document.getElementById('tabPending').classList.toggle('hidden', tab !== 'pending');
    document.getElementById('tabComplaints').classList.toggle('hidden', tab !== 'complaints');
    document.getElementById('tabHistory').classList.toggle('hidden', tab !== 'history');
    document.querySelectorAll('.tabs .tab').forEach((t, i) => {
        t.classList.toggle('active', (i === 0 && tab === 'pending') || (i === 1 && tab === 'complaints') || (i === 2 && tab === 'history'));
    });
}



