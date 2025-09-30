// Leaflet térkép inicializálása
const map = L.map('map').setView([46.76438,17.25338], 13); // Budapest középpont
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia2FraWthMDIiLCJhIjoiY21mZjdrbzVuMDF5cTJqczd3aGx5ZHJiZSJ9.8ZZ3C-2i7IlNPN_deNcBSA', {
  attribution: '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  tileSize: 512,
  zoomOffset: -1,
  id: 'mapbox/outdoors-v11',  // <-- itt állítod a stílust
  accessToken: 'pk.eyJ1Ijoia2FraWthMDIiLCJhIjoiY21mZjdrbzVuMDF5cTJqczd3aGx5ZHJiZSJ9.8ZZ3C-2i7IlNPN_deNcBSA'
}).addTo(map);


// Menü és fül elemek
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('close-btn');
const reopenTab = document.getElementById('reopen-tab');
const splash = document.getElementById('splash');

// Menü bezárás
closeBtn.addEventListener('click', () => {
  sidebar.classList.add('closed');
  reopenTab.classList.remove('hidden');
  setTimeout(() => map.invalidateSize(), 310);
});

// Menü nyitás
reopenTab.addEventListener('click', () => {
  sidebar.classList.remove('closed');
  reopenTab.classList.add('hidden');
  setTimeout(() => map.invalidateSize(), 310);
});

// Splash screen eltüntetés
window.addEventListener('load', () => {
  setTimeout(() => {
    splash.classList.add('hide');
    setTimeout(() => splash.style.display = 'none', 1000);
  }, 2000); // 2 mp után indul az animáció
});

// Rétegek létrehozása
const layers = {
  "Desztinációk": L.layerGroup().addTo(map),
  "Kölcsönzők": L.layerGroup().addTo(map),
  "Események": L.layerGroup().addTo(map)
};

// Desztinációk
fetch('api.php?action=desztinaciok')
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      L.marker([item.lat, item.lng])
        .bindPopup(`<b>${item.nev}</b><br>${item.leiras}`)
        .addTo(layers["Desztinációk"]);
    });
  });

// Kölcsönzők
fetch('api.php?action=kolcsonzok')
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      L.marker([item.lat, item.lng], { icon: L.icon({ 
          iconUrl: "bike.png", iconSize: [32,32] 
        })})
        .bindPopup(`<b>${item.nev}</b><br>${item.cim}`)
        .addTo(layers["Kölcsönzők"]);
    });
  });

// Események
fetch('api.php?action=esemenyek')
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      L.marker([item.lat, item.lng])
        .bindPopup(`<b>${item.nev}</b><br>${item.datum}`)
        .addTo(layers["Események"]);
    });
  });

// Rétegválasztó hozzáadása
L.control.layers(null, layers).addTo(map);

fetch('api.php?action=desztinaciok')
  .then(res => res.json())
  .then(data => {
    console.log("API adatok:", data); // <<< nézd meg itt mit kapsz
    data.forEach(item => {
      console.log(item); // minden sor loggolva
    });
  });

// utvonalaak geciicicic
fetch('api.php?action=utvonalak')
  .then(res => res.json())
  .then(data => {
    data.forEach(utvonal => {
      // kezdő marker
      L.marker([utvonal.lat, utvonal.lng])
        .bindPopup(`<b>${utvonal.nev}</b><br>${utvonal.hossz_km} km, ${utvonal.nehezseg}`)
        .addTo(map);

      // ha van koordinátasor → animált útvonal
      if (utvonal.koordinatak) {
        var coords = JSON.parse(utvonal.koordinatak);
        var antPolyline = L.polyline.antPath(coords, {
          "paused": false,
          "reverse": false,
          "delay": 400,
          "dashArray": [10, 20],
          "weight": 5,
          "color": "blue",
          "pulseColor": "#FFFFFF"
        }).addTo(map);

        antPolyline.bindPopup(`<b>${utvonal.nev}</b> útvonal`);
      }
    });
  });
