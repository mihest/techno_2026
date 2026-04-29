// Переключение вкладок рейтинга
const teamsRanking = document.getElementById('teamsRanking');
const soloRanking = document.getElementById('soloRanking');
const rankingTabs = document.querySelectorAll('.tab-btn-ranking');
const teamsBody = document.getElementById('teamsLeaderboardBody');
const soloBody = document.getElementById('soloLeaderboardBody');

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

function rankCell(rank) {
    if (rank === 1) return `<td class="rank-1"><i class="fas fa-crown"></i> ${rank}</td>`;
    if (rank === 2) return `<td class="rank-2"><i class="fas fa-medal"></i> ${rank}</td>`;
    if (rank === 3) return `<td class="rank-3"><i class="fas fa-medal"></i> ${rank}</td>`;
    return `<td>${rank}</td>`;
}

function renderSoloLeaderboard(items) {
    if (!soloBody) return;
    if (!items.length) {
        soloBody.innerHTML = `<tr><td colspan="6">Нет данных</td></tr>`;
        return;
    }

    soloBody.innerHTML = items.map((item, index) => `
        <tr>
            ${rankCell(index + 1)}
            <td><strong>${item.username || 'Unknown'}</strong></td>
            <td>—</td>
            <td>${item.completed_quests ?? 0}</td>
            <td class="points">${item.rating ?? 0}</td>
            <td>${item.average_time_minutes ?? '—'}${item.average_time_minutes ? ' мин' : ''}</td>
        </tr>
    `).join('');
}

function renderTeamsLeaderboard(items) {
    if (!teamsBody) return;
    if (!items.length) {
        teamsBody.innerHTML = `<tr><td colspan="5">Нет данных</td></tr>`;
        return;
    }

    teamsBody.innerHTML = items.map((item, index) => `
        <tr>
            ${rankCell(index + 1)}
            <td><strong>${item.team_name || 'Unknown'}</strong></td>
            <td>${item.completed_quests ?? 0}</td>
            <td class="points">${item.rating ?? 0}</td>
            <td>${item.average_time_minutes ?? '—'}${item.average_time_minutes ? ' мин' : ''}</td>
        </tr>
    `).join('');
}

async function loadLeaderboards() {
    if (!window.AuthApi) return;
    try {
        const [solo, teams] = await Promise.all([
            AuthApi.authorizedFetch('/accounts/Leaderboard/Solo?count=50'),
            AuthApi.authorizedFetch('/accounts/Leaderboard/Teams?count=50'),
        ]);
        renderSoloLeaderboard(Array.isArray(solo) ? solo : []);
        renderTeamsLeaderboard(Array.isArray(teams) ? teams : []);
    } catch (error) {
        console.error('Ошибка загрузки leaderboard:', error);
        renderSoloLeaderboard([]);
        renderTeamsLeaderboard([]);
    }
}

loadLeaderboards();