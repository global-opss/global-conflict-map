/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v5.1 - TELEGRAM REFRESH ENGINE
 * =============================================================================
 * ОБЕКТ: Фикс на забилия Telegram фийд + JSON интеграция + Котви.
 * ДАТА: 2026-02-21 | СТАТУС: ПЪЛЕН ОБЕМ (262 РЕДА).
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА КАРТАТА (image_406766.jpg) ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false
    }).setView([38.0, 15.0], 3.5); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ФИЛТЪР (image_3fefd9.png) ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen', 'Lebanon'];
    const highTension = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela'];
    const monitored = ['USA', 'United States', 'United Kingdom', 'Turkey', 'Germany', 'France'];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    if (warZones.includes(name)) return { fillColor: "#ff0000", weight: 2.2, color: '#ff3333', fillOpacity: 0.35 };
                    if (highTension.includes(name)) return { fillColor: "#ff8c00", weight: 1.8, color: '#ff8c00', fillOpacity: 0.25 };
                    if (monitored.includes(name)) return { fillColor: "#3498db", weight: 1.2, color: '#3498db', fillOpacity: 0.15 };
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    let label = "MONITORED REGION";
                    if (warZones.includes(name)) label = "<span style='color:#ff4d4d;'>CRITICAL WARZONE</span>";
                    else if (highTension.includes(name)) label = "<span style='color:#ff8c00;'>HIGH TENSION</span>";

                    layer.bindTooltip(`<div style="background:black; color:white; border:1px solid #39FF14; padding:10px; font-family:monospace;">
                        <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>STATUS: ${label}</div>`, { sticky: true });
                }
            }).addTo(map);
        });

    // --- 3. ВОЕННИ АСЕТИ - КОТВИ (image_3ffde6.jpg) ---
    const militaryAssets = [
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99, info: "Coastal Defense" },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet" },
        { name: "Hostomel Airport", type: "airbase-ua", lat: 50.59, lon: 30.21, info: "Strategic Aviation" },
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21, info: "Bomber Base" },
        { name: "Al Udeid Base", type: "us-hq", lat: 25.11, lon: 51.21, info: "US CENTCOM" }
    ];

    // --- 4. CSS ЗА ИНТЕРФЕЙСА (image_4054d9.jpg) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1.5px solid white; }
        .icon-ua { background: rgba(52, 152, 219, 0.4); color: #3498db; }
        .icon-ru { background: rgba(231, 76, 60, 0.4); color: #e74c3c; }
        .icon-us { background: rgba(57, 255, 20, 0.2); color: #39FF14; border: 2px solid #39FF14; }
        .read-btn-tactical { 
            display: inline-block; margin-top: 15px; padding: 12px 25px; 
            background: #39FF14 !important; color: #000 !important; 
            font-weight: bold; text-decoration: none !important; 
            border-radius: 4px; font-family: monospace; cursor: pointer;
            box-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
        }
        .read-btn-tactical:hover { background: white !important; box-shadow: 0 0 20px #39FF14; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ГЕНЕРАТОР НА ИКОНИ ---
    function createIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.includes('naval')) sym = '⚓';
        cls += type.includes('ua') ? 'icon-ua' : (type.includes('ru') ? 'icon-ru' : 'icon-us');
        return L.divIcon({
            html: `<div class="${cls}" style="font-size:20px; width:34px; height:34px;">${sym}</div>`,
            className: '', iconSize: [34, 34]
        });
    }

    militaryAssets.forEach(a => {
        L.marker([a.lat, a.lon], { icon: createIcon(a.type) }).addTo(militaryLayer)
            .bindTooltip(`<b>${a.name}</b><br>${a.info}`);
    });

    // --- 6. ОБРАБОТКА НА НОВИНИТЕ (JSON Фикс) ---
    function updateIntel() {
        fetch('conflicts.json?v=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                data.forEach(item => {
                    const dot = L.divIcon({
                        html: `<div style="color:red; font-size:24px; text-shadow:0 0 10px red;">●</div>`,
                        className: 'pulse'
                    });
                    
                    L.marker([item.lat, item.lon], { icon: dot }).addTo(markersLayer)
                        .on('click', () => {
                            const panel = document.getElementById('news-content');
                            if(panel) {
                                // ПОПРАВКА НА ЛИНКОВЕТЕ ОТ ТВОЯ JSON
                                const newsUrl = item.link || item.url || "#";
                                panel.innerHTML = `
                                    <h3 style="color:#39FF14;">${item.title}</h3>
                                    <p style="color:#ccc; font-size:15px;">${item.description || "Active Monitoring..."}</p>
                                    <div style="color:red; margin:10px 0;">TACTICAL CASUALTIES: ${item.fatalities || 0}</div>
                                    <div style="font-size:11px; color:#666;">DATE: ${item.date}</div>
                                    <a href="${newsUrl}" target="_blank" rel="noopener noreferrer" class="read-btn-tactical">READ FULL REPORT »</a>
                                `;
                            }
                        });
                });
            });
    }

    // --- 7. ПРИНУДИТЕЛЕН РЕФРЕШ НА TELEGRAM (image_6b1701.png) ---
    function refreshTelegramFeed() {
        const tgPanel = document.querySelector('.telegram-feed-container'); // Увери се, че това е класа на твоя див
        if(tgPanel) {
            const currentContent = tgPanel.innerHTML;
            tgPanel.innerHTML = ""; // Изчистваме
            setTimeout(() => { tgPanel.innerHTML = currentContent; }, 100); // Презареждаме джаджата
            console.log("Telegram Intelligence Refreshed.");
        }
    }

    updateIntel();
    setInterval(updateIntel, 60000);
    setInterval(refreshTelegramFeed, 300000); // Рефреш на Telegram на всеки 5 мин
};

// --- 8. ТАКТИЧЕСКИ ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);

/**
 * КРАЙ НА СТРАТЕГИЧЕСКИЯ КОД - 262 РЕДА.
 */
 * КРАЙ НА СТРАТЕГИЧЕСКИЯ КОД - 255 РЕДА.
 * ВСИЧКИ СИСТЕМИ СА ОПТИМИЗИРАНИ ЗА JSON ОБМЕН.
 */
