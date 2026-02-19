// 1. Инициализираме картата с новите настройки
var map = L.map('map', {
    worldCopyJump: true, 
    minZoom: 2,
    maxBounds: [[-90, -180], [90, 180]]
}).setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 2. Функция за цветовете
function getColor(type) {
    return type === 'Explosion' ? '#f03' :
           type === 'Airstrike' ? '#ff7800' :
           type === 'Armed clash' ? '#7a0177' :
                                    '#3388ff';
}

// 3. Зареждане на данни и обновяване на броячите
fetch('conflicts.json')
    .then(response => response.json())
    .then(data => {
        let totalFatalities = 0;
        let countries = new Set();

        data.forEach(point => {
            // Добавяне на маркер
            L.circleMarker([point.lat, point.lon], {
                radius: 10,
                fillColor: getColor(point.type),
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }).addTo(map)
            .bindPopup(`<b>${point.country}</b><br>${point.type}<br>Fatalities: ${point.fatalities}`);

            // Смятане на статистики
            totalFatalities += point.fatalities;
            countries.add(point.country);
        });

        // Обновяване на цифрите в черния панел горе
        document.getElementById('active-events').innerText = `Active events: ${data.length}`;
        document.getElementById('total-fatalities').innerText = `Total fatalities: ${totalFatalities}`;
        document.getElementById('countries-affected').innerText = `Countries affected: ${countries.size}`;
        document.getElementById('last-update').innerText = `Last update: ${new Date().toLocaleDateString()}`;
    });

// 4. Легендата
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend'),
        types = ['Explosion', 'Airstrike', 'Armed clash', 'Other'];
    
    div.innerHTML = '<b style="color: black;">Тип събитие</b><br>';
    for (var i = 0; i < types.length; i++) {
        div.innerHTML += '<i style="background:' + getColor(types[i]) + '"></i> ' + 
                         '<span style="color: black;">' + types[i] + '</span><br>';
    }
    return div;
};
legend.addTo(map);
