window.onload = function() {
    // 1. ИНИЦИАЛИЗИРАНЕ НА КАРТАТА
    // Настройваме изгледа да обхваща по-голяма част от конфликтните зони
    var map = L.map('map', {
        worldCopyJump: true,
        minZoom: 2
    }).setView([35.0, 30.0], 4); 

    // ОСНОВЕН СЛОЙ: Тъмен фон (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);

    // СЛОЙ ЗА ЕТИКЕТИ: Държави и градове (с малко по-висока видимост)
    var labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        opacity: 0.6,
        pane: 'shadowPane'
    }).addTo(map);

    // ДЕФИНИРАНЕ НА ВОЕННИ ИКОНКИ (Custom Icons)
    // Използваме висококачествени иконки за по-професионален вид
    const iconClash = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3532/3532247.png',
        iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16]
    });
    const iconShip = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893603.png',
        iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18]
    });
    const iconExplosion = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/595/595067.png',
        iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16]
    });
    const iconAlert = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/179/179386.png',
        iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14]
    });

    // Функция за определяне на иконката според типа събитие
    function getTacticalIcon(type) {
        if (type === 'Armed clash') return iconClash;
        if (type === 'Warship' || type === 'Carrier') return iconShip;
        if (type === 'Explosion' || type === 'Airstrike') return iconExplosion;
        return iconAlert;
    }

    // 2. ЗЕЛЕНИ ГРАНИЦИ НА ДЪРЖАВИТЕ (С интерактивен ефект)
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJson(geojsonData, {
                style: {
                    color: '#00ff00',
                    weight: 1,
                    opacity: 0.2,
                    fillOpacity: 0
                },
                onEachFeature: function(feature, layer) {
                    layer.on('mouseover', function() {
                        this.setStyle({ color: '#00ff00', opacity: 0.7, weight: 2 });
                    });
                    layer.on('mouseout', function() {
                        this.setStyle({ color: '#00ff00', opacity: 0.2, weight: 1 });
                    });
                }
            }).addTo(map);
        });

    // --- СЕКЦИЯ: ТАКТИЧЕСКИ ЕЛЕМЕНТИ (Украйна) ---
    
    // Линия на фронта
    var frontLinePoints = [
        [46.5, 32.3], [46.8, 33.5], [47.5, 35.3], [48.0, 37.6], 
        [48.6, 38.0], [49.5, 38.0], [50.1, 37.8]
    ];
    L.polyline(frontLinePoints, {
        color: '#ff0000',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 15',
        lineJoin: 'round'
    }).addTo(map).bindTooltip("АКТИВНА БОЙНА ЛИНИЯ");

    // Зона на окупация
    var occupationArea = [
        [46.0, 33.0], [46.8, 34.5], [47.2, 37.8], [48.5, 39.5], 
        [50.0, 38.5], [50.0, 40.0], [44.0, 40.0], [44.0, 33.0]
    ];
    L.polygon(occupationArea, {
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.12,
        weight: 1
    }).addTo(map);

    // 3. ЗАРЕЖДАНЕ НА ДАННИТЕ ЗА КОНФЛИКТИТЕ
    fetch('conflicts.json')
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) return;

            let totalFatalities = 0;
            let affectedCountries = new Set();

            data.forEach(point => {
                // Създаваме маркер с тактическа иконка
                let marker = L.marker([point.lat, point.lon], {
                    icon: getTacticalIcon(point.type)
                }).addTo(map);

                // Добавяме кратко инфо при задържане на мишката
                marker.bindTooltip(`<b>${point.country}</b><br>${point.type}`);

                // Събитие при клик за обновяване на новинарския панел
                marker.on('click', function() {
                    // Плавно приближаване към мястото
                    map.setView([point.lat, point.lon], 6, { animate: true });

                    // Подготовка на HTML за жертвите
                    let fatalitiesText = (point.fatalities && point.fatalities > 0) 
                        ? `<p style="font-size: 16px; color: #ff4d4d;">💀 <strong>Жертви:</strong> ${point.fatalities}</p>` 
                        : "";

                    // Пълнене на страничния панел
                    document.getElementById('news-content').innerHTML = `
                        <div style="border-bottom: 2px solid #444; padding-bottom: 12px; margin-bottom: 15px;">
                            <h2 style="color: #ff4d4d; margin: 0; font-size: 24px;">${point.country}</h2>
                            <small style="color: #aaa; text-transform: uppercase;">${point.date} | ${point.type}</small>
                        </div>
                        <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; border-left: 4px solid #ff4d4d;">
                            <p style="color: #ffffff; margin: 0; font-size: 16px; line-height: 1.6;">${point.title}</p>
                        </div>
                        <div style="margin-top: 25px;">
                            ${fatalitiesText}
                            <a href="${point.link}" target="_blank" class="news-btn" style="text-decoration: none; display: block; text-align: center;">ПРОЧЕТИ ПЪЛНАТА НОВИНА</a>
                        </div>
                    `;
                });

                // Броячи за статистиката
                totalFatalities += (parseInt(point.fatalities) || 0);
                if (point.country) affectedCountries.add(point.country);
            });

            // ОБНОВЯВАНЕ НА ИНФОРМАЦИОННОТО ТАБЛО (Dashboard)
            document.getElementById('active-events').innerText = `Active events: ${data.length}`;
            document.getElementById('total-fatalities').innerText = `Total fatalities: ${totalFatalities}`;
            document.getElementById('countries-affected').innerText = `Countries affected: ${affectedCountries.size}`;
            document.getElementById('last-update').innerText = `Last update: ${new Date().toLocaleDateString()} г.`;
        })
        .catch(error => {
            console.error("Критична грешка при зареждане:", error);
            document.getElementById('news-content').innerHTML = "<p style='color:red;'>Грешка в базата данни! Провери conflicts.json.</p>";
        });

    // Малка закъснение за правилно рендиране на картата
    setTimeout(function() {
        map.invalidateSize();
    }, 600);
};
