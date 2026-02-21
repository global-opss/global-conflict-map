/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v13.6 - FULL SCALE DEPLOYMENT
 * =============================================================================
 * ПОТРЕБИТЕЛ: BORISLAV | СТАТУС: ФИНАЛИЗИРАН (250 РЕДА)
 * -----------------------------------------------------------------------------
 * ОПИСАНИЕ:
 * - Пълен интерфейс за мониторинг на конфликти.
 * - Оптимизиран обектен панел: 650px.
 * - Звукова система: alert.mp3 (само при критични събития).
 * - Визуални надписи: Черен фон + Бяла рамка (Custom Tooltips).
 * =============================================================================
 */

window.onload = function() {
    
    // ПАМЕТ НА СИСТЕМАТА ЗА ГОРЕЩИ СЪБИТИЯ
    // Предотвратява дублирането на алармите
    let globalLastEventTitle = ""; 

    // --- СЕКЦИЯ 1: ИНИЦИАЛИЗАЦИЯ НА ТАКТИЧЕСКАТА КАРТА ---
    const map = L.map('map', {
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.1,
        wheelDebounceTime: 70,
        preferCanvas: true
    }).setView([35.0, 40.0], 4.2); 

    // Слоеве за динамично управление на данните
    const markersLayer = L.layerGroup().addTo(map);
    const militaryLayer = L.layerGroup().addTo(map);

    // Зареждане на базовия тъмен слой
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 2,
        crossOrigin: true
    }).addTo(map);

    // --- СЕКЦИЯ 2: ГЕОПОЛИТИЧЕСКИ ЗОНИ И КАТЕГОРИИ ---
    const warZones = ['Russia', 'Ukraine', 'Israel', 'Palestine', 'Sudan', 'Syria', 'Yemen', 'Iraq', 'Lebanon'];
    const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Bulgaria', 'Romania', 'Greece', 'Norway'];
    const tensionZones = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'USA', 'Turkey', 'Saudi Arabia'];

    // Зареждане на GeoJSON границите на държавите
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
    .then(res => res.json())
    .then(geoData => {

        L.geoJson(geoData, {

            style: function(feature) {
                const n = feature.properties.name;
                
                // Цветово кодиране според нивото на риск
                if (warZones.includes(n)) {
                    return { fillColor:"#ff0000", weight:2.5, color:"#ff3131", fillOpacity:0.35, className:"war-border" };
                }
                if (tensionZones.includes(n)) {
                    return { fillColor:"#ff8c00", weight:2.0, color:"#ff8c00", fillOpacity:0.25, className:"tension-glow" };
                }
                if (blueZone.includes(n)) {
                    return { fillColor:"#0055ff", weight:2.0, color:"#00a2ff", fillOpacity:0.25 };
                }
                return { fillColor:"#000", weight:0.6, color:"#333", fillOpacity:0.1 };
            },

            onEachFeature: function(feature, layer) {
                const n = feature.properties.name;

                // --- ФИКСИРАНИ НАДПИСИ (TOOLTIPS) С БЯЛА РАМКА ---
                // Замества стария ред 64 от твоя скрийншот
                layer.bindTooltip(`
                    <div style="
                        background: #000; 
                        color: #39FF14; 
                        border: 2px solid #ccc; 
                        padding: 6px 12px; 
                        font-family: 'Courier New', monospace; 
                        font-weight: bold;
                        font-size: 13px;
                    ">
                        ${n.toUpperCase()}
                    </div>`, { 
                    sticky: true, 
                    direction: 'top', 
                    opacity: 1.0, 
                    offset: [0, -12] 
                });

                // Ефекти при посочване с мишката
                layer.on('mouseover', function() { 
                    this.setStyle({ fillOpacity:0.55, weight:3.5 }); 
                });

                layer.on('mouseout', function() {
                    this.setStyle({
                        fillOpacity: warZones.includes(n) ? 0.35 : 0.25,
                        weight: warZones.includes(n) ? 2.5 : 2.0
                    });
                });
            }

        }).addTo(map);

    });

    // --- СЕКЦИЯ 3: СТРАТЕГИЧЕСКИ ВОЕННИ АКТИВИ ---
    const strategicAssets = [
        { name:"US 5th Fleet HQ (Bahrain)", type:"us-naval", lat:26.21, lon:50.60 },
        { name:"Al Udeid Air Base (Qatar)", type:"us-air", lat:25.11, lon:51.21 },
        { name:"Tehran Central Command", type:"ir-pvo", lat:35.68, lon:51.41 },
        { name:"Bushehr Nuclear Defense", type:"ir-pvo", lat:28.82, lon:50.88 },
        { name:"Sevastopol Naval Base", type:"ru-naval", lat:44.61, lon:33.53 },
        { name:"Tartus Port (Russia)", type:"ru-naval", lat:34.88, lon:35.88 },
        { name:"Odesa Strategic Port", type:"ua-port", lat:46.48, lon:30.72 },
        { name:"Kyiv Defense Bunker", type:"ua-hq", lat:50.45, lon:30.52 },
        { name:"Incirlik Air Base (NATO)", type:"us-air", lat:37.00, lon:35.42 },
        { name:"Aviano Air Base (Italy)", type:"us-air", lat:46.03, lon:12.59 },
        { name:"Diego Garcia Base", type:"us-naval", lat:-7.31, lon:72.41 },
        { name:"Kaliningrad HQ", type:"ru-hq", lat:54.71, lon:20.45 }
    ];

    // --- СЕКЦИЯ 4: ТАКТИЧЕСКИ UI СТИЛОВЕ (CSS) ---
    const styleTag = document.createElement("style");
    styleTag.innerText = `
        /* Премахване на стандартния дизайн на Leaflet Tooltips */
        .leaflet-tooltip { background: transparent !important; border: none !important; box-shadow: none !important; }
        
        .leaflet-marker-icon { background:none !important; border:none !important; }
        .mil-icon-box { display:flex; align-items:center; justify-content:center; border-radius:50%; border:1px solid #fff; box-shadow:0 0 8px #000; }
        .icon-us-nato { background:rgba(57,255,20,0.45); border-color:#39FF14; }
        .icon-iran-tension { background:rgba(255,140,0,0.45); border-color:#ff8c00; }
        .icon-ru-ua { background:rgba(255,0,0,0.45); border-color:#ff3131; }

        .alert-pulse { animation:alert-anim 2s infinite alternate; cursor:pointer; filter:drop-shadow(0 0 15px #ff3131); }
        @keyframes alert-anim { from{transform:scale(1);opacity:1;} to{transform:scale(1.35);opacity:0.5;} }

        .war-border { animation:warPulse 2s infinite alternate; }
        @keyframes warPulse { from{stroke-width:2.5;filter:drop-shadow(0 0 5px #ff0000);} to{stroke-width:4;filter:drop-shadow(0 0 15px #ff0000);} }
        .tension-glow { filter:drop-shadow(0 0 12px #ff8c00); }
        
        /* КОНФИГУРАЦИЯ НА 650PX ОБЕКТЕН ПАНЕЛ */
        .expanded-objective-panel {
            position: fixed !important; 
            top: 50% !important; 
            left: 50% !important;
            transform: translate(-50%, -50%) !important; 
            width: 650px !important;
            min-height: 520px !important; 
            z-index: 99999 !important;
            background: rgba(6, 6, 6, 0.98) !important; 
            border: 2px solid #39FF14 !important;
            box-shadow: 0 0 150px #000; 
            font-family: 'Courier New', monospace; 
            display: flex; 
            flex-direction: column;
        }
    `;
    document.head.appendChild(styleTag);

    // --- СЕКЦИЯ 5: МОДАЛНА СИСТЕМА (ОТВАРЯНЕ НА ПРОЗОРЕЦА) ---
    const showObjectiveDetails = (item) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        
        if (!container || !content) return;

        container.classList.add('expanded-objective-panel');
        content.innerHTML = `
            <div style="background:#111; padding:18px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#39FF14; font-weight:bold; letter-spacing:1px;">>> TACTICAL INTEL REPORT</span>
                <span id="close-objective" style="cursor:pointer; color:#ff3131; border:1px solid #ff3131; padding:4px 12px; font-weight:bold;">EXIT SYSTEM [X]</span>
            </div>
            <div style="padding:45px; color:white; overflow-y:auto;">
                <h1 style="color:#39FF14; font-size:32px; line-height:1.2; margin-top:0;">${item.title.toUpperCase()}</h1>
                <hr style="border:0; border-top:1px solid #222; margin:25px 0;">
                <div style="margin-bottom:30px;">
                    <p style="font-size:19px; color:#39FF14;">SECTOR: <span style="color:#fff;">${item.country || 'GLOBAL'}</span></p>
                    <p style="font-size:19px; color:#39FF14;">TIME: <span style="color:#fff;">${item.date || 'REAL-TIME'}</span></p>
                </div>
                <p style="font-size:21px; line-height:1.6; color:#ddd; margin-bottom:40px;">${item.description || 'Intelligence feed active. No description available.'}</p>
                <div style="text-align:center;">
                    <a href="${item.link || '#'}" target="_blank" style="background:#39FF14; color:#000; padding:15px 35px; text-decoration:none; font-weight:bold; font-size:18px; display:inline-block;">ACCESS SOURCE DATA</a>
                </div>
            </div>`;
        
        document.getElementById('close-objective').onclick = () => container.classList.remove('expanded-objective-panel');
        map.flyTo([item.lat, item.lon], 7);
    };

    // --- СЕКЦИЯ 6: СИНХРОНИЗАЦИЯ С JSON И АЛАРМИ ---
    function syncTacticalData() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            if (!Array.isArray(data)) return;
            markersLayer.clearLayers();
            const sidebar = document.getElementById('intel-list');
            if (sidebar) sidebar.innerHTML = '';

            // Логика за стартиране на alert.mp3
            if (data.length > 0 && data[0].title !== globalLastEventTitle) {
                if (data[0].critical === true || data[0].type === "Evacuation") {
                    const audio = new Audio('alert.mp3');
                    audio.play().catch(() => console.log("Audio blocked by browser."));
                }
                globalLastEventTitle = data[0].title;
            }

            data.forEach(item => {
                const icon = (item.critical || item.type === "Evacuation") ? '🚨' : '⚠️';
                const marker = L.marker([item.lat, item.lon], {
                    icon: L.divIcon({ html: `<div class="alert-pulse" style="font-size:38px;">${icon}</div>`, iconSize:[45,45] })
                }).addTo(markersLayer);

                marker.on('click', () => showObjectiveDetails(item));

                if (sidebar) {
                    const row = document.createElement('div');
                    row.style = "padding:12px; border-bottom:1px solid #222; cursor:pointer; background:rgba(255,255,255,0.02);";
                    row.innerHTML = `<small style="color:#666;">[${item.date}]</small><br><strong style="color:#39FF14;">${item.title}</strong>`;
                    row.onclick = () => showObjectiveDetails(item);
                    sidebar.appendChild(row);
                }
            });
        });
    }

    // --- СЕКЦИЯ 7: ПОМОЩНИ МОДУЛИ ЗА ИКОНИ ---
    function createAssetIcon(type) {
        let sym='✈️'; let cls='mil-icon-box ';
        if(type.startsWith('us-')){ cls+='icon-us-nato'; sym=type.includes('naval')?'⚓':'🦅'; }
        else if(type.startsWith('ir-')){ cls+='icon-iran-tension'; sym=type.includes('pvo')?'📡':'☢️'; }
        else { cls+='icon-ru-ua'; sym=type.includes('naval')?'⚓':'🚢'; }
        return L.divIcon({ html:`<div class="${cls}" style="font-size:18px;width:34px;height:34px;">${sym}</div>`, iconSize:[34,34] });
    }

    // Иницииране на статичните бази
    strategicAssets.forEach(asset => {
        L.marker([asset.lat, asset.lon], {icon:createAssetIcon(asset.type)}).addTo(militaryLayer).bindTooltip(asset.name);
    });

    syncTacticalData();
    setInterval(syncTacticalData, 60000);
};

// --- СЕКЦИЯ 8: СИСТЕМЕН UTC ЧАСОВНИК ---
setInterval(() => {
    const el = document.getElementById('header-time');
    if (el) {
        const timeStr = new Date().toUTCString().split(' ')[4];
        el.innerText = timeStr + " UTC";
    }
}, 1000);

/**
 * =============================================================================
 * СИСТЕМЕН ЛОГ: ВСИЧКИ МОДУЛИ СА ОНЛАЙН.
 * ГРАНИЦИ, ЗВУК И 650PX МОДАЛ СА ЗАРЕДЕНИ.
 * ВЕРСИЯ 13.6 - КРАЙ НА ФАЙЛА.
 * =============================================================================
 */
