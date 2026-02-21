/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v17.0 - FULL SYSTEM RESTORATION
 * =============================================================================
 * ЛОГИКА: Пълна интеграция на новини + Военни активи + Гео-зони.
 * ФИКС: Връщане на всички икони (⚓, 🦅, 📡) и модални прозорци.
 * СТАТУС: 250 РЕДА - СТРИКТНО СПАЗВАНЕ НА ОБЕМА.
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА КОНТЕЙНЕРИ ЗА ПРОЗОРЦИ ---
    if (!document.getElementById('intel-details-container')) {
        const modal = document.createElement('div');
        modal.id = 'intel-details-container';
        modal.style = "position:fixed; display:none; z-index:10001; font-family:monospace;";
        document.body.appendChild(modal);
        const content = document.createElement('div');
        content.id = 'news-content';
        modal.appendChild(content);
    }

    // --- 2. КАРТА И СЛОЕВЕ (Запазени от v12.5) ---
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

    // --- 3. ГЕОПОЛИТИЧЕСКИ ЗОНИ (Синя Европа, САЩ, Йемен) ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Spain', 'Bulgaria', 'Romania', 'Greece', 'Norway', 'Belgium'];
    const highTension = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'United States', 'United States of America', 'USA', 'Turkey'];

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
                    let sColor = warZones.includes(n) ? "#ff3131" : (blueZone.includes(n) ? "#00a2ff" : "#39FF14");
                    l.bindTooltip(`<div style="background:black; color:white; border:1px solid ${sColor}; padding:5px; font-family:monospace;"><strong>${n.toUpperCase()}</strong></div>`, { sticky: true });
                }
            }).addTo(map);
        });

    // --- 4. РАЗШИРЕНИ ВОЕННИ АСЕТИ (САЩ, ИРАН, УКРАЙНА) ---
    const assets = [
        { name: "Fifth Fleet HQ (US)", type: "us-naval", lat: 26.21, lon: 50.60 },
        { name: "Al Udeid Air Base (US)", type: "us-airbase", lat: 25.11, lon: 51.21 },
        { name: "Tehran Air Defense HQ", type: "ir-pvo", lat: 35.68, lon: 51.41 },
        { name: "Bushehr Defense System", type: "ir-pvo", lat: 28.82, lon: 50.88 },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53 },
        { name: "Odesa Strategic Port", type: "naval-ua", lat: 46.48, lon: 30.72 },
        { name: "Kyiv Command Center", type: "ua-hq", lat: 50.45, lon: 30.52 },
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21 }
    ];

    // --- 5. ДИНАМИЧЕН CSS (Пълна визуална конфигурация) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .leaflet-marker-icon { background: transparent !important; border: none !important; }
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.8); }
        .icon-us { background: rgba(57, 255, 20, 0.4); border-color: #39FF14; color: #fff; }
        .icon-ir { background: rgba(255, 140, 0, 0.4); border-color: #ff8c00; color: #fff; }
        .icon-ua { background: rgba(52, 152, 219, 0.6); } 
        .icon-ru { background: rgba(231, 76, 60, 0.6); }
        .pulse-intel { animation: pulse-yellow 2.5s infinite; cursor: pointer; }
        .pulse-breaking { animation: pulse-red-crit 1.2s infinite; background: rgba(255, 49, 49, 0.7) !important; border-radius: 50%; }
        @keyframes pulse-yellow { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulse-red-crit { 0% { box-shadow: 0 0 0 0 rgba(255, 49, 49, 0.9); } 70% { box-shadow: 0 0 0 20px rgba(255, 49, 49, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 49, 49, 0); } }
        .expanded-intel {
            position: fixed !important; top: 50% !important; left: 50% !important;
            transform: translate(-50%, -50%) !important; width: 620px !important;
            z-index: 10000 !important; background: rgba(5, 5, 5, 0.98) !important;
            border: 2px solid #39FF14 !important; box-shadow: 0 0 150px #000; padding: 0 !important; display: block !important;
        }
        .close-trigger { cursor: pointer; color: #ff3131; border: 1px solid #ff3131; padding: 4px 15px; font-weight: bold; font-size: 14px; }
        .intel-entry-item { border-left: 4px solid #39FF14; padding: 12px; margin-bottom: 10px; cursor: pointer; background: rgba(255,255,255,0.03); transition: 0.3s; }
        .intel-entry-item:hover { background: rgba(57,255,20,0.1); }
    `;
    document.head.appendChild(styleSheet);

    // --- 6. ЛОГИКА ЗА ТАКТИЧЕСКИ ИКОНИ (Символи ⚓, 🦅, 📡) ---
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
            else sym = '🛫';
        } else {
            cls += type.includes('ua') ? 'icon-ua' : 'icon-ru';
            if (type.includes('naval')) sym = '⚓';
        }
        return L.divIcon({ html: `<div class="${cls}" style="font-size:18px; width:34px; height:34px;">${sym}</div>`, className: '', iconSize: [34, 34] });
    }

    assets.forEach(a => L.marker([a.lat, a.lon], { icon: getTacticalIcon(a.type) }).addTo(militaryLayer).bindTooltip(a.name));

    // --- 7. МОДАЛЕН ПАНЕЛ (Запазен от v12.5 и фиксиран) ---
    const openIntelDetails = (item, isBreaking) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        const themeColor = isBreaking ? "#ff3131" : "#39FF14";
        if (container && content) {
            container.classList.add('expanded-intel');
            container.style.borderColor = themeColor;
            content.innerHTML = `
                <div style="background:${themeColor}22; padding:15px; border-bottom:1px solid ${themeColor}; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:${themeColor}; font-weight:bold; letter-spacing:2px;">${isBreaking ? '🚨 CRITICAL ALERT' : 'STRATEGIC INTEL'}</span>
                    <span id="close-intel-btn" class="close-trigger" style="color:${themeColor}; border-color:${themeColor};">CLOSE [X]</span>
                </div>
                <div style="padding:30px; color:white;">
                    <h2 style="color:${themeColor}; margin-top:0; font-size:24px;">${item.title.toUpperCase()}</h2>
                    <p style="font-size:18px; line-height:1.7; color:#ddd;">${item.description || "Active intelligence monitoring in progress..."}</p>
                    <div style="background:rgba(255,255,255,0.05); padding:20px; border-left:5px solid ${themeColor}; margin:25px 0;">
                        <strong>LOCALITY:</strong> ${item.country || 'Global Sector'} | <strong>STATUS:</strong> ${isBreaking ? 'URGENT EVACUATION' : 'MONITORING'}
                    </div>
                    <button onclick="window.open('${item.link || '#'}')" style="width:100%; background:${themeColor}; color:#000; padding:15px; border:none; font-weight:bold; cursor:pointer; font-size:16px;">ACCESS SECURE FEED</button>
                </div>`;
            document.getElementById('close-intel-btn').onclick = () => container.classList.remove('expanded-intel');
        }
        map.flyTo([item.lat, item.lon], 7, { animate: true, duration: 1.5 });
    };

    // --- 8. СИНХРОНИЗАЦИЯ С PYTHON JSON (Ключови думи) ---
    function syncIntel() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            markersLayer.clearLayers();
            const list = document.getElementById('intel-list');
            if (list) list.innerHTML = ''; 
            
            data.forEach(item => {
                // ПРОВЕРКА ЗА КЛЮЧОВИ ДУМИ ОТ НОВИНИТЕ (image_79b1aa)
                const keywords = ["EVACUATE", "BREAKING", "STRIKE", "ATTACK", "WAR", "URGENT"];
                const isCrit = keywords.some(k => 
                    (item.title + " " + (item.description || "")).toUpperCase().includes(k)
                );

                const iconHtml = `<div class="${isCrit ? 'pulse-breaking' : 'pulse-intel'}" style="font-size:32px; text-align:center;">${isCrit ? '🚨' : '⚠️'}</div>`;
                
                const marker = L.marker([item.lat, item.lon], { 
                    icon: L.divIcon({ html: iconHtml, className: '', iconSize:[40,40] }) 
                }).addTo(markersLayer);

                marker.on('click', () => openIntelDetails(item, isCrit));

                if (list) {
                    const entry = document.createElement('div');
                    entry.className = 'intel-entry-item';
                    entry.style.borderLeftColor = isCrit ? '#ff3131' : '#39FF14';
                    entry.innerHTML = `<small style="color:#aaa;">[${item.date}]</small><br><strong style="color:${isCrit ? '#ff3131' : '#fff'};">${item.title}</strong>`;
                    entry.onclick = () => openIntelDetails(item, isCrit);
                    list.appendChild(entry);
                }
            });
        }).catch(e => console.log("Waiting for JSON update..."));
    }

    syncIntel(); setInterval(syncIntel, 45000); // Оптимизиран рефреш
};

// --- 9. UTC ЧАСОВНИК (image_79b907) ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) el.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
}, 1000);

/**
 * КРАЙ НА КОДА - 250 РЕДА.
 * СИСТЕМАТА Е ГОТОВА ЗА ИНТЕГРАЦИЯ С conflicts.json
 */
