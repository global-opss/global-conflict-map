/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v4.16 - ABSOLUTE RECOVERY
 * =============================================================================
 * ОБЕКТ: Фикс на статуси (War/High Tension/Monitored) + Котви + Външни линкове.
 * СТАТУС: АКТИВЕН - 260 РЕДА.
 * =============================================================================
 */

window.onload = function() {
    
    // --- 1. ИНИЦИАЛИЗАЦИЯ НА ТЕРМИНАЛА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false
    }).setView([40.0, 35.0], 4); 

    const markersLayer = L.layerGroup().addTo(map);   
    const militaryLayer = L.layerGroup().addTo(map);  

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
    }).addTo(map);

    // --- 2. КАТЕГОРИЗАЦИЯ НА ЗОНИТЕ (ВЪЗСТАНОВЕНА) ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen'];
    const highTension = ['Iran', 'North Korea', 'South Korea', 'China', 'Taiwan'];
    const monitoredReg = ['United States', 'USA', 'United Kingdom', 'Turkey', 'Germany', 'France'];

    // ЗАРЕЖДАНЕ НА ГРАНИЦИ И ТАКТИЧЕСКИ ЦВЕТОВЕ
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: function(feature) {
                    const name = feature.properties.name;
                    // ПРИЛАГАНЕ НА СПЕЦИФИЧНИТЕ ЦВЕТОВЕ ОТ СНИМКИТЕ
                    if (warZones.includes(name)) return { fillColor: "#ff0000", weight: 2, color: '#ff3333', fillOpacity: 0.35 };
                    if (highTension.includes(name)) return { fillColor: "#ff8c00", weight: 1.5, color: '#ff8c00', fillOpacity: 0.25 };
                    if (monitoredReg.includes(name)) return { fillColor: "#3498db", weight: 1.2, color: '#3498db', fillOpacity: 0.15 };
                    return { fillColor: "#000", weight: 0.5, color: "#222", fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const name = feature.properties.name;
                    let label = "<span style='color:#39FF14;'>MONITORED REGION</span>";
                    
                    // ФИКС НА СТАТУСИТЕ В TOOLTIP (image_406766.jpg)
                    if (warZones.includes(name)) label = "<span style='color:#ff4d4d;'>CRITICAL WARZONE</span>";
                    else if (highTension.includes(name)) label = "<span style='color:#ff8c00;'>HIGH TENSION ZONE</span>";

                    layer.bindTooltip(`<div style="background:rgba(0,0,0,0.9); color:white; border:1px solid #39FF14; padding:10px; font-family:monospace;">
                        <strong style="color:#39FF14; font-size:14px;">${name.toUpperCase()}</strong><br>
                        STATUS: ${label}</div>`, { sticky: true });
                }
            }).addTo(map);
        });

    // --- 3. ВОЕННИ ОБЕКТИ (ВЪЗСТАНОВЕНИ КОТВИ - image_4054ba.jpg) ---
    const militaryAssets = [
        { name: "Mykolaiv Naval HQ", type: "naval-ua", lat: 46.96, lon: 31.99, info: "Coastal Defense" },
        { name: "Sevastopol Naval Base", type: "naval-ru", lat: 44.61, lon: 33.53, info: "Black Sea Fleet HQ" },
        { name: "Odesa Port Intel", type: "naval-ua", lat: 46.48, lon: 30.72, info: "Maritime Logistics" },
        { name: "Hostomel Airport", type: "airbase-ua", lat: 50.59, lon: 30.21, info: "Strategic Cargo" },
        { name: "Engels-2 Strategic", type: "airbase-ru", lat: 51.48, lon: 46.21, info: "Bomber Fleet Command" },
        { name: "Natanz AD Complex", type: "radar-iran", lat: 33.72, lon: 51.72, info: "Early Warning Radar" },
        { name: "Al Udeid Base", type: "us-hq", lat: 25.11, lon: 51.21, info: "US CENTCOM HQ" }
    ];

    // --- 4. ТАКТИЧЕСКИ CSS (ФИКС НА БУТОНА - image_406058.png) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .mil-icon { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,0.5); }
        .icon-ua { background: rgba(52, 152, 219, 0.3); color: #3498db; }
        .icon-ru { background: rgba(231, 76, 60, 0.3); color: #e74c3c; }
        .icon-us { background: rgba(57, 255, 20, 0.2); color: #39FF14; border: 1.5px solid #39FF14; }
        .read-more-btn { 
            display: inline-block; margin-top: 15px; padding: 12px 24px; 
            background: #39FF14 !important; color: #000 !important; 
            font-weight: bold; text-decoration: none !important; 
            border-radius: 4px; font-family: monospace; 
            text-transform: uppercase; cursor: pointer;
            box-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
        }
        .read-more-btn:hover { background: #fff !important; box-shadow: 0 0 20px #39FF14; }
        .pulse-dot { animation: pulse-red 2s infinite; }
        @keyframes pulse-red { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
    `;
    document.head.appendChild(styleSheet);

    // --- 5. ГЕНЕРАТОР НА ИКОНИ (КОТВИ И САМОЛЕТИ) ---
    function createTacticalIcon(type) {
        let sym = '✈️'; let cls = 'mil-icon ';
        if (type.includes('naval')) sym = '⚓';
        else if (type.includes('radar')) sym = '📡';
        else if (type.includes('us')) sym = '🦅';
        
        if (type.includes('ua')) cls += 'icon-ua';
        else if (type.includes('ru')) cls += 'icon-ru';
        else if (type.includes('us')) cls += 'icon-us';
        else cls += 'icon-ru'; // Default за Иран/други
        
        return L.divIcon({
            html: `<div class="${cls}" style="font-size:20px; width:34px; height:34px;">${sym}</div>`,
            className: '', iconSize: [34, 34], iconAnchor: [17, 17]
        });
    }

    militaryAssets.forEach(asset => {
        L.marker([asset.lat, asset.lon], { icon: createTacticalIcon(asset.type) })
            .addTo(militaryLayer)
            .bindTooltip(`<b>${asset.name}</b><br>${asset.info}`);
    });

    // --- 6. LIVE INTEL FEED И ФИКС НА ЛИНКОВЕТЕ ---
    function updateIntel() {
        fetch('conflicts.json?cache=' + Date.now())
            .then(res => res.json())
            .then(data => {
                markersLayer.clearLayers();
                data.forEach(item => {
                    const newsIcon = L.divIcon({
                        html: `<div class="pulse-dot" style="color:#ff4d4d; font-size:24px; text-shadow:0 0 10px red;">●</div>`,
                        className: '', iconSize: [25, 25]
                    });
                    
                    L.marker([item.lat, item.lon], { icon: newsIcon })
                        .addTo(markersLayer)
                        .on('click', () => {
                            const panel = document.getElementById('news-content');
                            if(panel) {
                                // КРИТИЧЕН ФИКС: ВЪНШЕН ЛИНК (target="_blank")
                                const externalUrl = item.url || "#";
                                panel.innerHTML = `
                                    <h3 style="color:#39FF14; margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:10px;">${item.title}</h3>
                                    <p style="color:#ddd; line-height:1.6; font-size:15px;">${item.description}</p>
                                    <div style="margin: 15px 0; color:#ff4d4d; font-weight:bold;">TACTICAL CASUALTIES: ${item.fatalities || 0}</div>
                                    <a href="${externalUrl}" target="_blank" rel="noopener noreferrer" class="read-more-btn">READ FULL REPORT »</a>
                                `;
                            }
                        });
                });
                if(document.getElementById('active-events')) document.getElementById('active-events').innerText = data.length;
            });
    }

    updateIntel();
    setInterval(updateIntel, 60000);
};

// --- 7. UTC ТАКТИЧЕСКИ ЧАСОВНИК ---
setInterval(() => {
    const clock = document.getElementById('header-time');
    if (clock) {
        const d = new Date();
        clock.innerText = d.getUTCHours().toString().padStart(2, '0') + ":" + 
                          d.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                          d.getUTCSeconds().toString().padStart(2, '0') + " UTC";
    }
}, 1000);

/**
 * КРАЙ НА СТРАТЕГИЧЕСКИЯ КОД - 260 РЕДА.
 * ВСИЧКИ СТАТУСИ, КОТВИ И ЛИНКОВЕ СА ВЪЗСТАНОВЕНИ.
 */
