/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v4.6 - STRATEGIC COMMAND CENTER
 * =============================================================================
 * РАЗРАБОТКА: Пълен мащаб с Middle East Intel, US Bases & Iran AD Systems.
 * СТАТУС: ФИНАЛНА ВЕРСИЯ - ПЪЛЕН ОБЕМ (248 РЕДА)
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА ТАКТИЧЕСКАТА КАРТА ---
    // Настройваме координатите за Близкия изток, за да се виждат новите бази
    const map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2,
        zoomControl: true,
        attributionControl: false,
        zoomAnimation: true,
        fadeAnimation: true
    }).setView([25.0, 45.0], 4); 

    // ГРУПИРАНЕ НА СЛОЕВЕТЕ ЗА ПО-ДОБЪР КОНТРОЛ
    const markersLayer = L.layerGroup().addTo(map);   // Конфликтни точки (JSON)
    const militaryLayer = L.layerGroup().addTo(map);  // Военна инфраструктура

    // ТЪМЕН ТАКТИЧЕСКИ СЛОЙ (DARK MODE)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CartoDB',
        maxZoom: 18
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ И ВИЗУАЛНО ОЦВЕТЯВАНЕ ---
    // Държави в активна фаза на война
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    
    // Държави с повишено военно напрежение
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

    // ИЗВЛИЧАНЕ НА ГЛОБАЛНИ ГРАНИЦИ И ПРИЛАГАНЕ НА СТИЛОВЕ
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    
                    // ЛОГИКА ЗА ЦВЕТОВИ КОДОВЕ:
                    if (warZones.includes(name)) {
                        return { fillColor: "#ff0000", weight: 1.5, opacity: 1, color: '#ff3333', fillOpacity: 0.25 };
                    }
                    if (tensionZones.includes(name)) {
                        return { fillColor: "#ff8c00", weight: 1.2, opacity: 1, color: '#ff8c00', fillOpacity: 0.15 };
                    }
                    // Стандартен изглед за неутрални държави
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    let status = "NO ACTIVITIES";
                    
                    if (warZones.includes(name)) status = "HIGH DANGER (IN WAR)";
                    else if (tensionZones.includes(name)) status = "ELEVATED TENSION";

                    // ИНТЕРАКТИВЕН TOOLTIP
                    layer.bindTooltip(`
                        <div style="background:rgba(0,0,0,0.95); color:#fff; border:1px solid #39FF14; padding:6px; font-family:monospace;">
                            <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>
                            STATUS: <span style="color:#ff4d4d;">${status}</span>
                        </div>`, { sticky: true, opacity: 1.0 });

                    // ЕФЕКТИ ПРИ ПОСОЧВАНЕ
                    layer.on('mouseover', function() {
                        this.setStyle({ fillOpacity: 0.4, weight: 2, color: '#39FF14' });
                    });
                    layer.on('mouseout', function() {
                        const isWar = warZones.includes(name);
                        const isTension = tensionZones.includes(name);
                        this.setStyle({ 
                            fillOpacity: isWar ? 0.25 : (isTension ? 0.15 : 0.1), 
                            weight: isWar || isTension ? 1.5 : 0.5,
                            color: isWar ? '#ff3333' : (isTension ? '#ff8c00' : '#222')
                        });
                    });
                }
            }).addTo(map);
        });

    // --- 3. БАЗА ДАННИ: СТРАТЕГИЧЕСКИ ОБЕКТИ В MIDDLE EAST ---
    const militaryAssets = [
        // US MILITARY INFRASTRUCTURE
        { name: "Al Udeid Air Base", type: "us-base", lat: 25.11, lon: 51.21, country: "Qatar", info: "CENTCOM Forward HQ" },
        { name: "Camp Lemonnier", type: "us-base", lat: 11.54, lon: 43.14, country: "Djibouti", info: "Strategic Horn of Africa Hub" },
        { name: "Incirlik Air Base", type: "us-base", lat: 37.00, lon: 35.42, country: "Turkey", info: "NATO Nuclear Posture" },
        { name: "Prince Sultan Air Base", type: "us-base", lat: 24.12, lon: 47.58, country: "Saudi Arabia", info: "Air Defense & Ops" },
        { name: "Bahrain Naval Support", type: "us-base", lat: 26.23, lon: 50.61, country: "Bahrain", info: "5th Fleet Command" },
        
        // IRAN DEFENSE & RADAR SYSTEMS
        { name: "Natanz AD Complex", type: "iran-ad", lat: 33.72, lon: 51.72, country: "Iran", info: "S-300 / Bavar-373 Deployment" },
        { name: "Bushehr AD Shield", type: "iran-ad", lat: 28.82, lon: 50.88, country: "Iran", info: "Nuclear Site Protection" },
        { name: "Bandar Abbas Naval Base", type: "iran-ad", lat: 27.14, lon: 56.21, country: "Iran", info: "IRGC Naval HQ" },
        { name: "Fordow Missile Complex", type: "iran-ad", lat: 34.11, lon: 50.92, country: "Iran", info: "Deep Underground Site" },
        { name: "Isfahan Radar Site", type: "iran-ad", lat: 32.65, lon: 51.66, country: "Iran", info: "Early Warning System" }
    ];

    // --- 4. CSS СТИЛОВЕ И ВИЗУАЛНИ АНИМАЦИИ ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        @keyframes pulse-blue { 0% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.2); filter: brightness(1.4); } 100% { transform: scale(1); filter: brightness(1); } }
        @keyframes live-glow { 0% { box-shadow: 0 0 5px #39FF14; } 50% { box-shadow: 0 0 15px #39FF14; } 100% { box-shadow: 0 0 5px #39FF14; } }
        .pulsing-icon { animation: pulse-red 1.5s infinite ease-in-out; }
        .us-base-icon { color: #3498db; filter: drop-shadow(0 0 8px #3498db); animation: pulse-blue 3s infinite ease-in-out; }
        .iran-ad-icon { color: #e74c3c; filter: drop-shadow(0 0 8px #e74c3c); }
        .live-dot { height: 10px; width: 10px; background-color: #39FF14; border-radius: 50%; display: inline-block; margin-right: 8px; animation: live-glow 1s infinite; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ФУНКЦИИ ЗА ГЕНЕРИРАНЕ НА ИКОНИ ---
    function createMilIcon(type) {
        let symbol = type === 'us-base' ? '🏛️' : '📡';
        let cls = type === 'us-base' ? 'us-base-icon' : 'iran-ad-icon';
        
        return L.divIcon({
            html: `<div class="${cls}" style="font-size:22px; display:flex; justify-content:center;">${symbol}</div>`,
            className: '', 
            iconSize: [30, 30], 
            iconAnchor: [15, 15]
        });
    }

    // ПОСТАВЯНЕ НА ВОЕННИТЕ ОБЕКТИ НА КАРТАТА
    militaryAssets.forEach(asset => {
        L.marker([asset.lat, asset.lon], { icon: createMilIcon(asset.type) })
            .addTo(militaryLayer)
            .bindTooltip(`
                <div style="background:black; color:white; border:1px solid #39FF14; padding:10px; font-family:monospace; min-width:150px;">
                    <strong style="color:#39FF14; font-size:12px;">${asset.name.toUpperCase()}</strong><br>
                    <span style="color:#aaa;">OBJECTIVE:</span> ${asset.type.toUpperCase()}<br>
                    <span style="color:#aaa;">INTEL:</span> ${asset.info}
                </div>`, { direction: 'top', offset: [0, -10] });
    });

    // --- 6. LIVE FEED ИНДИКАТОР (ГОРЕ ВДЯСНО В ПАНЕЛА) ---
    const feedHeader = document.querySelector('.sidebar-header') || document.querySelector('h2'); 
    if (feedHeader && !document.getElementById('live-status')) {
        const liveIndicator = document.createElement('div');
        liveIndicator.id = 'live-status';
        liveIndicator.style = "float: right; font-size: 11px; color: #39FF14; font-family: monospace; padding: 4px 8px; border: 1px solid #39FF14; background: rgba(0,0,0,0.8); border-radius: 3px;";
        liveIndicator.innerHTML = '<span class="live-dot"></span>INTEL: ACTIVE';
        feedHeader.appendChild(liveIndicator);
    }

    // --- 7. СИНХРОНИЗАЦИЯ НА КОНФЛИКТНИ ДАННИ В РЕАЛНО ВРЕМЕ ---
    function syncData() {
        // Добавяме Timestamp, за да избегнем кеширането
        fetch('conflicts.json?cache_bust=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                data.forEach(item => {
                    const icon = L.divIcon({
                        html: `<div class="pulsing-icon" style="color:#ff4d4d; font-size:24px; text-shadow: 0 0 10px #ff0000;">●</div>`,
                        className: '', iconSize:[25,25]
                    });
                    
                    L.marker([item.lat, item.lon], { icon: icon })
                        .addTo(markersLayer)
                        .on('click', () => {
                            const panel = document.getElementById('news-content');
                            if(panel) {
                                panel.innerHTML = `
                                    <h3 style="color:#39FF14; border-bottom:1px solid #333; padding-bottom:10px;">${item.title}</h3>
                                    <p style="color:#ccc; line-height:1.5;">${item.description}</p>
                                    <div style="margin-top:10px; color:#ff4d4d; font-weight:bold;">FATALITIES: ${item.fatalities || 0}</div>
                                `;
                            }
                        });
                });
                
                // ОБНОВЯВАНЕ НА СТАТИСТИКАТА В ХЕДЪРА
                const countEl = document.getElementById('active-events');
                if (countEl) countEl.innerText = data.length;
            })
            .catch(err => console.error("CRITICAL ERROR: Data synchronization failed."));
    }

    // СТАРТИРАНЕ НА СИНХРОНИЗАЦИЯТА (НА ВСЕКИ 60 СЕКУНДИ)
    syncData();
    setInterval(syncData, 60000);
};

// --- 8. ГЛОБАЛЕН ТАКТИЧЕСКИ ЧАСОВНИК (UTC) ---
setInterval(() => {
    const clock = document.getElementById('header-time');
    if (clock) {
        const now = new Date();
        const timeStr = now.getUTCHours().toString().padStart(2, '0') + ":" + 
                        now.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                        now.getUTCSeconds().toString().padStart(2, '0');
        clock.innerText = timeStr + " UTC";
    }
}, 1000);

/**
 * =============================================================================
 * КРАЙ НА СКРИПТА - ОБЩ БРОЙ РЕДОВЕ: 248
 * =============================================================================
 */
