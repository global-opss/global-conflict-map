const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Зареждаме данните
fetch('conflicts.json')
  .then(res => res.json())
  .then(data => {
      const countries = new Set();
      const years = new Set();
      let totalFatalities = 0;

      data.forEach(event => {
          const intensityColor = event.fatalities > 50 ? 'red' : event.fatalities > 10 ? 'orange' : 'yellow';

          L.circleMarker([event.lat, event.lon], {
              radius: 6,
              color: intensityColor,
              fillOpacity: 0.8
          }).addTo(map)
          .bindPopup(`
              <b>${event.country}</b><br>
              Date: ${event.date}<br>
              Fatalities: ${event.fatalities}<br>
              ${event.actor1} vs ${event.actor2}
          `);

          countries.add(event.country);
          years.add(new Date(event.date).getFullYear());
          totalFatalities += event.fatalities;
      });

      // Dashboard stats
      document.getElementById('active-events').textContent = `Active events: ${data.length}`;
      document.getElementById('total-fatalities').textContent = `Total fatalities: ${totalFatalities}`;
      document.getElementById('countries-affected').textContent = `Countries affected: ${countries.size}`;
      document.getElementById('last-update').textContent = `Last update: ${new Date().toLocaleDateString()}`;

      // Populate filters
      const yearSelect = document.getElementById('filter-year');
      Array.from(years).sort().forEach(y => {
          const opt = document.createElement('option');
          opt.value = y;
          opt.textContent = y;
          yearSelect.appendChild(opt);
      });
  })
  .catch(err => console.error(err));
