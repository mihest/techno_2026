    const burgerBtn = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    function openMenu() {
        mobileMenu?.classList.add('active');
        menuOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileMenu?.classList.remove('active');
        menuOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    burgerBtn?.addEventListener('click', openMenu);
    closeMenuBtn?.addEventListener('click', closeMenu);
    menuOverlay?.addEventListener('click', closeMenu);

    function formatDate(dateString) {
        if (!dateString) return '—';

        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '—';

        return date.toLocaleDateString('ru-RU');
    }

    async function loadTeamManagement() {
        try {
            const team = await AuthApi.authorizedFetch('/teams');
            const session = AuthApi.getSession();
            const currentUserId = session?.user?.id;

            console.log('TEAM:', team);

            if (!team || typeof team !== 'object') {
                alert('Команда не найдена');
                window.location.href = 'profile.html';
                return;
            }

            const members = Array.isArray(team.team_members) ? team.team_members : [];
            const owner = members.find(member => member.user_id === team.owner_id)?.user;
            const isOwner = team.owner_id === currentUserId;

            document.querySelector('.team-details h1').innerHTML = `
                <i class="fas fa-crown" style="color: var(--yellow);"></i>
                ${team.name || 'Команда'}
            `;

            document.querySelector('.team-meta').innerHTML = `
                <span><i class="fas fa-calendar-alt"></i> Создана: ${formatDate(team.created_at)}</span>
                <span><i class="fas fa-user-check"></i> Капитан: ${owner?.username || '—'}</span>
                <span><i class="fas fa-users"></i> ${members.length} участников</span>
            `;

            document.getElementById('inviteCode').textContent = team.join_code || '—';

            const membersList = document.getElementById('membersList');
            const emptyMembers = document.getElementById('emptyMembers');

            membersList.innerHTML = '';

            if (!members.length) {
                emptyMembers.style.display = 'block';
                return;
            }

            emptyMembers.style.display = 'none';

            members.forEach(member => {
                const user = member.user || {};
                const memberIsOwner = member.user_id === team.owner_id;

                membersList.insertAdjacentHTML('beforeend', `
                    <div class="member-item">
                        <div class="member-info">
                            <div class="member-avatar">
                                <i class="fas ${memberIsOwner ? 'fa-crown' : 'fa-user'}"></i>
                            </div>
                            <div class="member-details">
                                <h4>${user.username || 'Пользователь'}</h4>
                                <p>${user.role || 'Участник'} • В команде с ${formatDate(member.created_at)}</p>
                            </div>
                            ${
                                memberIsOwner
                                    ? `<span class="member-badge"><i class="fas fa-star"></i> Капитан</span>`
                                    : ''
                            }
                        </div>
                        <div class="member-actions">
                            <span class="quest-status status-published">
                                <i class="fas fa-check-circle"></i> Активен
                            </span>
                            ${
                                isOwner && !memberIsOwner
                                    ? `
                                        <button class="btn btn-outline captain-btn btn-sm" disabled>
                                            <i class="fas fa-user-shield"></i> Передать капитанство
                                        </button>
                                        <button class="btn btn-danger btn-sm" disabled>
                                            <i class="fas fa-user-minus"></i> Заблокировать
                                        </button>
                                        <button class="btn btn-danger btn-sm" disabled>
                                            <i class="fas fa-user-minus"></i> Исключить
                                        </button>
                                    `
                                    : ''
                            }
                        </div>
                    </div>
                `);
            });
        } catch (error) {
            console.error('Ошибка загрузки команды:', error);
            alert(error.message || 'Ошибка загрузки команды');
            window.location.href = 'profile.html';
        }
    }

    document.getElementById('copyCodeBtn')?.addEventListener('click', async () => {
        const code = document.getElementById('inviteCode')?.textContent?.trim();

        if (!code || code === '—') {
            alert('Код приглашения не найден');
            return;
        }

        try {
            await navigator.clipboard.writeText(code);
            alert('Код скопирован');
        } catch {
            prompt('Скопируйте код:', code);
        }
    });

    document.getElementById('generateNewCodeBtn')?.addEventListener('click', () => {
        alert('Endpoint для генерации нового кода пока не указан на бэке');
    });

    async function handleLogout() {
        if (!confirm('Вы уверены, что хотите выйти из аккаунта?')) return;

        try {
            await AuthApi.signOut();
        } finally {
            window.location.href = 'login.html';
        }
    }

    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', handleLogout);

    loadTeamManagement();