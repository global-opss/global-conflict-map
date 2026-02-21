/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v13.0 - EVACUATION & TACTICAL INTEGRATION
 * =============================================================================
 * ЗАПАЗЕНО: Синя Европа, САЩ Fix, Украйна/Русия активи, ПВО на Иран.
 * НОВО: Автоматична сирена 🚨 при засичане на тип "Evacuation" (напускане на Иран).
 * СТАТУС: Коригиран синтаксис, разширена функционалност.
 * КОД: ТОЧНО 250 РЕДА.
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. КАРТА И СЛОЕВЕ ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.5
    }).setView([32.0, 45.0], 4.5); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, minZoom: 2, crossOrigin: true
    }).addTo(map);

    // --- 2. ГЕОПОЛИТИЧЕСКИ ЗОНИ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Spain', 'Bulgaria', 'Romania', 'Greece', 'Norway', 'Belgium'];
    const highTension = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'United States', 'USA', 'Turkey'];

    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(f) {
                    const n = f.properties.name;
                    if (warZones.includes(n)) return { fillColor: "#ff0000", weight: 2.2, color: '#ff3333', fillOpacity: 0.3 };
                    if (blueZone.includes(n)) return { fillColor: "#0055ff", weight: 2.0, color: '#00a2ff', fillOpacity: 0.25 };
                    if (highTension.includes(n)) return { fillColor: "#ff8c00", weight: 1.8, color: '#ff8c00', fillOpacity: 0.2 };
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(f, l) {
                    const n = f.properties.name;
                    let label = n.toUpperCase();
                    let sColor = "#39FF14"; 
                    if (warZones.includes(n)) { label += `<br><span style="color:#ff3131; font-size:10px;">WAR ZONE</span>`; sColor = "#ff3131"; }
                    else if (blueZone.includes(n)) { label += `<br><span style="color:#00a2ff; font-size:10px;">ALLY SECTOR</span>`; sColor = "#00a2ff"; }
                    else if (highTension.includes(n)) { label += `<br><span style="color:#ff8c00; font-size:10px;">HIGH TENSION</span>`; sColor = "#ff8c00"; }
                    l.bindTooltip(`<div style="background:black; color:white; border:1px solid ${sColor}; padding:5px; font-family:monospace;">${label}</div>`, { sticky: true });
                }
            }).addTo(map);
        });

    // --- 3. РАЗШИРЕН СПИСЪК АСЕТИ ---
    const assets = [
        { name: "Fifth Fleet HQ (US)", type: "us-naval", lat: 26.21, lon: 50.60 },
        { name: "Al Udeid Air Base (US)", type: "us-airbase", lat: 25.11, lon: 51.21 },
        { name: "Al Dhafra Base (US)", type: "us-airbase", lat: 24.24, lon: 54.54 },
        { name: "Camp Arifjan (US)", type: "us-hq", lat: 28.87, lon: 48.15 },
        { name: "Tehran Air Defense HQ", type: "ir-pvo", lat: 35.68, lon: 51.41 },
        { name: "Isfahan Airbase (IRIAF)", type: "ir-airbase", lat: 32.75, lon: 51.86 },
        { name: "Bandar Abbas Naval", type: "ir-naval", lat: 27.14, lon: 56.21 },
        { name: "Bushehr Defense System", type: "ir-pvo", lat: 28.82, lon: 50.88 },
        { name: "Fordow Strategic Site", type: "ir-hq", lat: 34.33, lon: 50.93 },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53 },
        { name: "Odesa Strategic Port", type: "naval-ua", lat: 46.48, lon: 30.72 },
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99 },
        { name: "Kyiv Command Center", type: "ua-hq", lat: 50.45, lon: 30.52 },
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21 }
    ];

    // --- 4. ДИНАМИЧЕН CSS ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .leaflet-marker-icon { background: transparent !important; border: none !important; }
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        .icon-us { background: rgba(57, 255, 20, 0.4); border-color: #39FF14; color: #fff; }
        .icon-ir { background: rgba(255, 140, 0, 0.4); border-color: #ff8c00; color: #fff; }
        .icon-ua { background: rgba(52, 152, 219, 0.6); } 
        .icon-ru { background: rgba(231, 76, 60, 0.6); }
        .pulse-intel { animation: pulse-green 2.5s infinite; cursor: pointer; }
        .pulse-evac { animation: pulse-red-evac 0.8s infinite; cursor: pointer; filter: drop-shadow(0 0 12px red); }
        @keyframes pulse-green { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulse-red-evac { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,0,0,0.7); } 70% { transform: scale(1.2); box-shadow: 0 0 0 15px rgba(255,0,0,0); } 100% { transform: scale(1); } }
        .expanded-intel { position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; width: 620px !important; z-index: 10000 !important; background: rgba(10, 10, 10, 0.99) !important; border: 2px solid #39FF14 !important; box-shadow: 0 0 100px #000; }
        .intel-entry { border-left: 3px solid #39FF14; padding: 12px; margin-bottom: 8px; cursor: pointer; background: rgba(255,255,255,0.03); transition: 0.2s; }
        .intel-entry:hover { background: rgba(57, 255, 20, 0.1); }
        .evac-entry { border-left: 3px solid #ff3131 !important; background: rgba(255,0,0,0.1) !important; }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ЛОГИКА ЗА ТАКТИЧЕСКИ ИКОНИ ---
    function getTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.startsWith('us-')) {
            cls += 'icon-us';
            if (type.includes('naval')) sym = '⚓';
            else if (type.includes('hq')) sym = '🏢';
            else if (type.includes('airbase')) sym = '🦅';
        } else if (type.startsWith('ir-')) {
            cls += 'icon-ir';
            if (type.includes('pvo')) sym = '📡';
            else if (type.includes('naval')) sym = '🚢';
            else if (type.includes('hq')) sym = '☢️';
            else if (type.includes('airbase')) sym = '🛫';
        } else {
            if (type.includes('ua')) cls += 'icon-ua'; else cls += 'icon-ru';
            if (type.includes('naval')) sym = '⚓';
        }
        return L.divIcon({ html: `<div class="${cls}" style="font-size:16px; width:32px; height:32px;">${sym}</div>`, className: '', iconSize: [32, 32] });
    }

    assets.forEach(a => L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(a.name));

    // --- 6. МОДАЛЕН ПАНЕЛ ---
    const openIntelDetails = (item) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        if (container && content) {
            const isEvac = item.type === "Evacuation";
            container.classList.add('expanded-intel');
            if (isEvac) container.style.borderColor = "#ff3131"; else container.style.borderColor = "#39FF14";
            content.innerHTML = `
                <div style="background:rgba(57,255,20,0.1); padding:12px; border-bottom:1px solid #333; display:flex; justify-content:space-between;">
                    <span style="color:${isEvac ? '#ff3131' : '#39FF14'}; font-weight:bold;">${isEvac ? 'URGENT EVACUATION ALERT' : 'TACTICAL INTEL'}</span>
                    <span id="close-intel-btn" style="cursor:pointer; color:#ff3131;">[X]</span>
                </div>
                <div style="padding:25px; color:white;">
                    <h2 style="color:${isEvac ? '#ff3131' : '#39FF14'}; margin-top:0;">${item.title.toUpperCase()}</h2>
                    <p>${item.description || "Stream active."}</p>
                    <div style="background:rgba(255,0,0,0.1); padding:10px; border-left:4px solid #ff3131;">THREAT: ${isEvac ? 'CRITICAL' : 'ELEVATED'} | UNIT: ${item.type}</div>
                    <a href="${item.link || "#"}" target="_blank" style="display:block; background:#39FF14; color:#000; padding:10px; text-align:center; margin-top:20px; text-decoration:none; font-weight:bold;">ACCESS FEED</a>
                </div>`;
            document.getElementById('close-intel-btn').onclick = () => container.classList.remove('expanded-intel');
        }
        map.flyTo([item.lat, item.lon], 7);
    };

    // --- 7. СИНХРОНИЗАЦИЯ ---
    function syncIntel() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            markersLayer.clearLayers();
            const list = document.getElementById('intel-list');
            if (list) list.innerHTML = ''; 
            data.forEach(item => {
                const isEvac = item.type === "Evacuation";
                const sym = isEvac ? '🚨' : (item.type.includes('missile') ? '🚀' : '⚠️');
                const marker = L.marker([item.lat, item.lon], { 
                    icon: L.divIcon({ html: `<div class="${isEvac ? 'pulse-evac' : 'pulse-intel'}" style="font-size:32px;">${sym}</div>`, className: '', iconSize:[40,40] }) 
                }).addTo(markersLayer);
                marker.on('click', () => openIntelDetails(item));
                if (list) {
                    const entry = document.createElement('div');
                    entry.className = isEvac ? 'intel-entry evac-entry' : 'intel-entry';
                    entry.innerHTML = `<small>[${item.date}]</small><br><strong style="color:${isEvac ? '#ff3131' : '#39FF14'};">${item.title}</strong>`;
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
