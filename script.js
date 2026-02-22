/**
 * =============================================================================
 * GLOBAL CONFLICT DASHBOARD v12.9 - HARDENED BUILD
 * =============================================================================
 * ПОТРЕБИТЕЛ: BORISLAV | СТАТУС: ФИНАЛНА ОПТИМИЗАЦИЯ (250 РЕДА)
 * -----------------------------------------------------------------------------
 * ОПИСАНИЕ:
 * - Размер на прозореца за детайли: 650px (Балансиран).
 * - Пълна поддръжка на звук: alert.mp3.
 * - Интерактивни зони: Русия, Украйна, Иран, САЩ, Израел, Близкия Изток.
 * - Пълна съвместимост с bot.py и conflicts.json.
 * =============================================================================
*/


// ТУК СЛАГАШ ЗВУКОВАТА ФУНКЦИЯ
function playTacticalPing() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine'; 
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5); 

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);


      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
  } 
  window.onload = function() {
    
    // ПАМЕТ НА СИСТЕМАТА ЗА ГОРЕЩИ СЪБИТИЯ
    // Използва се за избягване на повторни звукови сигнали
    let globalLastEventTitle = ""; 

    // --- СЕКЦИЯ 1: КОНФИГУРАЦИЯ НА КАРТАТА ---
    // Настройваме координатите за централен изглед към Евразия и Близкия изток
    const map = L.map('map', {
        worldCopyJump: true,    // Позволява безкрайно превъртане на изток/запад
        zoomControl: true,      // Стандартни бутони за навигация
        attributionControl: false, // Премахване на лога за по-чист интерфейс
        zoomSnap: 0.1,          // Прецизен контрол на мащаба
        wheelDebounceTime: 60   // Оптимизация на скрола с мишката
    }).setView([35.0, 40.0], 4.2); 

    // Дефиниране на слоеве за различни типове данни
    const markersLayer = L.layerGroup().addTo(map);   // Динамични новини
    const militaryLayer = L.layerGroup().addTo(map);  // Статични бази и активи
// === НОВ КОД ЗА ВРЕМЕТО (Weather Overlay) ===
    const weatherKey = '67201752bf204644024606cd545e794c';

    const cloudsLayer = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${weatherKey}`, {
        opacity: 0.45,
        attribution: 'Weather data © OpenWeather'
    });

    const rainLayer = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${weatherKey}`, {
        opacity: 0.5,
        attribution: 'Weather data © OpenWeather'
    });

    const weatherOverlays = {
        "<span style='color: #00FF00; font-weight: bold;'>[ SAT-CLOUDS ]</span>": cloudsLayer,
        "<span style='color: #00FF00; font-weight: bold;'>[ LIVE-RAIN ]</span>": rainLayer
    };

    L.control.layers(null, weatherOverlays, { 
    collapsed: true, 
    position: 'topleft' // Променяме от topright на topleft
}).addTo(map);
    // ===========================================
    // ИЗБОР НА ТАКТИЧЕСКИ ТАЙЛОВЕ (DARK MATTER)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18, 
        minZoom: 2, 
        crossOrigin: true
    }).addTo(map);

// --- СЕКЦИЯ 2: ГЕОПОЛИТИЧЕСКИ ДАННИ И ГРАНИЦИ ---
const warZones = ['Russia', 'Ukraine', 'Syria', 'Sudan'];
const blueZone = ['France', 'Germany', 'United Kingdom', 'Italy', 'Poland', 'Bulgaria', 'Romania', 'Greece', 'Norway', 'Jordan', 'Lebanon', 'Turkey', 'Saudi Arabia', 'Lithuania', 'Belarus', 'Finland', 'Sweden'];
const tensionZones = ['Iran', 'North Korea', 'China', 'Taiwan', 'Venezuela', 'USA', 'United States', 'Iraq', 'Yemen', 'Israel', 'Latvia', 'Estonia', 'Pakistan', 'Afghanistan'];

fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
    .then(res => res.json())
    .then(geoData => {
        L.geoJson(geoData, {
            style: function(feature) {
                const countryName = feature.properties.name;
                if (warZones.includes(countryName)) return { fillColor: "#ff0000", weight: 2.2, color: '#ff3333', fillOpacity: 0.3 };
                if (blueZone.includes(countryName)) return { fillColor: "#0055ff", weight: 2.0, color: '#00a2ff', fillOpacity: 0.25 };
                if (tensionZones.includes(countryName)) return { fillColor: "#ff8c00", weight: 1.8, color: '#ff8c00', fillOpacity: 0.2 };
                return { fillColor: "#000", weight: 0.6, color: "#333", fillOpacity: 0.1 };
            },
            onEachFeature: function(feature, layer) {
                const n = feature.properties.name;
                let statusText = "";
                let statusColor = "#39FF14"; // Зелено по подразбиране

                // ЛОГИКА ЗА АВТОМАТИЧЕН СТАТУС В НАДПИСА
                if (warZones.includes(n)) {
                    statusText = " - IN WAR";
                    statusColor = "#ff3131"; 
                } else if (tensionZones.includes(n)) {
                    statusText = " - CRITICAL";
                    statusColor = "#ff8c00"; 
                } else if (blueZone.includes(n)) {
                    statusText = " - MONITORING";
                    statusColor = "#00a2ff"; 
                }

                layer.bindTooltip(`
                    <div style="
                        background: #000; 
                        color: ${statusColor}; 
                        border: 2px solid #ccc; 
                        padding: 6px 10px; 
                        font-family: monospace; 
                        font-weight: bold;
                        text-transform: uppercase;
                    ">
                        ${n}${statusText}
                    </div>`, { sticky: true, offset: [0, -10] });
                
                layer.on('mouseover', function() { this.setStyle({ fillOpacity: 0.45, weight: 3 }); });
                layer.on('mouseout', function() { 
                    this.setStyle({ 
                        fillOpacity: warZones.includes(n) ? 0.3 : tensionZones.includes(n) ? 0.2 : 0.1, 
                        weight: warZones.includes(n) ? 2.2 : 0.6 
                    }); 
                });
            }
        }).addTo(map);
    });
    // --- СЕКЦИЯ 3: ВОЕННИ БАЗИ И ТАКТИЧЕСКИ АКТИВИ ---
    // Разширена база данни за по-плътна карта
    const strategicAssets = [
        { name: "US 5th Fleet HQ (Bahrain)", type: "us-naval", lat: 26.21, lon: 50.60 },
        { name: "US 5th Fleet HQ (Bahrain)", type: "us-naval", lat: 26.21, lon: 50.60, description: "Command center for Middle East naval operations." },
        { name: "Al Udeid Air Base (Qatar)", type: "us-air", lat: 25.12, lon: 51.31, description: "ASSETS: 24x F-16C, 12x B-1B Lancer, 40+ Tankers. Strategic Hub." },
        { name: "Tehran Central Command", type: "ir-pvo", lat: 35.68, lon: 51.41, description: "Main military HQ of the Islamic Republic of Iran." },
        { name: "Bushehr Nuclear Defense", type: "ir-pvo", lat: 28.82, lon: 50.88, description: "Air defense units protecting the Bushehr nuclear facility." },
        { name: "Sevastopol Naval Base", type: "ru-naval", lat: 44.61, lon: 33.53, description: "Main base of the Russian Black Sea Fleet." },
        { name: "Tartus Port (Russia)", type: "ru-naval", lat: 34.88, lon: 35.88, description: "Strategic Russian naval facility on the Mediterranean coast." },
        { name: "Odesa Strategic Port", type: "ua-port", lat: 46.48, lon: 30.72, description: "Major Ukrainian logistics and naval hub." },
        { name: "Kyiv Defense Bunker", type: "ua-hq", lat: 50.45, lon: 30.52, description: "Central command for Ukraine's defense administration." },
        { name: "Incirlik Air Base (Turkey)", type: "us-air", lat: 37.00, lon: 35.42, description: "ASSETS: 24x F-16 Fighting Falcons, KC-135 Tankers. NATO Support Base." },
        { name: "Aviano Air Base (Italy)", type: "us-air", lat: 46.03, lon: 12.59, description: "ASSETS: 31st Fighter Wing F-16C/D. Key Southern European air hub." },
        { name: "Diego Garcia Base", type: "us-naval", lat: -7.31, lon: 72.41, description: "Strategic hub for US bombers and naval support in the Indian Ocean." },
        { name: "Kaliningrad HQ", type: "ru-hq", lat: 54.71, lon: 20.45, description: "Russian Baltic Fleet HQ and missile defense center." },
        { name: "Muwaffaq Salti Air Base (Jordan)", type: "us-air", lat: 32.10, lon: 36.79, description: "ASSETS: 36x F-15E, 30x F-35A, 12x A-10C, 6x EA-18G. Status: Strike Ready." },
        { name: "USS Abraham Lincoln (CVN-72) Strike Group", type: "us-naval", lat: 23.55, lon: 59.15, description: "ASSETS: F-35C, F/A-18E/F. Status: Active Patrol - Gulf of Oman." },
        { name: "USS Spruance (DDG-111)", type: "us-naval", lat: 23.40, lon: 58.95, description: "Arleigh Burke-class destroyer. Mission: Strike Group Escort." },
        { name: "USS Stockdale (DDG-106)", type: "us-naval", lat: 23.70, lon: 59.40, description: "Arleigh Burke-class destroyer. Mission: Anti-submarine defense." },
        { name: "USS Delbert D. Black (DDG-119)", type: "us-naval", lat: 19.25, lon: 39.80, description: "Arleigh Burke-class destroyer. Mission: Red Sea Security Ops." },
        { name: "USS Gerald R. Ford (CVN-78) Strike Group", type: "us-naval", lat: 34.25, lon: 24.15, description: "ASSETS: F-35C, F/A-18E/F. Status: Mediterranean Transit." },
        { name: "USS George H.W. Bush (CVN-77)", type: "us-naval", lat: 37.00, lon: -75.00, description: "Nimitz-class carrier. Status: Maintenance/Home Port." },
        { name: "Bandar Abbas (Joint Drills)", type: "ir-pvo", lat: 27.20, lon: 56.37, description: "Main IRGC Naval HQ and missile defense site." },
        { name: "Qeshm Island Drone Base", type: "ir-pvo", lat: 26.72, lon: 55.95, description: "ASSETS: Shahed-136/129 UCAVs. Iranian drone launch site." },
        { name: "Kashan Drone Center", type: "ir-pvo", lat: 33.89, lon: 51.57, description: "Training and testing facility for long-range Iranian drones." },
        { name: "Haji Abad Missile Complex", type: "ir-pvo", lat: 28.04, lon: 55.91, description: "Underground storage for ballistic missile systems." },
        { name: "IRIS Shahid Bagheri (Drone Carrier)", type: "ir-naval", lat: 27.00, lon: 56.10, description: "Converted carrier for long-range drone operations." },
        { name: "Natanz Enrichment Complex", type: "ir-pvo", lat: 33.72, lon: 51.72, description: "Heavily defended strategic nuclear enrichment facility." },
        { name: "Fordow Underground Facility", type: "ir-pvo", lat: 34.88, lon: 50.99, description: "Deeply buried nuclear research and defense site." },
        { name: "Arak Heavy Water Plant", type: "ir-pvo", lat: 34.37, lon: 49.24, description: "Strategic nuclear site with active air defense." },
        { name: "Bushehr Nuclear Plant", type: "ir-pvo", lat: 28.82, lon: 50.88, description: "Nuclear power facility protected by S-300/Tor-M1." },
        { name: "Khorramabad Missile Base", type: "ir-missile", lat: 33.45, lon: 48.35, description: "Launch site for Shahab and Kheibar ballistic missiles." },
        { name: "Tabriz Missile Silos", type: "ir-missile", lat: 38.08, lon: 46.29, description: "Underground silos targeting northern regional sectors." },
        { name: "Kermanshah Missile Site", type: "ir-missile", lat: 34.31, lon: 47.07, description: "Strategic ballistic missile launch facility." },
        { name: "Eagle 44 Underground Base", type: "ir-air", lat: 28.05, lon: 55.51, description: "ASSETS: F-4 Phantom II, Various UCAVs. Hardened airbase." },
        { name: "Anarak Drone Test Range", type: "ir-air", lat: 33.32, lon: 53.70, description: "Operational test range for new loitering munitions." },
        { name: "Semnan Missile Port", type: "ir-missile", lat: 35.23, lon: 53.92, description: "Space and ballistic missile launch facility." },
        { name: "Shahroud Space Center", type: "ir-missile", lat: 36.42, lon: 55.01, description: "ICBM development and satellite launch site." },
        { name: "Al Dhafra Air Base (UAE)", type: "us-air", lat: 24.24, lon: 54.54, description: "ASSETS: F-22 Raptor, E-3 AWACS, RQ-4 Global Hawk." },
        { name: "Prince Sultan Air Base (KSA)", type: "us-air", lat: 24.06, lon: 47.58, description: "ASSETS: 12x F-22 Raptor, 6x E-3 AWACS. Protected by THAAD." },
        { name: "Ali Al Salem Air Base (Kuwait)", type: "us-air", lat: 29.34, lon: 47.52, description: "ASSETS: C-130 Hercules, MQ-9 Reaper units. Logistics Hub." },
        { name: "Camp Arifjan (Kuwait)", type: "us-naval", lat: 28.88, lon: 48.16, description: "Forward logistics command for US forces in Kuwait." },
        { name: "USS McFaul (Hormuz Patrol)", type: "us-naval", lat: 26.50, lon: 56.50, description: "Arleigh Burke-class destroyer. Monitoring Strait of Hormuz." },
        { name: "USS Delbert D. Black (Red Sea)", type: "us-naval", lat: 19.25, lon: 39.80, description: "Destroyer engaged in counter-missile defense." },
        { name: "Souda Bay Base (Crete)", type: "us-naval", lat: 35.48, lon: 24.14, description: "US/NATO naval support facility in the Eastern Med." },
        { name: "Thumrait Air Base (Oman)", type: "us-air", lat: 17.66, lon: 54.02, description: "Strategic Omani base supporting US air operations." },
        { name: "RAF Akrotiri (Cyprus)", type: "us-air", lat: 34.59, lon: 32.98, description: "ASSETS: 12x Typhoon FGR4, 2x Voyager KC3. UK Strike Hub." },
        { name: "UA 3rd Assault Brigade (Avdiivka Sector)", type: "ua-infantry", lat: 48.13, lon: 37.74, description: "Elite Ukrainian mobile assault unit." },
        { name: "UA Defense Line (Kupiansk)", type: "ua-infantry", lat: 49.71, lon: 37.61, description: "Fortified Ukrainian defensive positions." },
        { name: "UA Marine Corps (Krinky Bridgehead)", type: "ua-infantry", lat: 46.73, lon: 33.09, description: "Ukrainian marine operations in the Kherson sector." },
        { name: "Chasiv Yar Fortifications", type: "ua-infantry", lat: 48.58, lon: 37.83, description: "Key high-ground defensive line for Bakhmut sector." },
        { name: "RU 1st Guards Tank Army (Lyman Direction)", type: "ru-infantry", lat: 49.01, lon: 37.99, description: "Major Russian armored offensive formation." },
        { name: "RU Assault Units (Bakhmut Sector)", type: "ru-infantry", lat: 48.59, lon: 38.00, description: "Russian frontline assault groups." },
        { name: "RU 58th Army (Robotyne Front)", type: "ru-infantry", lat: 47.44, lon: 35.83, description: "Russian defensive and counter-attack units." },
        { name: "Donetsk Grouping", type: "ru-infantry", lat: 47.99, lon: 37.67, description: "Concentration of Russian ground forces in Donetsk." },
        { name: "Tower 22 (US Logistics Hub)", type: "us-air", lat: 33.31, lon: 38.70, description: "Critical US support and surveillance site in Jordan." },
        { name: "USS Carney (Destroyer - Red Sea)", type: "us-naval", lat: 15.50, lon: 41.20, description: "Destroyer actively intercepting drones/missiles." },
        { name: "Nevatim Airbase (Israel F-35)", type: "us-air", lat: 31.20, lon: 35.01, description: "ASSETS: F-35I Adir Stealth Fighters. Strategic Strike Base." },
        { name: "Machulishchy Air Base (RU-BY)", type: "ru-air", lat: 53.7741, lon: 27.5776, description: "ASSETS: MiG-31K (Kinzhal carriers), A-50 AWACS." },
        { name: "Baranovichi Air Base (RU-BY)", type: "ru-air", lat: 53.1167, lon: 26.0494, description: "ASSETS: Su-30SM, Su-35S Russian fighter units." },
        { name: "Luninets Air Base", type: "ru-air", lat: 52.2748, lon: 26.7863, description: "ASSETS: Su-25SM Attack Aircraft, S-400 batteries." },
        { name: "Lida Air Base", type: "ru-air", lat: 53.8824, lon: 25.3023, description: "ASSETS: Belarusian Su-25 and Russian tactical UAVs." },
        { name: "Zyabrovka Missile Site", type: "ru-missile", lat: 52.3082, lon: 31.1627, description: "Russian S-400 and Iskander-M missile systems." },
        { name: "Brest Training Ground", type: "ru-infantry", lat: 52.0977, lon: 23.6877, description: "Joint Russian-Belarusian military training facility." },
        { name: "Gomel Logistics Hub", type: "ru-infantry", lat: 52.4345, lon: 30.9754, description: "Military supply and staging area for Russian forces." },
        { name: "Ramstein Air Base (DE)", type: "us-air", lat: 49.437, lon: 7.600, description: "HQ USAFE. ASSETS: 20x C-130J Super Hercules, 15x C-17 Globemaster III. Strategic Logistics Hub." },
        { name: "Aviano Air Base (IT)", type: "us-air", lat: 46.031, lon: 12.596, description: "ASSETS: 31st Fighter Wing, 50x F-16 Fighting Falcons. Nuclear-capable facility. Southern Flank Defense." },
        { name: "Incirlik Air Base (TR)", type: "us-air", lat: 37.001, lon: 35.425, description: "Forward Operating Base. ASSETS: KC-135 Stratotankers, A-10 Thunderbolt II. Strategic Nuclear Storage." },
        { name: "Bezmer Air Base (BG)", type: "nato-air", lat: 42.454, lon: 26.352, description: "Strategic Training Area. ASSETS: Su-25 Frogfoot (Modernized). NATO Forward Deployment Site." },
        { name: "Graf Ignatievo (BG)", type: "nato-air", lat: 42.290, lon: 24.714, description: "Air Policing Command. ASSETS: MiG-29 (Active Duty), F-16 Block 70 Training Center." },
        { name: "Camp Kosciuszko (PL)", type: "us-infantry", lat: 52.406, lon: 16.925, description: "U.S. Army V Corps HQ. ASSETS: M1A2 Abrams Tanks, HIMARS Artillery Systems. Eastern Shield." },
        { name: "Naval Station Rota (ES)", type: "us-naval", lat: 36.617, lon: -6.357, description: "Gateway to Med. ASSETS: 4x Arleigh Burke Destroyers (Aegis), P-8A Poseidon Surveillance." },
        { name: "Ämari Air Base (EE)", type: "nato-air", lat: 59.256, lon: 24.215, description: "Baltic Air Policing. ASSETS: Rotational F-35 Lightning II & Eurofighter Typhoons." },
        { name: "Spangdahlem AB (DE)", type: "us-air", lat: 49.973, lon: 6.692, description: "Electronic Warfare Hub. ASSETS: 52nd Fighter Wing, F-16 Viper, EA-18G Growlers." },
        { name: "Sigonella NAS (IT)", type: "us-air", lat: 37.402, lon: 14.922, description: "Surveillance Hub. ASSETS: RQ-4 Global Hawk Drones, MQ-9 Reaper. Med Sea Intelligence." },
        { name: "Engels-2 Air Base", type: "ru-air", lat: 51.485, lon: 46.215, description: "Strategic Bomber Hub. ASSETS: Tu-160 'White Swan' & Tu-95MS. Primary nuclear triad air component." },
        { name: "Savasleyka Air Base", type: "ru-air", lat: 55.440, lon: 42.310, description: "Kinzhal Carrier Base. ASSETS: MiG-31K interceptors equipped with KH-47M2 hypersonic missiles." },
        { name: "Severomorsk Naval Base", type: "ru-naval", lat: 69.068, lon: 33.416, description: "Northern Fleet HQ. ASSETS: Borei-class SSBNs, Yasen-class submarines. Strategic Arctic Command." },
        { name: "Olenya Air Base", type: "ru-air", lat: 68.151, lon: 33.305, description: "Arctic Strike Base. ASSETS: Tu-22M3 Backfire bombers. Critical for maritime strike operations." },
        { name: "Kozelsk Missile Base", type: "ru-missile", lat: 53.974, lon: 35.752, description: "28th Guards Rocket Division. ASSETS: Silo-based RS-24 Yars ICBMs. Nuclear readiness: ACTIVE." },
        { name: "Kapustin Yar Range", type: "ru-missile", lat: 48.583, lon: 46.254, description: "Strategic Missile Test Site. ASSETS: Iskander-M and S-400 systems development. High-priority zone." },
        { name: "Novosibirsk Rocket Base", type: "ru-missile", lat: 55.195, lon: 82.964, description: "39th Guards Rocket Division. ASSETS: Road-mobile Yars ICBM systems. Strategic Reserve." },
        { name: "Sevastopol Naval Base", type: "ru-naval", lat: 44.616, lon: 33.525, description: "Black Sea Fleet HQ. ASSETS: Kilo-class submarines, Kalibr missile carriers. Logistics & repair hub." },
        { name: "Shaykovka Air Base", type: "ru-air", lat: 54.225, lon: 34.375, description: "Long-Range Aviation. ASSETS: Tu-22M3 Supersonic Bombers. Frequent deployment to Ukraine front." },
        { name: "Tatishchevo Missile Site", type: "ru-missile", lat: 51.666, lon: 45.584, description: "60th Missile Division. ASSETS: Topol-M and UR-100N UTTKh ICBMs. Hardened silo infrastructure." },
        { name: "Belbek Air Base (Crimea)", type: "ru-air", lat: 44.685, lon: 33.575, description: "Forward Interceptor Base. ASSETS: Su-27, Su-30SM, Su-35S. Primary Air Defense for Crimea." },
        { name: "Bakhmut Sector", type: "ua-infantry", lat: 48.594, lon: 38.000, description: "Heavy attrition zone. Deeply fortified Russian and Ukrainian positions. Active artillery duels." },
        { name: "Avdiivka Fortifications", type: "ua-infantry", lat: 48.145, lon: 37.750, description: "Key industrial defense hub. Continuous assault operations and heavy drone surveillance area." },
        { name: "Kupiansk Axis", type: "ua-infantry", lat: 49.711, lon: 37.611, description: "Northern front stabilizer. Strategic rail hub. High concentration of armored units." },
        { name: "Robotyne Breach", type: "ua-infantry", lat: 47.445, lon: 35.836, description: "Southern offensive sector. Dense minefields (Surovikin Line) and trench warfare." },
        { name: "Starokostiantyniv AB", type: "ua-air", lat: 49.747, lon: 27.268, description: "7th Tactical Aviation Brigade. ASSETS: Su-24M equipped with Storm Shadow / SCALP-EG missiles." },
        { name: "Mirgorod Air Base", type: "ua-air", lat: 49.931, lon: 33.641, description: "ASSETS: Su-27 Flankers. Primary air defense and interceptor hub for Central Ukraine." },
        { name: "Krynky Bridgehead", type: "ua-infantry", lat: 46.733, lon: 33.095, description: "Amphibious operations zone. High intensity electronic warfare (EW) and FPV drone activity." },
        { name: "Odessa Port Defense", type: "ua-naval", lat: 46.485, lon: 30.743, description: "Maritime Security Zone. ASSETS: Harpoon & Neptune ASM batteries. Protection of grain corridor." },
        { name: "Zaporizhzhia NPP", type: "incidents", lat: 47.511, lon: 34.585, description: "CRITICAL: Largest nuclear plant in Europe. Under occupation. High risk of sabotage or incident." },
        { name: "Chornobaivka Airfield", type: "ua-air", lat: 46.675, lon: 32.506, description: "Logistics and rotary wing base. Critical for controlling the Southern Kherson direction." },
        { name: "Hostomel (Antonov) Site", type: "ua-air", lat: 50.588, lon: 30.211, description: "Strategic airfield. Symbols of early resistance. Current logistics and repair hub." },
        { name: "Longtian Airbase (CN)", type: "ru-air", lat: 25.544, lon: 119.462, description: "Forward Strike Base. ASSETS: Massive deployment of J-11 and J-16 fighters. S-400 SAM coverage." },
        { name: "Hui'an Airbase (CN)", type: "ru-air", lat: 25.023, lon: 118.812, description: "Electronic Warfare Hub. ASSETS: Y-8/Y-9 EW aircraft, UAV swarms. Primary staging area for Taiwan sorties." },
        { name: "Zhangzhou Naval Base (CN)", type: "ru-naval", lat: 24.551, lon: 117.892, description: "Amphibious Assault Force. ASSETS: Type 075 Landing Docks, Type 071 Transports. Invasion Fleet HQ." },
        { name: "Sanya Naval Base (Hainan)", type: "ru-naval", lat: 18.216, lon: 109.525, description: "South China Sea HQ. ASSETS: Aircraft Carrier 'Shandong', Type 094 Nuclear Submarines (SSBN)." },
        { name: "Taipei Defense Zone (TW)", type: "ua-infantry", lat: 25.033, lon: 121.565, description: "Command & Control. ASSETS: Patriot PAC-3 Batteries, Tien Kung III SAM. Heavily fortified urban area." },
        { name: "Hualien Air Base (TW)", type: "ua-air", lat: 24.023, lon: 121.618, description: "Underground Hangar Complex. ASSETS: F-16V Viper (Block 70). Critical for eastern flank survival." },
        { name: "Kaohsiung Naval Port (TW)", type: "ua-naval", lat: 22.616, lon: 120.266, description: "Strategic Naval Base. ASSETS: Kee Lung-class Destroyers, Indigenous Defense Submarines (IDS)." },
        { name: "Kinmen Island Post (TW)", type: "ua-infantry", lat: 24.448, lon: 118.375, description: "Frontline Observation. ASSETS: Coastal Artillery, Anti-ship Missile Batteries. 24/7 Surveillance." },
        { name: "Pescadores Islands (TW)", type: "ua-missile", lat: 23.571, lon: 119.579, description: "Missile Shield. ASSETS: Hsiung Feng III Supersonic Anti-ship Missiles. Control over Taiwan Strait." },
        { name: "Liancheng Airbase (CN)", type: "ru-missile", lat: 25.676, lon: 116.755, description: "Rocket Force Base. ASSETS: DF-15 & DF-16 Short-range Ballistic Missiles. Targeted at Taiwan defense." },
        { name: "Okinawa (Kadena AB - US)", type: "us-air", lat: 26.355, lon: 127.767, description: "US Forward Hub. ASSETS: F-15EX Eagle II, F-22 Raptors. Strategic 'Keystone of the Pacific'." },
        { name: "Khmeimim Air Base (RU)", type: "ru-air", lat: 35.412, lon: 35.947, description: "Main Russian Air Hub in Syria. ASSETS: Su-35S, Su-34 bombers, S-400 Triumf SAM systems. Strategic power projection." },
        { name: "Tartus Naval Base (RU)", type: "ru-naval", lat: 34.912, lon: 35.867, description: "Russian Mediterranean Logistics Center. ASSETS: Kilo-class submarines, surface combatants. Only RU naval base outside CIS." },
        { name: "Al-Tanf Garrison (US)", type: "us-infantry", lat: 33.321, lon: 38.941, description: "Strategic US Outpost near Jordan/Iraq border. Task: Counter-ISIS operations and monitoring Iranian land bridge." },
        { name: "Mission Support Site Conoco (US)", type: "us-infantry", lat: 35.328, lon: 40.291, description: "US presence near Deir ez-Zor. ASSETS: Bradley IFVs, Avenger Air Defense. Frequent target of drone/rocket attacks." },
        { name: "Tiyas (T-4) Airbase (SY/IR)", type: "ru-air", lat: 34.521, lon: 37.625, description: "Major SyAAF & IRGC base. ASSETS: Iranian UAVs (Shahed series), SyAAF MiG-25/Su-22. Frequent target of ISR air strikes." },
        { name: "Aleppo Defense Zone (SDF/YPG)", type: "ua-infantry", lat: 36.202, lon: 37.158, description: "Kurdish-led SDF positions. Key frontline against Turkish-backed forces. Heavy urban fortification." },
        { name: "Idlib De-escalation Zone", type: "incidents", lat: 35.931, lon: 36.633, description: "Last rebel stronghold. High concentration of Turkish observation posts (Tafas). Active artillery sector." },
        { name: "Incirlik Operational Sector (TR)", type: "ru-infantry", lat: 36.651, lon: 37.011, description: "Turkish Cross-border Force. ASSETS: Leopard 2A4 Tanks, T-155 Firtina Artillery. Monitoring Kurdish border movements." },
        { name: "Qamishli Airfield (RU/SY)", type: "ru-air", lat: 37.022, lon: 41.193, description: "Shared RU/SY presence in Kurdish territory. ASSETS: Mi-8/Mi-24 helicopters. Strategic monitoring of Eastern Syria." },
        { name: "Damascus Int. (Military Wing)", type: "ru-air", lat: 33.411, lon: 36.515, description: "Logistics Hub for IRGC/Hezbollah. Significant air defense presence (Pantsir-S1, BUK-M2)." },
        { name: "Al-Nairab Airbase", type: "ru-air", lat: 36.181, lon: 37.225, description: "Major Syrian strike base. ASSETS: L-39 Albatros, Mi-24 Hind. Support for Northern Front operations." },
        { name: "Al-Asad Airbase (US/IQ)", type: "us-air", lat: 33.784, lon: 42.441, description: "Major coalition hub. ASSETS: MQ-9 Reapers, C-17 Transports. Equipped with Patriot PAC-3 & C-RAM defense systems." },
        { name: "Harir Airbase (US/Kurdish)", type: "us-air", lat: 36.531, lon: 44.352, description: "Northern support site in Erbil. Strategic monitoring of Iran-Iraq border. High alert for drone incursions." },
        { name: "Camp Victory (Baghdad Intl)", type: "us-infantry", lat: 33.262, lon: 44.234, description: "Joint Operations Center. ASSETS: Diplomatic Support Center defense units. Primary target for local militia rockets." },
        { name: "Jurf al-Sakhar (PMF)", type: "ru-infantry", lat: 32.879, lon: 44.175, description: "Kata'ib Hezbollah stronghold. Major training & storage site for Iranian-made drones and short-range rockets." },
        { name: "Abu Kamal-Qaim Crossing", type: "incidents", lat: 34.425, lon: 40.925, description: "Critical 'Land Bridge' between Iraq/Syria. High IRGC activity. Frequent zone for coalition interdiction strikes." },
        { name: "Balad Airbase", type: "ru-air", lat: 33.945, lon: 44.354, description: "Iraqi Air Force HQ. ASSETS: F-16IQ Block 52. Frequently guarded by local air defense units." },
        { name: "Erbil Intl Airport (Military)", type: "us-air", lat: 36.237, lon: 43.957, description: "Coalition logistics and medevac hub. Defended by C-RAM and Avenger mobile air defense systems." },
        { name: "Al-Muqdadiya (Diyala)", type: "ru-infantry", lat: 33.978, lon: 44.936, description: "Badr Organization Sector. Strategic depth for Iranian pro-government forces monitoring the eastern corridor." },
        { name: "Kirkuk Airfield (K-1)", type: "us-infantry", lat: 35.511, lon: 44.254, description: "Forward Operating Base. Surveillance of northern oil fields. Multi-factional security presence." },
        { name: "Taji Military Complex", type: "ru-infantry", lat: 33.518, lon: 44.275, description: "Main Iraqi logistics & training base. ASSETS: Mi-17 and Bell 407 helicopter squadrons." },
        { name: "Ain al-Assad (Radar Site)", type: "us-missile", lat: 33.802, lon: 42.395, description: "AN/MPQ-64 Sentinel Radar positions. Early warning system for incoming ballistic threats from the East." }
    ];
