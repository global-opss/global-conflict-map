window.onload = function() {
    const alertSound = new Audio('alert.mp3');
    let markersLayer = L.layerGroup();

    // 1. КАРТА
    var map = L.map('map', { worldCopyJump: true, minZoom: 2 }).setView([48.0, 37.0], 4);
    markersLayer.addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', { opacity: 0.5, pane: 'shadowPane' }).addTo(map);

    // 2. ИКОНИ
    const createNeonIcon = (symbol, color) => L.divIcon({
        html: `<div style="color: ${color}; font-size: 22px; text-shadow: 0 0 10px ${color}, 0 0 15px ${color}; font-weight: bold; display: flex; align-items: center; justify-content: center;">${symbol}</div>`,
        className: '', iconSize: [30, 30], iconAnchor: [15, 15]
    });

    const icons = {
        clash: createNeonIcon('✖', '#ff4d4d'),
        warning: createNeonIcon('⚠️', '#ffcc00'),
        ship: createNeonIcon('🚢', '#3498db'),
        missile: createNeonIcon('🚀', '#8e44ad')
    };

    function getTacticalIcon(title) {
        const t = title.toLowerCase();
        if (t.includes('military') || t.includes('missile') || t.includes('drone')) return icons.missile;
        if (t.includes('iran') || t.includes('ship') || t.includes('sea') || t.includes('naval')) return icons.ship;
        if (t.includes('war') || t.includes('killings') || t.includes('genocide') || t.includes('attack')) return icons.warning;
        return icons.clash;
    }

    // 3. ЗАРЕЖДАНЕ, СТАТИСТИКА И ЗЕЛЕНИЯ ТЕКСТ (TICKER)
    function loadMapData() {
        fetch('conflicts.json?t=' + new Date().getTime())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                let countries = new Set(), deaths = 0;
                
                // ТУК ВРЪЩАМ ЗЕЛЕНИЯ ТЕКСТ ГОРЕ
                const tickerContent = data.map(p => `[${p.country.toUpperCase()}]: ${p.title}`).join(' +++ ');
                const tickerEl = document.querySelector('.ticker-text') || document.querySelector('.green-text-class') || document.getElementById('ticker-line');
                if (tickerEl) tickerEl.innerText = tickerContent;

                data.forEach(p => {
                    if (p.fatalities) deaths += parseInt(p.fatalities);
                    countries.add(p.country);
                    L.marker([p.lat, p.lon], { icon: getTacticalIcon(p.title) }).addTo(markersLayer).on('click', () => {
                        document.getElementById('news-content').innerHTML = `<div class="news-card"><h3>${p.country}</h3><p>${p.title}</p><a href="${p.link}" target="_blank" class="news-link">ПЪЛЕН ДОКЛАД</a></div>`;
                    });
                });

                document.getElementById('active-events').innerText = "Активни събития: " + data.length;
                document.getElementById('total-fatalities').innerText = "Total fatalities: " + deaths;
                document.getElementById('countries-affected').innerText = "Countries affected: " + countries.size;
                document.getElementById('last-update').innerText = "Last update: " + new Date().toLocaleTimeString();
            });
    }

    loadMapData(); 
    setInterval(loadMapData, 60000);
};

// 4. ЧАСОВНИК
setInterval(() => {
    const clockEl = document.getElementById('utc-clock');
    if (clockEl) clockEl.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);
