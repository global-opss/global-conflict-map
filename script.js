window.onload = function() {

    // --- 1. ИНИЦИАЛИЗИРАНЕ НА КАРТАТА ---
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


    // --- 2. ДЕФИНИРАНЕ НА HTML ИКОНИ (БЕЗ ВЪНШНИ ФАЙЛОВЕ) ---
    // Използваме директен HTML/SVG, за да избегнем "везните" и "книгите"
    
    const iconClash = L.divIcon({
        html: '<div style="font-size: 24px;">⚔️</div>',
        className: 'custom-div-icon',
        iconSize: [30, 30], iconAnchor: [15, 15]
    });

    const iconShip = L.divIcon({
        html: '<div style="font-size: 26px;">🚢</div>',
        className: 'custom-div-icon',
        iconSize: [30, 30], iconAnchor: [15, 15]
    });

    const iconExplosion = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/595/595067.png', // Оставяме този линк за проба
        iconSize: [32, 32], iconAnchor: [16, 16]
    });

    const iconAlert = L.divIcon({
        html: '<div style="font-size: 22px;">⚠️</div>',
        className: 'custom-div-icon',
        iconSize: [30, 30], iconAnchor: [15, 15]
    });


    // --- 3. ЛОГИКА ЗА ИКОНИТЕ (Carrier Fix) ---
    function getTacticalIcon(type) {
        // Синхронизирано с твоя JSON: "Carrier"
        if (type === 'Carrier' || type === 'Warship') {
            return iconShip;
        }
        if (type === 'Armed clash') {
            return iconClash;
        }
        if (type === 'Explosion' || type === 'Airstrike') {
            return iconExplosion;
        }
        return iconAlert;
    }


    // --- 4. ГРАНИЦИ ---
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


    // --- 6. ДАННИ ОТ JSON ---
    fetch('conflicts.json')
        .then(res => res.json())
        .then(data => {
            let deaths = 0;
            let countries = new Set();

            data.forEach(p => {
                let marker = L.marker([p.lat, p.lon], { 
                    icon: getTacticalIcon(p.type) 
                }).addTo(map);
                
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