// --- СЕКЦИЯ: ВРЕДНИ ЗОНИ (ОБХВАТ НА УДАР) ---
strategicAssets.forEach(asset => {
    // Проверяваме за ирански ядрени и ракетни обекти
    if (asset.type === 'ir-pvo' || asset.type === 'ir-missile' || asset.type === 'ir-air') {
        L.circle([asset.lat, asset.lon], {
            color: '#ff4444',      // Червен контур
            fillColor: '#ff4444',  // Червено запълване
            fillOpacity: 0.1,     // Много прозрачно, за да не пречи
            radius: 80000          // 80 км обхват (можеш да го промениш)
        }).addTo(map);
    }
});
    // --- СЕКЦИЯ 4: РАЗШИРЕН CSS СТИЛ (UI ОПТИМИЗАЦИЯ) ---
    const customStyles = document.createElement("style");
    customStyles.innerText = `
        .leaflet-marker-icon { background: none !important; border: none !important; }
        .mil-icon-box { display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fff; box-shadow: 0 0 8px #000; transition: 0.3s; }
        .icon-us-nato { background: rgba(57, 255, 20, 0.45); border-color: #39FF14; }
        .icon-iran-tension { background: rgba(255, 140, 0, 0.45); border-color: #ff8c00; }
        .icon-ru-ua { background: rgba(255, 0, 0, 0.45); border-color: #ff3131; }
        
        /* ПУЛСИРАЩА АНИМАЦИЯ ЗА НОВИНИ */
        .alert-pulse { animation: alert-anim 2s infinite alternate; cursor: pointer; filter: drop-shadow(0 0 15px #ff3131); }
        @keyframes alert-anim { from { transform: scale(1); opacity: 1; } to { transform: scale(1.35); opacity: 0.5; } }
        
        /* ТАКТИЧЕСКИ МОДАЛЕН ПРОЗОРЕЦ - 650PX */
        .expanded-intel-panel {
            position: fixed !important; top: 50% !important; left: 50% !important;
            transform: translate(-50%, -50%) !important; width: 650px !important;
            min-height: 480px !important; z-index: 100000 !important;
            background: rgba(8, 8, 8, 0.98) !important; border: 2px solid #39FF14 !important;
            box-shadow: 0 0 150px #000; padding: 0 !important; display: flex; flex-direction: column;
            font-family: 'Courier New', monospace;
        }
        .intel-list-item { border-left: 3px solid #39FF14; padding: 12px; margin-bottom: 8px; cursor: pointer; background: rgba(255,255,255,0.03); transition: 0.2s; }
        .intel-list-item:hover { background: rgba(57, 255, 20, 0.1); }
        .close-sys-btn { cursor: pointer; color: #ff3131; border: 1px solid #ff3131; padding: 4px 12px; font-weight: bold; font-size: 14px; }
    `;
    document.head.appendChild(customStyles);

    // --- СЕКЦИЯ 5: ГЕНЕРИРАНЕ НА ТАКТИЧЕСКИ ИКОНИ ---
    function createAssetIcon(type) {
        let symbol = '⚪'; 
        let styleClass = 'mil-icon-box ';

        if (type === 'ua-infantry') {
            symbol = '⚔';
            styleClass += 'icon-us-nato';
        } else if (type === 'ru-infantry') {
            symbol = '⚔';
            styleClass += 'icon-ru-ua';
        } else if (type === 'ir-nuclear') {
            symbol = '☢️';
            styleClass += 'icon-iran-tension';
        } else if (type === 'ir-missile') {
            symbol = '🚀';
            styleClass += 'icon-iran-tension';
        } else if (type.includes('naval')) {
            symbol = '⚓';
            styleClass += (type.startsWith('us-')) ? 'icon-us-nato' : 'icon-ru-ua';
        } else if (type.includes('air')) {
            symbol = '🦅';
            styleClass += (type.startsWith('us-')) ? 'icon-us-nato' : 'icon-iran-tension';
        }

        return L.divIcon({
            html: `<div class="${styleClass}" style="font-size:18px; display:flex; align-items:center; justify-content:center;">${symbol}</div>`,
            iconSize: [32, 32]
        });
    }

   strategicAssets.forEach(asset => {
    const assetMarker = L.marker([asset.lat, asset.lon], { icon: createAssetIcon(asset.type) })
        .addTo(militaryLayer)
        .bindTooltip(asset.name);

    // ТОВА Е НОВИЯТ РЕД, КОЙТО ТИ ТРЯБВА:
    assetMarker.bindPopup(`
        <div style="background:#000; color:#fff; padding:10px; border:1px solid #39FF14; font-family:monospace;">
            <strong style="color:#39FF14; font-size:14px;">${asset.name}</strong><br>
            <hr style="border:0; border-top:1px solid #333; margin:5px 0;">
            <span style="font-size:12px; color:#ccc;">${asset.description || "No assets listed"}</span>
        </div>
    `);
});

    // --- СЕКЦИЯ 6: МОДАЛЕН ДИСПЛЕЙ ---
    const showIntelDetails = (data) => {
        const container = document.getElementById('intel-details-container');
        const content = document.getElementById('news-content');
        if (!container || !content) return;

        container.classList.add('expanded-intel-panel');
        content.innerHTML = `
            <div style="background:#111; padding:15px; border-bottom:1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#39FF14; font-weight:bold; letter-spacing:1px;">>> ENCRYPTED DATA FEED</span>
                <span id="close-report" class="close-sys-btn">CLOSE [X]</span>
            </div>
            <div style="padding:35px; color:white; overflow-y:auto;">
                <h1 style="color:#39FF14; font-size:30px; margin-top:0; border-bottom:1px solid #222; padding-bottom:10px;">${data.title.toUpperCase()}</h1>
                <p style="font-size:19px; line-height:1.6; color:#ccc; margin-bottom:25px;">${data.description || "Intelligence stream is active..."}</p>
                <div style="background:rgba(255,50,50,0.1); padding:20px; border-left:5px solid #ff3131; font-size:17px; margin:25px 0;">
                    <strong style="color:#ff3131;">STATUS:</strong> CRITICAL ALERT<br>
                    <strong>SECTOR:</strong> ${data.country || "Global Operations"}<br>
                    <strong>COORDINATES:</strong> ${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}
                </div>
                <div style="margin-top:30px; text-align:center;">
                    <a href="${data.link || "#"}" target="_blank" style="display:inline-block; background:#39FF14; color:#000; padding:15px 40px; text-decoration:none; font-weight:bold; font-size:18px;">ACCESS LIVE SOURCE</a>
                </div>
            </div>`;
        
        document.getElementById('close-report').onclick = () => container.classList.remove('expanded-intel-panel');
        map.flyTo([data.lat, data.lon], 7);
    };

    // --- СЕКЦИЯ 7: СИНХРОНИЗАЦИЯ И ТАКТИЧЕСКИ ДАННИ ---
    function syncTacticalData() {
        console.log("System: Scanning global sectors...");
        fetch('conflicts.json?v=' + Date.now())
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) return;
                markersLayer.clearLayers();
                const sidebar = document.getElementById('intel-list');
                if (sidebar) sidebar.innerHTML = '';

                if (data.length > 0 && data[0].title !== globalLastEventTitle) {
                    playTacticalPing();
                    globalLastEventTitle = data[0].title;
                }

                data.forEach(item => {
                    let iconSymbol = '⚠️'; 
                    if (item.type === "Nuclear" || item.type === "Airstrike") iconSymbol = '🚀';
                    else if (item.type === "Drone") iconSymbol = '🛸';
                    else if (item.type === "Evacuation") iconSymbol = '🚨';
                    else if (item.type === "Clashes") iconSymbol = '⚔️';

                    let severityLabel = item.severity || (item.critical ? 'critical' : 'normal');
                    let statusFilter = (severityLabel === 'critical') ? "drop-shadow(0 0 12px #ff3131)" : 
                                      (severityLabel === 'middle') ? "drop-shadow(0 0 10px #ff8c00) sepia(1)" : 
                                      "drop-shadow(0 0 5px #00a2ff)";
                    
                    let titleColor = (severityLabel === 'critical') ? '#ff3131' : 
                                    (severityLabel === 'middle') ? '#ff8c00' : '#39FF14';

                    const latJitter = (Math.random() - 0.5) * 0.018; 
                    const lonJitter = (Math.random() - 0.5) * 0.018;

                    const marker = L.marker([parseFloat(item.lat) + latJitter, parseFloat(item.lon) + lonJitter], { 
                        icon: L.divIcon({ 
                            html: `<div class="alert-pulse tactical-marker" style="font-size:38px; filter: ${statusFilter};">${iconSymbol}</div>`, 
                            iconSize: [45, 45] 
                        }) 
                    }).addTo(markersLayer);

                    marker.tacticalInfo = { title: item.title.toLowerCase(), type: item.type.toLowerCase() };
                    marker.on('click', () => showIntelDetails(item));

                    if (sidebar) {
                        const entry = document.createElement('div');
                        entry.className = 'intel-list-item';
                        entry.setAttribute('data-search-key', item.title.toLowerCase() + " " + item.type.toLowerCase());
                        entry.innerHTML = `
                            <div style="border-left: 3px solid ${titleColor}; padding-left: 8px; margin-bottom: 5px;">
                                <small style="color:#666;">[ID: ${Math.floor(Math.random() * 9000) + 1000}] - ${item.date}</small><br>
                                <strong style="color:${titleColor}; text-transform: uppercase;">${item.title}</strong>
                            </div>`;
                        entry.onclick = () => showIntelDetails(item);
                        sidebar.appendChild(entry);
                    }
                });
            }).catch(err => console.error("Sync Error:", err));
    }

    // --- ЛОГИКА НА ТЪРСАЧКАТА ---
    const searchBar = document.getElementById('tactical-search');
    if (searchBar) {
        searchBar.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.intel-list-item').forEach(el => {
                const content = el.getAttribute('data-search-key') || "";
                el.style.display = content.includes(query) ? 'block' : 'none';
            });
            markersLayer.eachLayer(layer => {
                if (layer instanceof L.Marker && layer.tacticalInfo) {
                    const isMatch = layer.tacticalInfo.title.includes(query) || layer.tacticalInfo.type.includes(query);
                    if (isMatch) { if (!map.hasLayer(layer)) layer.addTo(map); } 
                    else { map.removeLayer(layer); }
                }
            });
        });
    }

    // --- ЧАСОВНИК И СТАТИСТИКА ---
    setInterval(() => {
        const timeDisplay = document.getElementById('header-time');
        if (timeDisplay) timeDisplay.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
    }, 1000);

    let lastCount = 0; 
    function updateDashboardStats() {
        fetch('conflicts.json?v=' + Date.now()).then(res => res.json()).then(data => {
            const count = data.length;
            if (count > lastCount && lastCount !== 0) playTacticalPing();
            lastCount = count; 
            const eventCounter = document.getElementById('active-events');
            if (eventCounter) eventCounter.innerText = count;
        });
    }

