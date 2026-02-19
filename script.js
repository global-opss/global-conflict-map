window.onload = function() {
    // 1. Инициализиране на картата
    var map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2
    }).setView([20, 0], 2);

    // ОСНОВЕН СЛОЙ: Тъмен фон без надписи
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);

    // СЛОЙ ЗА ЕТИКЕТИ: Държави и градове
    var labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        opacity: 0.4,
        pane: 'shadowPane'
    }).addTo(map);

    // Динамичен зуум за ярки градове
    map.on('zoomend', function() {
        labels.setOpacity(map.getZoom() >= 5 ? 1 : 0.4);
    });

    // 2. ЗЕЛЕНИ ГРАНИЦИ (Countries Borders)
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJson(geojsonData, {
                style: {
                    color: '#00ff00',
                    weight: 1,
                    opacity: 0.3,
                    fillOpacity: 0
                },
                onEachFeature: function(feature, layer) {
                    layer.on('mouseover', function() { this.setStyle({ opacity: 0.8, weight: 2 }); });
                    layer.on('mouseout', function() { this.setStyle({ opacity: 0.3, weight: 1 }); });
                }
            }).addTo(map);
        });

    // 3. Функция за цветовете
    function getColor(type) {
        const colors = {
            'Explosion': '#ff4d4d',
            'Airstrike': '#ffae42',
            'Armed clash': '#9d4edd',
            'News Alert': '#3388ff'
        };
        return colors[type] || '#3388ff';
    }

    // 4. Зареждане на данни (conflicts.json)
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
                    fillOpacity: 0.8,
                    className: 'pulse' // Свързва се с CSS анимацията
                }).addTo(map);

                marker.bindTooltip(point.country);

                marker.on('click', function() {
                    document.getElementById('news-content').innerHTML = `
                        <div style="border-bottom: 2px solid #444; padding-bottom: 10px; margin-bottom: 15px;">
                            <h2 style="color: #ff4d4d; margin: 0;">${point.country}</h2>
                            <small style="color: #aaa;">${point.date} | ${point.type}</small>
                        </div>
                        <div style="background: #222; padding: 15px; border-radius: 8px; border-left: 5px solid ${getColor(point.type)};">
                            <p style="color: #fff; margin: 0;">${point.title}</p>
                        </div>
                        <div style="margin-top: 20px;">
                            <p>💀 <strong>Жертви:</strong> ${point.fatalities}</p>
                            <a href="${point.link || '#'}" target="_blank" class="news-btn">ПРОЧЕТИ ПЪЛНАТА НОВИНА</a>
                        </div>
                    `;
                });

                totalFatalities += (point.fatalities || 0);
                if (point.country) countries.add(point.country);
            });

            document.getElementById('active-events').innerText = `Active events: ${data.length}`;
            document.getElementById('total-fatalities').innerText = `Total fatalities: ${totalFatalities}`;
            document.getElementById('countries-affected').innerText = `Countries affected: ${countries.size}`;
            document.getElementById('last-update').innerText = `Last update: ${new Date().toLocaleDateString()}`;
        })
        .catch(err => console.error("Грешка:", err));

    setTimeout(function() { map.invalidateSize(); }, 800);
};
