/**
 * GLOBAL CONFLICT DASHBOARD v4.2 - FULL SCALE PRODUCTION CODE
 * Пълен код с пулсация, тактическо оцветяване и разширена логика.
 * Версия: 2026-02-21
 */

window.onload = function() {
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА ГЛОБАЛНАТА КАРТА ---
    // Настройваме зуума и координатите за максимален обхват
    const map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2,
        zoomControl: true,
        attributionControl: false 
    }).setView([30.0, 15.0], 3);

    const markersLayer = L.layerGroup().addTo(map);

    // Използваме Dark Mode слоеве от CartoDB за тактически изглед
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CartoDB'
    }).addTo(map);

    // --- 2. ТАКТИЧЕСКИ ЗОНИ (КОНФЛИКТНИ И НАПРЕЖЕНИЕ) ---
    // Списъкът е синхронизиран с GeoJSON имената на държавите
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    const tensionZones = ['United States', 'United States of America', 'USA', 'Iran', 'North Korea', 'South Korea', 'China', 'Taiwan'];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    // Оцветяване в червено за зони в активна война
                    if (warZones.includes(name)) {
                        return { fillColor: "#ff0000", weight: 1, opacity: 1, color: '#ff3333', fillOpacity: 0.25 };
                    }
                    // Оцветяване в оранжево за зони с високо напрежение
                    if (tensionZones.includes(name)) {
                        return { fillColor: "#ff8c00", weight: 1, opacity: 1, color: '#ff8c00', fillOpacity: 0.15 };
                    }
                    // Всички останали държави остават тъмни
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    let statusText = "STATUS: <span style='color:#888;'>NO ACTIVITIES</span>";
                    
                    if (warZones.includes(name)) {
                        statusText = "STATUS: <span style='color:#ff4d4d; font-weight:bold;'>HIGH DANGER (IN WAR)</span>";
                    } else if (tensionZones.includes(name)) {
                        statusText = "STATUS: <span style='color:#ff8c00; font-weight:bold;'>ELEVATED TENSION (MEDIUM)</span>";
                    }

                    // Прикрепяне на тактическия статус към всяка държава
                    layer.bindTooltip(`
                        <div style="background:rgba(0,0,0,0.95); color:#fff; border:1px solid #39FF14; padding:5px; font-family:monospace; font-size:11px;">
                            <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>
                            ${statusText}
                        </div>`, 
                        { sticky: true, opacity: 0.9, direction: 'top' }
                    );

                    // Ефекти при преминаване с мишката (Hover Effects)
                    layer.on('mouseover', function() {
                        this.setStyle({ fillOpacity: 0.4, weight: 2, color: '#39FF14' });
                    });
                    layer.on('mouseout', function() {
                        const isWar = warZones.includes(name);
                        const isTension = tensionZones.includes(name);
                        this.setStyle({ 
                            fillOpacity: isWar ? 0.25 : (isTension ? 0.15 : 0.1), 
                            weight: 1,
                            color: isWar ? '#ff3333' : (isTension ? '#ff8c00' : '#222')
                        });
                    });
                }
            }).addTo(map);
        });

    let globalConflictData = [];

    // --- 3. ДЕФИНИРАНЕ НА ФРОНТОВА ЛИНИЯ (УКРАЙНА) ---
    const ukraineFrontline = [
        [51.5, 34.0], [50.1, 38.5], [49.2, 39.8], [48.5, 39.5], 
        [47.1, 38.2], [46.5, 37.0], [45.3, 36.6], [44.4, 34.0], 
        [44.3, 33.5], [45.2, 33.0], [46.3, 32.2], [47.5, 34.5], 
        [48.5, 36.0], [50.0, 34.5], [51.5, 34.0]
    ];

    L.polygon(ukraineFrontline, {
        color: '#ff3333', weight: 2, fillColor: '#ff0000', fillOpacity: 0.3, interactive: false
    }).addTo(map);

    // --- 4. СИСТЕМА ЗА ПУЛСИРАЩИ ИКОНИ (CSS ANIMATION) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes marker-pulse {
            0% { transform: scale(1); opacity: 1; filter: brightness(1); }
            50% { transform: scale(1.3); opacity: 0.7; filter: brightness(1.5); }
            100% { transform: scale(1); opacity: 1; filter: brightness(1); }
        }
        .pulsing-icon { animation: marker-pulse 1.5s infinite ease-in-out; }
    `;
    document.head.appendChild(styleSheet);

    function createCustomIcon(symbol, color) {
        return L.divIcon({
            html: `<div class="pulsing-icon" style="color: ${color}; font-size: 22px; text-shadow: 0 0 10px ${color}; display: flex; align-items: center; justify-content: center;">${symbol}</div>`,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    function getIconForEvent(title, description) {
        const text = (title + " " + (description || "")).toLowerCase();
        if (text.includes('missile') || text.includes('strike')) return createCustomIcon('🚀', '#a366ff');
        if (text.includes('ship') || text.includes('navy')) return createCustomIcon('🚢', '#3498db');
        if (text.includes('nuclear')) return createCustomIcon('☢️', '#ffea00');
        if (text.includes('war') || text.includes('clash')) return createCustomIcon('⚔️', '#ff4d4d');
        if (text.includes('aid')) return createCustomIcon('📦', '#2ecc71');
        return createCustomIcon('●', '#ff4d4d');
    }

    // --- 5. ТЪРСАЧКА И ИНТЕРАКТИВЕН ПАНЕЛ ---
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    let resultsList = document.getElementById('search-results-list');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            if (!resultsList) return;
            resultsList.innerHTML = '';
            if (query.length < 2) { resultsList.style.display = 'none'; return; }

            const matches = globalConflictData.filter(item => 
                item.country.toLowerCase().includes(query) || item.title.toLowerCase().includes(query)
            );

            if (matches.length > 0) {
                resultsList.style.display = 'block';
                matches.forEach(match => {
                    const row = document.createElement('div');
                    row.style = "padding:10px; cursor:pointer; border-bottom:1px solid #222; font-size:12px;";
                    row.innerHTML = `<span style="color:#ff4d4d;">[${match.country.toUpperCase()}]</span><br>${match.title}`;
                    row.onclick = () => {
                        map.flyTo([match.lat, match.lon], 7);
                        displayNewsDetails(match);
                        resultsList.style.display = 'none';
                    };
                    resultsList.appendChild(row);
                });
            }
        });
    }

    // Функция за показване на подробна информация за целта
    function displayNewsDetails(data) {
        const panel = document.getElementById('news-content');
        if (!panel) return;
        let cleanDesc = (data.description || "No intel available.").replace(/<\/?[^>]+(>|$)/g, "").trim();
        panel.innerHTML = `
            <div class="news-card animated-fade-in">
                <div style="font-size:10px; margin-bottom:5px;">
                    <span style="background:#ff4d4d; color:black; padding:2px 5px; font-weight:bold;">${data.country.toUpperCase()}</span>
                    <span style="color:#888; margin-left:10px;">${data.date || 'LIVE'}</span>
                </div>
                <h3 style="color:#39FF14; margin:10px 0;">${data.title}</h3>
                <p style="color:#ccc; font-size:13px;">${cleanDesc}</p>
                <div style="margin-top:15px; border-top:1px solid #333; padding-top:10px;">
                    <span style="color:#ff4d4d;">CASUALTIES: ${data.fatalities || 0}</span>
                </div>
            </div>`;
    }

    // --- 6. СИНХРОНИЗАЦИЯ НА ДАННИТЕ В РЕАЛНО ВРЕМЕ ---
    function fetchAndSyncData() {
        fetch('conflicts.json?cache_bust=' + Date.now())
            .then(res => res.json())
            .then(data => {
                globalConflictData = data;
                markersLayer.clearLayers();
                let totalDeaths = 0;
                data.forEach(item => {
                    totalDeaths += parseInt(item.fatalities) || 0;
                    const icon = getIconForEvent(item.title, item.description);
                    L.marker([item.lat, item.lon], { icon: icon }).addTo(markersLayer).on('click', () => displayNewsDetails(item));
                });
                // Обновяване на хедъра със статистика
                const countEl = document.getElementById('active-events');
                if (countEl) countEl.innerText = data.length;
                const fatEl = document.getElementById('total-fatalities');
                if (fatEl) fatEl.innerText = totalDeaths;
            })
            .catch(err => console.error("Sync Error:", err));
    }

    // Стартиране на циклите
    fetchAndSyncData();
    setInterval(fetchAndSyncData, 60000);
};

// --- 7. ГЛОБАЛЕН ЧАСОВНИК (UTC) ---
setInterval(() => {
    const clock = document.getElementById('header-time');
    if (clock) clock.innerText = new Date().toISOString().substr(11, 8) + " UTC";
}, 1000);

/** * END OF CODE - Всички функционалности са заредени успешно.
 */
