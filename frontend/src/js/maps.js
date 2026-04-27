async function initMap() {
    ymaps.ready(() => {
        window.map = new ymaps.Map('map', {
            center: [55.751244, 37.618423],
            zoom: 12,
            controls: ['zoomControl']
        });

        // Массив квестов с разными статусами (определяют цвет метки)
        const quests = [
            { coords: [55.7495, 37.5916], name: 'Тайны Арбата', diff: 2, status: 'published' },
            { coords: [55.7298, 37.6015], name: 'Парк Горького: Миссия', diff: 3, status: 'active' },
            { coords: [55.8262, 37.6372], name: 'ВДНХ: Космический маршрут', diff: 4, status: 'completed' },
            { coords: [55.6682, 37.6678], name: 'Коломенское: Царский путь', diff: 1, status: 'published' },
            { coords: [55.7890, 37.7670], name: 'Измайлово: Лесной дозор', diff: 5, status: 'draft' },
            { coords: [55.7558, 37.6337], name: 'Китай-город: Подземелья', diff: 3, status: 'moderation' },
        ];

        // Сопоставление статуса → цвет метки (preset)
        const colorMap = {
            published: 'islands#blueIcon',
            active: 'islands#orangeIcon',
            completed: 'islands#greenIcon',
            draft: 'islands#grayIcon',
            moderation: 'islands#violetIcon',
        };

        quests.forEach(q => {
            window.map.geoObjects.add(new maps.Placemark(q.coords, {
                hintContent: q.name,
                balloonContent: `<b>${q.name}</b><br>Сложность: ${'⭐'.repeat(q.diff)}<br>Статус: ${q.status}`
            }, {
                preset: colorMap[q.status] || 'islands#blueIcon'
            }));
        });
    });
}
initMap();