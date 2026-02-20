window.onload = function() {
    // 1. ИНИЦИАЛИЗАЦИЯ НА КАРТАТА
    var map = L.map('map', { worldCopyJump: true }).setView([20.0, 10.0], 3);
    var markersLayer = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png').addTo(map);

    // 2. ЧЕРВЕНА ЗОНА (УКРАЙНА)
    var zone = [[51.5, 34.0], [50.1, 38.5], [47.1, 38.2], [44.3, 33.5], [46.3, 32.2], [48.5, 36.0], [51.5, 34.0]];
    L.polygon(zone, { color: '#ff3333', weight: 1, fillOpacity: 0.15, interactive: false }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { opacity: 0.4, pane: 'shadowPane' }).addTo(map);

    // 3. ТАКТИЧЕСКИ ИКОНИ (🚀, 🚢, ⚔️, ⚠️)
    function getTacticalIcon(title, desc) {
        let text = (title + " " + (desc || "")).toLowerCase();
        let sym = '●', col = '#ff4d4d';

        if (text.includes('missile') || text.includes('strike')) { sym = '🚀'; col = '#a366ff'; }
        else if (text.includes('ship') || text.includes('sea')) { sym = '🚢'; col = '#3498db'; }
        else if (text.includes('aid') || text.includes('food')) { sym = '📦'; col = '#2ecc71'; }
        else if (text.includes('war') || text.includes('village') || text.includes('lost')) { sym = '⚔️'; col = '#ff4d4d'; }
        else if (text.includes('warning') || text.includes('alert')) { sym = '⚠️'; col = '#ffcc00'; }

        return L.divIcon({
            html: `<div style="color:${col}; font-size:20px; text-shadow:0 0 8px ${col}; animation: pulse 1.5s infinite;">${sym}</div>`,
            className: '', iconSize: [25, 25], iconAnchor: [12, 12]
        });
    }

    // 4. ТЪРСАЧКА (ENTER ЗА ТЪРСЕНЕ)
    const searchInput = document.querySelector('input[placeholder*="Търсене"]');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                if (query.length < 2) return;
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            map.flyTo([data[0].lat, data[0].lon], 6);
                        }
                    });
            }
        });
    }

    // 5. ДАННИ И СТАТИСТИКА
    function refresh() {
        fetch('conflicts.json?t=' + Date.now())
            .then(r => r.json())
            .then(data => {
                markersLayer.clearLayers();
                let deaths = 0, countries = new Set();
                
                data.forEach(p => {
                    deaths += (parseInt(p.fatalities) || 0);
                    if (p.country) countries.add(p.country);

                    L.marker([p.lat, p.lon], { icon: getTacticalIcon(p.title, p.description) })
                        .addTo(markersLayer)
                        .on('click', () => {
                            document.getElementById('news-content').innerHTML = `
                                <div class="news-card">
                                    <h3>${p.title}</h3>
                                    <p>${p.description || "Няма описание."}</p>
                                    <div class="meta">Жертви: ${p.fatalities || 0}</div>
                                    <a href="${p.link}" target="_blank" class="news-link">ПЪЛЕН ДОКЛАД</a>
                                </div>`;
                        });
                });

                document.getElementById('active-events').innerText = "Active events: " + data.length;
                document.getElementById('total-fatalities').innerText = "Total fatalities: " + deaths;
                document.getElementById('countries-affected').innerText = "Countries affected: " + countries.size;
                
                let ticker = document.getElementById('news-ticker');
                if (ticker) ticker.innerText = data.map(p => `[${p.country}]: ${p.title}`).join(' • ');
            });
    }

    refresh();
    setInterval(refresh, 60000);
};

// ЧАСОВНИК
setInterval(() => {
    let clk = document.getElementById('utc-clock');
    if (clk) clk.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);
