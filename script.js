window.onload = function() {

    // --- 1. ИНИЦИАЛИЗИРАНЕ ---
    var map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2
    }).setView([35.0, 30.0], 4); 

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        opacity: 0.6,
        pane: 'shadowPane'
    }).addTo(map);

    // --- 2. ДЕФИНИРАНЕ НА ПРОФЕСИОНАЛНИ SVG ИКОНИ ---
    // Тези икони са вградени директно и изглеждат като истински военни символи
    
    // Икона за Битка (Кръстосани мечове/автомати в червено)
    const svgClash = `<svg viewBox="0 0 24 24" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.5 3L13.5 9L15 10.5L21 4.5L19.5 3M4.5 3L3 4.5L9 10.5L10.5 9L4.5 3M3 19.5L4.5 21L12 13.5L19.5 21L21 19.5L13.5 12L21 4.5L19.5 3L12 10.5L4.5 3L3 4.5L10.5 12L3 19.5Z" fill="#ff4d4d" stroke="white" stroke-width="0.5"/>
    </svg>`;

    // Икона за Кораб (Военен силует в синьо)
    const svgShip = `<svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path d="M4,15L3,18H21L20,15H4M2,19V21H22V19H2M5,14L10,4V14H5M11,14V2H13V14H11M14,14V7L19,14H14Z" fill="#5dade2" stroke="white" stroke-width="0.5"/>
    </svg>`;

    // Икона за Въздушен удар (Експлозия в оранжево)
    const svgExplosion = `<svg viewBox="0 0 24 24" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,2L15.09,8.26L22,9.27L17,14.14L18.18,21.02L12,17.77L5.82,21.02L7,14.14L2,9.27L8.91,8.26L12,2Z" fill="#f39c12" stroke="white" stroke-width="1"/>
    </svg>`;

    // Икона за Новини (Удивителна в жълто)
    const svgAlert = `<svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
        <path d="M12,2L1,21H23L12,2M12,6L19.53,19H4.47L12,6M11,10V14H13V10H11M11,16V18H13V16H11Z" fill="#f1c40f"/>
    </svg>`;

    // Създаване на Leaflet иконите от SVG текстовете
    const iconClash = L.divIcon({ html: svgClash, className: '', iconSize: [30, 30], iconAnchor: [15, 15] });
    const iconShip = L.divIcon({ html: svgShip, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
    const iconExplosion = L.divIcon({ html: svgExplosion, className: '', iconSize: [30, 30], iconAnchor: [15, 15] });
    const iconAlert = L.divIcon({ html: svgAlert, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });

    // --- 3. ЛОГИКА ---
    function getTacticalIcon(type) {
        if (type === 'Carrier' || type === 'Warship') return iconShip;
        if (type === 'Armed clash') return iconClash;
        if (type === 'Explosion' || type === 'Airstrike') return iconExplosion;
        return iconAlert;
    }

    // --- 4. ГРАНИЦИ (ЗЕЛЕНИ) ---
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(res => res.json())
        .then(data => {
            L.geoJson(data, {
                style: { color: '#00ff00', weight: 1, opacity: 0.2, fillOpacity: 0 },
                onEachFeature: function(f, l) {
                    l.on('mouseover', function() { this.setStyle({ opacity: 0.7, weight: 2 }); });
                    l.on('mouseout', function() { this.setStyle({ opacity: 0.2, weight: 1 }); });
                }
            }).addTo(map);
        });

    // --- 5. УКРАЙНА ТАКТИКА ---
    var fLine = [[46.5, 32.3], [46.8, 33.5], [47.5, 35.3], [48.0, 37.6], [48.6, 38.0], [49.5, 38.0], [50.1, 37.8]];
    L.polyline(fLine, { color: '#ff0000', weight: 4, opacity: 0.8, dashArray: '10, 15' }).addTo(map);

    var oZone = [[46.0, 33.0], [46.8, 34.5], [47.2, 37.8], [48.5, 39.5], [50.0, 38.5], [50.0, 40.0], [44.0, 40.0], [44.0, 33.0]];
    L.polygon(oZone, { color: '#ff0000', fillColor: '#ff0000', fillOpacity: 0.12, weight: 1 }).addTo(map);

    // --- 6. JSON ДАННИ ---
    fetch('conflicts.json')
        .then(res => res.json())
        .then(data => {
            let deaths = 0;
            let countries = new Set();
            data.forEach(p => {
                let marker = L.marker([p.lat, p.lon], { icon: getTacticalIcon(p.type) }).addTo(map);
                marker.on('click', function() {
                    map.setView([p.lat, p.lon], 6, { animate: true });
                    let fHTML = (p.fatalities > 0) ? `<p style="color:#ff4d4d; font-size:18px;">💀 Жертви: ${p.fatalities}</p>` : "";
                    document.getElementById('news-content').innerHTML = `
                        <div style="border-bottom: 2px solid #444; padding-bottom: 10px; margin-bottom: 15px;">
                            <h2 style="color: #ff4d4d; margin: 0;">${p.country}</h2>
                            <small style="color: #aaa;">${p.date} | ${p.type}</small>
                        </div>
                        <div style="background: #111; padding: 15px; border-radius: 8px; border-left: 5px solid #ff4d4d;">
                            <p style="color: #fff;">${p.title}</p>
                        </div>
                        <div style="margin-top: 20px;">
                            ${fHTML}
                            <a href="${p.link}" target="_blank" class="news-btn" style="display:block; text-align:center; text-decoration:none;">ДЕТАЙЛИ</a>
                        </div>`;
                });
                deaths += (parseInt(p.fatalities) || 0);
                countries.add(p.country);
            });
            document.getElementById('active-events').innerText = "Active events: " + data.length;
            document.getElementById('total-fatalities').innerText = "Total fatalities: " + deaths;
            document.getElementById('countries-affected').innerText = "Countries affected: " + countries.size;
            document.getElementById('last-update').innerText = "Last update: " + new Date().toLocaleDateString();
        });

    setTimeout(() => { map.invalidateSize(); }, 600);
};
