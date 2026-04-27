const quests = [
    { title:'Тайны Арбата', district:'ЦАО', diff:2, duration:45, points:5, icon:'fa-mask' },
    { title:'Парк Горького', district:'ЦАО', diff:3, duration:60, points:7, icon:'fa-tree' },
    { title:'ВДНХ: Космический', district:'СВАО', diff:4, duration:90, points:6, icon:'fa-rocket' },
];
document.getElementById('questsGrid').innerHTML = quests.map(q => `
      <div class="card card-interactive" onclick="location.href='quest-detail.html'">
        <div class="quest-card-img">
          <i class="fas ${q.icon} fa-3x icon-primary"></i>
        </div>
        <div class="quest-card-body">
          <h3>${q.title}</h3>
          <p class="text-secondary"><i class="fas fa-map-marker-alt"></i> ${q.district}</p>
          <div class="flex gap-8 mt-16">
            <span class="badge badge-primary"><i class="fas fa-star"></i> ${q.diff}</span>
            <span class="badge badge-accent"><i class="fas fa-clock"></i> ${q.duration} мин</span>
            <span class="badge badge-success"><i class="fas fa-flag"></i> ${q.points} точек</span>
          </div>
        </div>
      </div>
    `).join('');