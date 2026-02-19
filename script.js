window.onload = function() {
    // 1. Инициализиране на картата (Dark Mode)
    var map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2
    }).setView([20, 0], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);

    // --- НОВО: Добавяне на зелени очертания на границите ---
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJson(geojsonData, {
                style: {
                    color: '#00ff00', // Ярко зелено за границите
                    weight: 1,        // Дебелина на линията
                    opacity: 0.4,     // Леко прозрачно, за да не пречи на точките
                    fillOpacity: 0    // Без запълване, за да останат държавите черни
                }
            }).addTo(map);
        })
        .catch(err => console.error("Грешка при зареждане на границите:", err));
    // -------------------------------------------------------

    // 2. Функция за цветовете
    function getColor(type) {
        const colors = {
            'Explosion': '#ff4d4d',
            'Airstrike': '#ffae42',
            'Armed clash': '#9d4edd',
            'News Alert': '#3388ff'
        };
        return colors[type] || '#3388ff';
    }

    // 3. Зареждане на данни
    fetch('conflicts.json')
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) return;

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

                marker.on('click', function() {
                    document.getElementById('news-content').innerHTML = `
                        <div style="padding-top: 10px; border-bottom: 2px solid #444; padding-bottom: 10px; margin-bottom: 15px;">
                            <h2 style="color: #ff4d4d; margin: 0;">${point.country}</h2>
                            <small style="color: #aaa;">${point.date} | ${point.type}</small>
                        </div>
                        <div style="background: #333; padding: 15px; border-radius: 8px; border-left: 5px solid ${getColor(point.type)};">
                            <p style="font-size: 1.1em; line-height: 1.4; margin: 0; color: #fff;">${point.title}</p>
                        </div>
                        <div style="margin-top: 20px;">
                            <p style="color: #eee;">💀 <strong>Жертви:</strong> ${point.fatalities}</p>
                            <br>
                            <a href="${point.link || '#'}" target="_blank" 
                               style="display: block; text-align: center; background: #007bff; color: white; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                               ПРОЧЕТИ ПЪЛНАТА НОВИНА
                            </a>
                        </div>
                    `;
                });

                totalFatalities += (point.fatalities || 0);
                if (point.country) countries.add(point.country);
            });

            // Обновяване на броячите
            document.getElementById('active-
