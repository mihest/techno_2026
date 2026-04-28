// Переключение вкладок рейтинга
const teamsRanking = document.getElementById('teamsRanking');
const soloRanking = document.getElementById('soloRanking');
const rankingTabs = document.querySelectorAll('.tab-btn-ranking');

rankingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        
        rankingTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        if (tabId === 'teams') {
            teamsRanking.classList.add('active');
            soloRanking.classList.remove('active');
        } else {
            teamsRanking.classList.remove('active');
            soloRanking.classList.add('active');
        }
    });
});