const themes = {
    'default': 'themes/theme-default.css',
    'neon-sunset': 'themes/theme-neon-sunset.css',
    'cyberpunk': 'themes/theme-cyberpunk.css',
    'tropical': 'themes/theme-tropical.css',
    'ice-flame': 'themes/theme-ice-flame.css',
    'space-rave': 'themes/theme-space-rave.css'
};

function loadTheme(themeName) {
    const themeLink = document.getElementById('themeStylesheet');
    if (themeLink && themes[themeName]) {
        themeLink.href = themes[themeName];
        localStorage.setItem('preferredTheme', themeName);
        
        // Обновляем значение в обоих селекторах
        const desktopSelect = document.getElementById('themeSelect');
        const mobileSelect = document.getElementById('mobileThemeSelect');
        if (desktopSelect && desktopSelect.value !== themeName) {
            desktopSelect.value = themeName;
        }
        if (mobileSelect && mobileSelect.value !== themeName) {
            mobileSelect.value = themeName;
        }
    }
}

function initThemeSwitcher() {
    const savedTheme = localStorage.getItem('preferredTheme');
    if (savedTheme && themes[savedTheme]) {
        loadTheme(savedTheme);
    }
    
    const desktopSelect = document.getElementById('themeSelect');
    const mobileSelect = document.getElementById('mobileThemeSelect');
    
    if (desktopSelect) {
        desktopSelect.addEventListener('change', (e) => {
            loadTheme(e.target.value);
        });
    }
    
    if (mobileSelect) {
        mobileSelect.addEventListener('change', (e) => {
            loadTheme(e.target.value);
        });
    }
}

document.addEventListener('DOMContentLoaded', initThemeSwitcher);