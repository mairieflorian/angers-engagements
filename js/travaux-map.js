function initTravauxMap() {
  const map = L.map('map-travaux').setView([47.4784, -0.5632], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap / Ville d\'Angers'
  }).addTo(map);

  const apiUrl = "https://data.angers.fr/api/explore/v2.1/catalog/datasets/delimitation-des-chantiers-perturbants/records?limit=100";

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      data.results.forEach(chantier => {
        if (chantier.geo_shape) {
          const geoLayer = L.geoJSON(chantier.geo_shape, {
            style: { color: "#e67e22", weight: 5, opacity: 0.8 }
          }).addTo(map);

          geoLayer.bindPopup(`
            <strong>${chantier.nom || 'Travaux'}</strong><br>
            ${chantier.description || 'Chantier en cours'}
          `);
        }
      });
    })
    .catch(err => console.error("Erreur d'accès à l'API Data Angers:", err));
}
