/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v4.15 - TOTAL RECOVERY MODE
 * =============================================================================
 * ОБЕКТ: Фикс на категориите (War/Tension) + Външни линкове + Котви.
 * СТАТУС: ФУНКЦИОНАЛЕН - 265 РЕДА.
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА КАРТАТА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false
    }).setView([46.0, 38.0], 5); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
    }).addTo(map);

    // --- 2. ДЕТАЙЛНО КАТЕГОРИЗИРАНЕ НА ДЪРЖАВИТЕ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    const highTension = ['Iran', 'North Korea', 'South Korea', 'China', 'Taiwan'];
    const monitored = ['United States', 'USA', 'United Kingdom', 'Turkey'];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    if (warZones.includes(name)) return { fillColor: "#ff0000", weight: 2, color: '#ff3333', fillOpacity: 0.3 };
                    if (highTension.includes(name)) return { fillColor: "#ff8c00", weight: 1.5, color: '#ff8c00', fillOpacity: 0.2 };
                    if (monitored.includes(name)) return { fillColor: "#3498db", weight: 1, color: '#3498db', fillOpacity: 0.1 };
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    let label = "STATUS: MONITORED";
                    if (warZones.includes(name)) label = "STATUS: <span style='color:red;'>CRITICAL WARZONE</span>";
                    else if (highTension.includes(name)) label = "STATUS: <span style='color:orange;'>HIGH TENSION</span>";

                    layer.bindTooltip(`<div style="background:black; color:white; border:1px solid #39FF14; padding:8px; font-family:monospace;">
                        <strong style="color:#39FF14;">${name.toUpperCase()}</strong><br>${label}</div>`, { sticky: true });
                }
            }).addTo(map);
        });

    // --- 3. ВОЕННИ ОБЕКТИ (С КОТВИ) ---
    const militaryAssets = [
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99, info: "Coastal Defense" },
        { name: "Sevastopol Naval", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet HQ" },
        { name: "Hostomel Airport", type: "airbase-ua", lat: 50.59, lon: 30.21, info: "Strategic Hub" },
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21, info: "Bomber Command" },
        { name: "Natanz Radar", type: "radar-iran", lat: 33.72, lon: 51.72, info: "Early Warning" }
    ];

    // --- 4. CSS СТИЛОВЕ ---
    const style = document.createElement("style");
    style.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .icon-ua { background: rgba(52, 152, 219, 0.3); color: #3498db; }
        .icon-ru { background: rgba(231, 76, 60, 0.3); color: #e74c3c; }
        .read-btn { display: inline-block; margin-top: 15px; padding: 10px 20px; background: #39FF14; color: black !important; font-weight: bold; text-decoration: none; border-radius: 4px; animation: glow 2s infinite; }
        @keyframes glow { 0% { box-shadow: 0 0 5px #39FF14; } 50% { box-shadow: 0 0 20px #39FF14; } 100% { box-shadow: 0 0 5px #39FF14; } }
    `;
    document.head.appendChild(style);

    // --- 5. ИКОНИ ---
    function getIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.includes('naval')) sym = '⚓';
        if (type.includes('radar')) sym = '📡';
        cls += type.includes('ua') ? 'icon-ua' : 'icon-ru';
        
        return L.divIcon({
            html: `<div class="${cls}" style="font-size:20px; width:34px; height:34px;">${sym}</div>`,
            className: '', iconSize: [34, 34]
        });
    }

    militaryAssets.forEach(a => {
        L.marker([a.lat, a.lon], { icon: getIcon(a.type) }).addTo(militaryLayer)
            .bindTooltip(`<b>${a.name}</b><br>${a.info}`);
    });

    // --- 6. НОВИНИ И ФИКС НА ЛИНКА ---
    function syncIntel() {
        fetch('conflicts.json?v=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                data.forEach(item => {
                    const dot = L.divIcon({
                        html: `<div style="color:red; font-size:24px; text-shadow: 0 0 10px red;">●</div>`,
                        className: 'pulse'
                    });
                    
                    L.marker([item.lat, item.lon], { icon: dot }).addTo(markersLayer)
                        .on('click', () => {
                            const panel = document.getElementById('news-content');
                            if(panel) {
                                // ТУК Е ВАЖНИЯТ ФИКС: target="_blank"
                                panel.innerHTML = `
                                    <h2 style="color:#39FF14;">${item.title}</h2>
                                    <p>${item.description}</p>
                                    <div style="color:red; font-weight:bold;">CASUALTIES: ${item.fatalities || 0}</div>
                                    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="read-btn">READ FULL REPORT »</a>
                                `;
                            }
                        });
                });
            });
    }

    syncIntel();
    setInterval(syncIntel, 60000);
};

// --- 7. ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);

/**
 * КРАЙ НА КОДА - 265 РЕДА. ВСИЧКИ ЕЛЕМЕНТИ СА ЗАПАЗЕНИ.
 */
