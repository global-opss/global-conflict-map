// Изчакваме целият HTML и CSS да се заредят напълно
window.onload = function() {
    
    // 1. Инициализиране на картата с ТЪМЕН РЕЖИМ (Dark Mode)
    var map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2
    }).setView([20, 0], 2);

    // Използваме CartoDB Dark Matter за професионален вид като на image_991b43.jpg
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);

    // 2. Функция за цветовете (съобразена с типовете от Python скрипта)
    function getColor(type) {
        const colors = {
            'Explosion': '#ff4d4d',    // Червено
            'Airstrike': '#ffae42',    // Оранжево
            'Armed clash': '#9d4edd',  // Лилаво
            'News Alert': '#3388ff'    // Синьо
        };
        return colors[type] || '#3388ff';
    }

    // 3. Зареждане на данни от conflicts.json
    fetch('conflicts.json')
        .then(response => response.json())
        .then(data => {
            let totalFatalities = 0;
            let countries = new Set();

            data.forEach(point => {
                let marker = L.circleMarker([point.lat, point.lon], {
                    radius: 10,
                    fillColor: getColor(point.type),
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(map);

                // ЛОГИКА ЗА КЛИК: Пълним страничния панел с ИСТИНСКИ ЛИНК
                marker.on('click', function() {
                    const sidebarContent = document.getElementById('news-content');
                    
                    sidebarContent.innerHTML = `
                        <div style="padding-top: 10px; border-bottom: 2px solid #444; padding-bottom: 10px; margin-bottom: 15px;">
                            <h2 style="color: #ff4d4d; margin: 0;">${point.country}</h2>
                            <small style="color: #aaa;">${point.date} | Тип: ${point.type}</small>
                        </div>
                        <div style="background: #333; padding: 15px; border-radius: 8px; border-left: 5px solid ${getColor(point.type)};">