// --- СЕКЦИЯ 8: ФИНАЛНА ЛОГИКА НА ТЪРСАЧКАТА (UNIVERSAL FIX) ---
    const tacticalInput = document.getElementById('tactical-search');
    
    if (tacticalInput) {
        tacticalInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase().trim();
            console.log("Searching for: " + query); // Дебъг конзола

            // 1. Филтриране на списъка в страничния панел
            const listItems = document.querySelectorAll('.intel-list-item');
            listItems.forEach(el => {
                // Проверява всички възможни атрибути, които може да си ползвал нагоре
                const content = (
                    el.getAttribute('data-search') || 
                    el.getAttribute('data-search-key') || 
                    el.innerText
                ).toLowerCase();
                
                el.style.display = content.includes(query) ? 'block' : 'none';
            });

            // 2. Филтриране на маркерите върху самата карта
            markersLayer.eachLayer(layer => {
                // Вземаме информацията от маркера, независимо как е кръстена
                const searchData = (
                    layer.tacticalSearchKey || 
                    (layer.tacticalInfo ? (layer.tacticalInfo.title + " " + layer.tacticalInfo.type) : "") ||
                    ""
                ).toLowerCase();

                if (searchData.includes(query)) {
                    if (!map.hasLayer(layer)) map.addLayer(layer);
                } else {
                    map.removeLayer(layer);
                }
            });
        });
    }

    // --- СЕКЦИЯ 9: СТАРТИРАНЕ НА СИСТЕМИТЕ ---
    // ВАЖНО: Тук само викаме функциите, които вече си дефинирал нагоре
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
    if (typeof syncTacticalData === 'function') syncTacticalData();

    // Автоматично опресняване на всеки 30 секунди
    setInterval(() => {
        if (typeof updateDashboardStats === 'function') updateDashboardStats();
        if (typeof syncTacticalData === 'function') syncTacticalData();
    }, 30000);

    // Системен часовник
    setInterval(() => {
        const timeDisplay = document.getElementById('header-time');
        if (timeDisplay) {
            timeDisplay.innerText = new Date().toUTCString().split(' ')[4] + " UTC";
        }
    }, 1000);

    console.log(">> Tactical Search System: Operational");

}; // КРАЙ НА WINDOW.ONLOAD
// Функция за автоматично засичане на локацията по IP
async function detectUserLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_name) {
            // Обновява текста в горната лента
            document.getElementById('user-location').innerText = data.country_name.toUpperCase();
            console.log("Operator Location Identified: " + data.country_name);
        }
    } catch (error) {
        console.log("Location detection failed. Defaulting to BULGARIA.");
        document.getElementById('user-location').innerText = "BULGARIA";
    }
}

// Стартиране на функцията
detectUserLocation();
