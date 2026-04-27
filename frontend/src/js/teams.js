const teams = [
    { id:1, name:'Искатели', members:4, points:1250, quests:8, icon:'fa-magnifying-glass' },
    { id:2, name:'Городские лисы', members:3, points:980, quests:6, icon:'fa-paw' },
    { id:3, name:'Адреналин', members:5, points:2100, quests:12, icon:'fa-bolt' },
];
function renderTeams() {
    document.getElementById('teamsList').innerHTML = teams.map(t => `
        <div class="card card-interactive" onclick="location.href='team-detail.html'">
          <div class="card-body flex items-center gap-16">
            <i class="fas ${t.icon} fa-2x icon-primary"></i>
            <div class="flex-1">
              <h3>${t.name}</h3>
              <span class="text-secondary" style="font-size:0.85rem;">
                <i class="fas fa-users"></i> ${t.members} ·
                <i class="fas fa-star"></i> ${t.points} очков ·
                <i class="fas fa-check-circle"></i> ${t.quests} квестов
              </span>
            </div>
          </div>
        </div>
      `).join('');
}

function joinTeam() {
    const code = document.getElementById('joinCode').value.trim();
    if (code) showToast('Заявка отправлена!', 'success');
}
renderTeams();