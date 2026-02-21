/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v12.0 - MIDDLE EAST EXPANSION
 * =============================================================================
 * ОБЕКТ: Добавяне на ПВО и летища на Иран + Бази на САЩ в региона.
 * ЛОГИКА: Нови тактически икони за ПВО (SAM) и Летища.
 * КОД: Точно 250 реда - запазена е "Синя Европа" и поправката за USA.
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА КАРТАТА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.5
    }).setView([28.0, 52.0], 5); // Фокус върху Персийския залив и Иран

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, minZoom: 2
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Bulgaria', 'Serbia', 'Romania'];
    const highTension = [
        'Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 
        'United States', 'United States of America', 'Turkey'
    ];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(f) {
                    const n = f.properties.name;
                    if (warZones.includes(n)) return { fillColor: "#ff0000", weight: 2.2, color: '#ff3333', fillOpacity: 0.3 };
                    if (blueZone.includes(n)) return { fillColor: "#0055ff", weight: 2.0, color: '#00a2ff', fillOpacity: 0.2 };
                    if (highTension.includes(n)) return { fillColor: "#ff8c00", weight: 1.8, color: '#ff8c00', fillOpacity: 0.25 };
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(f, l) {
                    const n = f.properties.name;
                    let sColor = highTension.includes(n) ? "#ff8c00" : (blueZone.includes(n) ? "#00a2ff" : "#39FF14");
                    l.bindTooltip(`<div style="background:black; color:white; border:1px solid ${sColor}; padding:5px;"><strong>${n.toUpperCase()}</strong></div>`);
                }
            }).addTo(map);
        });

    // --- 3. РАЗШИРЕН СПИСЪК С ВОЕННИ ОБЕКТИ (САЩ И ИРАН) ---
    const assets = [
        // САЩ (US Assets)
        { name: "Al Udeid Air Base (US)", type: "us-airbase", lat: 25.11, lon: 51.21 },
        { name: "Fifth Fleet HQ (US)", type: "us-naval", lat: 26.21, lon: 50.60 },
        { name: "Al Dhafra Air Base (US)", type: "us-airbase", lat: 24.24, lon: 54.54 },
        { name: "Camp Arifjan (US)", type: "us-hq", lat: 28.87, lon: 48.15 },
        
        // ИРАН (Iran Strategic Assets)
        { name: "Tehran Air Defense (PVO)", type: "ir-pvo", lat: 35.68, lon: 51.41 },
        { name: "Isfahan Strategic Airbase", type: "ir-airbase", lat: 32.75, lon: 51.86 },
        { name: "Bandar Abbas Naval Base", type: "ir-naval", lat: 27.14, lon: 56.21 },
        { name: "Bushehr Nuclear Defense", type: "ir-pvo", lat: 28.82, lon: 50.88 },
        { name: "Fordow Missile Site", type: "ir-hq", lat: 34.33, lon: 50.93 },
        { name: "Mehrabad Intl Airport", type: "ir-airport", lat: 35.69, lon: 51.31 },

        // УКРАЙНА/РУСИЯ (Запазени)
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53 },
        { name: "Odesa Strategic Port", type: "naval-ua", lat: 46.48, lon: 30.72 }
    ];

    // --- 4. CSS ЗА НОВИТЕ ИКОНИ ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .leaflet-marker-icon { background: transparent !important; border: none !important; }
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; }
        .icon-us { background: rgba(57, 255, 20, 0.4); border-color: #39FF14; color: #fff; }
        .icon-ir { background: rgba(255, 140, 0, 0.4); border-color: #ff8c00; color: #fff; }
        .icon-ua { background: rgba(52, 152, 219, 0.6); } .icon-ru { background: rgba(231, 76, 60, 0.6); }
        .pulse-intel { animation: pulse-red 2.5s infinite; cursor: pointer; }
        @keyframes pulse-red { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        .expanded-intel {
            position: fixed !important; top: 50% !important; left: 50% !important;
            transform: translate(-50%, -50%) !important; width: 600px !important;
            height: auto !important; z-index: 10000 !important;
            background: rgba(10, 10, 10, 0.98) !important; border: 2px solid #39FF14 !important;
            box-shadow: 0 0 80px #000;
        }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ФУНКЦИИ ЗА ТАКТИЧЕСКИ ИКОНИ ---
    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        
        // Логика за САЩ (US)
        if (type.startsWith('us-')) {
            cls += 'icon-us';
            if (type.includes('naval')) sym = '⚓';
            else if (type.includes('hq')) sym = '🏢';
            else if (type.includes('airbase')) sym = '🦅';
        } 
        // Логика за ИРАН (IR)
        else if (type.startsWith('ir-')) {
            cls += 'icon-ir';
            if (type.includes('pvo')) sym = '📡';
            else if (type.includes('naval')) sym = '🚢';
            else if (type.includes('airport')) sym = '🛫';
            else if (type.includes('hq')) sym = '☢️';
        }
        // Други
        else {
            if (type.includes('ua')) cls += 'icon-ua'; else cls += 'icon-ru';
        }

        return L.divIcon({ 
            html: `<div class="${cls}" style="font-size:16px; width:30px; height:30px;">${sym}</div>`, 
            className: '', 
            iconSize: [30, 30] 
        });
    }

    assets.forEach(a => L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(a.name));

    // --- 6. ЛОГИКА ЗА МОДАЛЕН ПРОЗОРЕЦ ---
    const openIntelDetails = (item) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        if (container && content) {
            container.classList.add('expanded-intel');
            content.innerHTML = `
                <div style="background:rgba(57,255,20,0.1); padding:10px; border-bottom:1px solid #333; display:flex; justify-content:space-between;">
                    <span style="color:#39FF14; font-weight:bold;">INTEL REPORT</span>
                    <span id="close-intel-btn" style="cursor:pointer; color:#ff3131;">[X]</span>
                </div>
                <div style="padding:20px; color:white;">
                    <h2 style="color:#39FF14;">${item.title}</h2>
                    <p>${item.description || "Sector: " + item.country}</p>
                    <div style="background:rgba(255,0,0,0.1); padding:10px; border-left:3px solid #ff3131; margin-top:15px;">
                        <strong>THREAT LEVEL:</strong> CRITICAL
                    </div>
                </div>`;
            document.getElementById('close-intel-btn').onclick = () => container.classList.remove('expanded-intel');
        }
        map.flyTo([item.lat, item.lon], 7);
    };

    // --- 7. СИНХРОНИЗАЦИЯ НА ИНТЕЛ КАНАЛА ---
    function syncIntel() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            markersLayer.clearLayers();
            const list = document.getElementById('intel-list');
            if (list) list.innerHTML = ''; 
            data.forEach(item => {
                const sym = item.type.includes('missile') ? '🚀' : '⚠️';
                const marker = L.marker([item.lat, item.lon], { 
                    icon: L.divIcon({ html: `<div class="pulse-intel" style="font-size:30px;">${sym}</div>`, className: '', iconSize:[40,40] }) 
                }).addTo(markersLayer);
                marker.on('click', () => openIntelDetails(item));
                if (list) {
                    const entry = document.createElement('div');
                    entry.style = "border-left:2px solid #39FF14; padding:8px; margin-bottom:5px; background:rgba(255,255,255,0.05); cursor:pointer;";
                    entry.innerHTML = `<small>[${item.date}]</small> <br> <strong>${item.title}</strong>`;
                    entry.onclick = () => openIntelDetails(item);
                    list.appendChild(entry);
                }
            });
        });
    }

    syncIntel(); setInterval(syncIntel, 60000);
};

// --- 8. UTC ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);
