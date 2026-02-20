/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v4.3 - FULL PRODUCTION SCALE
 * =============================================================================
 * Описание: Пълна система за мониторинг на конфликти в реално време.
 * Характеристики: Пулсиращи икони, Тактическо оцветяване, LIVE Индикатор.
 * Версия: 2026-02-21
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА ГЛОБАЛНАТА КАРТА ---
    // Конфигуриране на основния Leaflet обект с тактически настройки
    const map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2,
        zoomControl: true,
        attributionControl: false 
    }).setView([30.0, 15.0], 3);

    // ГРУПА ЗА МАРКЕРИТЕ - позволява лесно изчистване и обновяване на данните
    const markersLayer = L.layerGroup().addTo(map);

    // ЗАРЕЖДАНЕ НА ТЪМЕН СЛОЙ (DARK MODE) ЗА КАРТАТА
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CartoDB'
    }).addTo(map);

    // --- 2. ДЕФИНИРАНЕ НА ТАКТИЧЕСКИ ЗОНИ И НАПРЕЖЕНИЕ ---
    // Списъкът е критичен за правилното оцветяване на границите
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    
    // Включваме САЩ и Китай за оцветяване в оранжево
    const tensionZones = [
        'United States', 
        'United States of America', 
        'USA', 
        'Iran', 
        'North Korea', 
        'South Korea', 
        'China', 
        'Taiwan'
    ];

    // ИЗВЛИЧАНЕ НА ГЕОГРАФСКИ ГРАНИЦИ (GeoJSON)
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    
                    // ЛОГИКА ЗА ОЦВЕТЯВАНЕ:
                    // 1. Зони на активна война (Червено)
                    if (warZones.includes(name)) {
                        return { fillColor: "#ff0000", weight: 1, opacity: 1, color: '#ff3333', fillOpacity: 0.25 };
                    }
                    // 2. Зони на напрежение (Оранжево)
                    if (tensionZones.includes(name)) {
                        return { fillColor: "#ff8c00", weight: 1, opacity: 1, color: '#ff8c00', fillOpacity: 0.15 };
                    }
                    // 3. Стандартни държави (Черно)
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

                    // ТАКТИЧЕСКИ TOOLTIP ПРИ ПОСОЧВАНЕ
                    layer.bindTooltip(`
                        <div style="background:rgba(0,0,0,0.9); color:#fff; border:1px solid #39FF14; padding:5px; font-family:monospace; font-size:11px;">
                            <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>
                            ${statusText}
                        </div>`, 
                        { sticky: true, opacity: 0.9, direction: 'top' }
                    );

                    // ВИЗУАЛНИ ЕФЕКТИ ПРИ HOVER
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

    // --- 3. ДЕФИНИРАНЕ НА УКРАЙНА ФРОНТОВА ЛИНИЯ ---
    const ukraineFront = [
        [51.5, 34.0], [50.1, 38.5], [49.2, 39.8], [48.5, 39.5], 
        [47.1, 38.2], [46.5, 37.0], [45.3, 36.6], [44.4, 34.0], 
        [44.3, 33.5], [45.2, 33.0], [46.3, 32.2], [47.5, 34.5], 
        [48.5, 36.0], [50.0, 34.5], [51.5, 34.0]
    ];

    L.polygon(ukraineFront, {
        color: '#ff3333',
        weight: 2,
        fillColor: '#ff0000',
        fillOpacity: 0.3,
        interactive: false
    }).addTo(map);

    // --- 4. CSS АНИМАЦИИ (ПУЛСАЦИЯ И LIVE FEED) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes marker-pulse { 
            0% { transform: scale(1); filter: brightness(1); } 
            50% { transform: scale(1.3); filter: brightness(1.5); } 
            100% { transform: scale(1); filter: brightness(1); } 
        }
        @keyframes live-dot { 
            0% { opacity: 1; } 
            50% { opacity: 0.3; } 
            100% { opacity: 1; } 
        }
        .pulsing-icon { animation: marker-pulse 1.5s infinite ease-in-out; }
        .live-dot { 
            height: 8px; width: 8px; 
            background-color: #39FF14; 
            border-radius: 50%; 
            display: inline-block; 
            margin-right: 5px; 
            animation: live-dot 1s infinite; 
            box-shadow: 0 0 8px #39FF14; 
        }
    `;
    document.head.appendChild(styleSheet);

    // ДОБАВЯНЕ НА LIVE ИНДИКАТОРА КЪМ ТЕЛЕГРАМ ПАНЕЛА
    const feedHeader = document.querySelector('.sidebar-header') || document.querySelector('h2'); 
    if (feedHeader && !document.getElementById('live-status')) {
        const liveIndicator = document.createElement('span');
        liveIndicator.id = 'live-status';
        liveIndicator.style = "float: right; font-size: 10px; color: #39FF14; font-family: monospace; letter-spacing: 1px;";
        liveIndicator.innerHTML = '<span class="live-dot"></span>LIVE INTEL FEED';
        feedHeader.appendChild(liveIndicator);
    }

    // --- 5. СИСТЕМА ЗА ГЕНЕРИРАНЕ НА ИКОНИ ---
    function createIcon(symbol, color) {
        return L.divIcon({
            html: `<div class="pulsing-icon" style="color:${color}; font-size:22px; text-shadow:0 0 10px ${color}; display:flex; align-items:center; justify-content:center;">${symbol}</div>`,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    function getIcon(title) {
        let t = title.toLowerCase();
        if (t.includes('missile') || t.includes('strike')) return createIcon('🚀', '#a366ff');
        if (t.includes('ship') || t.includes('navy')) return createIcon('🚢', '#3498db');
        if (t.includes('nuclear')) return createIcon('☢️', '#ffea00');
        if (t.includes('war') || t.includes('clash')) return createIcon('⚔️', '#ff4d4d');
        if (t.includes('aid')) return createIcon('📦', '#2ecc71');
        return createIcon('●', '#ff4d4d');
    }

    // --- 6. ТЪРСАЧКА И ПОДРОБНОСТИ ЗА ОБЕКТИТЕ ---
    function displayDetails(data) {
        const panel = document.getElementById('news-content');
        if (!panel) return;
        let desc = (data.description || "No intel available.").replace(/<\/?[^>]+(>|$)/g, "").trim();
        panel.innerHTML = `
            <div class="news-card animated-fade-in">
                <div style="font-size:10px; margin-bottom:5px;">
                    <span style="background:#ff4d4d; color:black; padding:2px 5px; font-weight:bold;">${data.country.toUpperCase()}</span>
                </div>
                <h3 style="color:#39FF14; margin:10px 0;">${data.title}</h3>
                <p style="color:#ccc; font-size:13px;">${desc}</p>
                <div style="margin-top:15px; border-top:1px solid #333; padding-top:10px;">
                    <span style="color:#ff4d4d;">CASUALTIES: ${data.fatalities || 0}</span>
                </div>
            </div>`;
    }

    // --- 7. АВТОМАТИЧНА СИНХРОНИЗАЦИЯ НА ДАННИТЕ ---
    function sync() {
        fetch('conflicts.json?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
                globalConflictData = data;
                markersLayer.clearLayers();
                data.forEach(item => {
                    L.marker([item.lat, item.lon], { icon: getIcon(item.title) })
                        .addTo(markersLayer)
                        .on('click', () => displayDetails(item));
                });
                // Актуализиране на статистиката в хедъра
                if (document.getElementById('active-events')) {
                    document.getElementById('active-events').innerText = data.length;
                }
            })
            .catch(err => console.error("Sync Error: Failed to fetch JSON data."));
    }

    // Първоначално стартиране и задаване на интервал (60 секунди)
    sync();
    setInterval(sync, 60000);
};

// --- 8. ГЛОБАЛЕН UTC ЧАСОВНИК ---
setInterval(() => {
    const clock = document.getElementById('header-time');
    if (clock) {
        clock.innerText = new Date().toISOString().substr(11, 8) + " UTC";
    }
}, 1000);

// --- КРАЙ НА СКРИПТА ---
