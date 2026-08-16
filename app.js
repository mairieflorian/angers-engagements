let commitmentsData = [];
let mapInitialized = false;

// Chargement du fichier data/commitments.json
fetch('data/commitments.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    commitmentsData = data;
    renderCards(commitmentsData);
    populateQuartierFilter(commitmentsData);
  })
  .catch(error => {
    console.error('Erreur lors du chargement des engagements :', error);
  });

// Filtre combiné (Quartier + Thématique + Statut + Génération Angers)
function filterCommitments() {
  const selectedQuartier = document.getElementById('select-quartier')?.value || 'Tous';
  const selectedThematique = document.getElementById('select-thematique')?.value || 'Toutes';
  const selectedStatut = document.getElementById('select-statut')?.value || 'Tous';
  const isGenAngersChecked = document.getElementById('checkbox-generation-angers')?.checked || false;

  const filtered = commitmentsData.filter(item => {
    // Gestion du nom de clé dans votre JSON (quartier/district et category/thematique/status)
    const itemQuartier = item.quartier || item.district;
    const itemThematique = item.thematique || item.category;
    const itemStatut = item.statut || item.status;

    const matchQuartier = (selectedQuartier === 'Tous') || (itemQuartier === selectedQuartier);
    const matchThematique = (selectedThematique === 'Toutes') || (itemThematique === selectedThematique);
    const matchStatut = (selectedStatut === 'Tous') || (itemStatut === selectedStatut);
    
    // Filtre Génération Angers (vérifie la propriété isGenerationAngers du JSON)
    const matchGenAngers = !isGenAngersChecked || item.isGenerationAngers === true;
    
    return matchQuartier && matchThematique && matchStatut && matchGenAngers;
  });

  renderCards(filtered);
}

// Remplissage dynamique des options du filtre Quartier
function populateQuartierFilter(data) {
  const selectQuartier = document.getElementById('select-quartier');
  if (!selectQuartier) return;

  const quartiers = [...new Set(data.map(item => item.quartier || item.district))].sort();
  
  quartiers.forEach(quartier => {
    if (!quartier) return;
    const option = document.createElement('option');
    option.value = quartier;
    option.textContent = quartier;
    selectQuartier.appendChild(option);
  });
}

// -------------------------------------------------------------
// NOUVEAU : GESTION DES ONGLETS ET CARTE INFO TRAVAUX
// -------------------------------------------------------------

// Fonction pour basculer entre les onglets de l'application
function switchTab(tabName) {
  const tabEngagements = document.getElementById('tab-engagements');
  const tabTravaux = document.getElementById('tab-travaux');

  if (tabName === 'travaux') {
    if (tabEngagements) tabEngagements.style.display = 'none';
    if (tabTravaux) tabTravaux.style.display = 'block';

    // Initialise la carte uniquement au premier affichage de l'onglet
    if (!mapInitialized) {
      initTravauxMap();
      mapInitialized = true;
    }
  } else {
    if (tabEngagements) tabEngagements.style.display = 'block';
    if (tabTravaux) tabTravaux.style.display = 'none';
  }
}

// Initialisation de la carte Leaflet et chargement du flux Open Data
function initTravauxMap() {
  const mapContainer = document.getElementById('map-travaux');
  if (!mapContainer) return;

  // Centrage sur Angers
  const map = L.map('map-travaux').setView([47.4784, -0.5632], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap / Ville d\'Angers'
  }).addTo(map);

  // API Open Data officiel de la ville d'Angers
  const apiUrl = "https://data.angers.fr/api/explore/v2.1/catalog/datasets/delimitation-des-chantiers-perturbants/records?limit=100";

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.results) {
        data.results.forEach(chantier => {
          if (chantier.geo_shape) {
            const geoLayer = L.geoJSON(chantier.geo_shape, {
              style: {
                color: "#e67e22",
                weight: 5,
                opacity: 0.8
              }
            }).addTo(map);

            geoLayer.bindPopup(`
              <div style="font-family: sans-serif;">
                <h4 style="margin: 0 0 5px 0; color: #d35400;">${chantier.nom || 'Travaux'}</h4>
                <p><b>Description :</b> ${chantier.description || 'Chantier en cours'}</p>
                <p><b>Statut/Impact :</b> ${chantier.impact || 'Perturbations à prévoir'}</p>
              </div>
            `);
          }
        });
      }
    })
    .catch(error => {
      console.error('Erreur lors du chargement des données travaux :', error);
    });
}
