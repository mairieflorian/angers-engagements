let commitmentsData = [];

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

// Filtre combiné (Quartier + Thématique + Statut)
function filterCommitments() {
  const selectedQuartier = document.getElementById('select-quartier').value;
  const selectedThematique = document.getElementById('select-thematique').value;
  const selectedStatut = document.getElementById('select-statut').value;

  const filtered = commitmentsData.filter(item => {
    const matchQuartier = (selectedQuartier === 'Tous') || (item.quartier === selectedQuartier);
    const matchThematique = (selectedThematique === 'Toutes') || (item.thematique === selectedThematique);
    const matchStatut = (selectedStatut === 'Tous') || (item.statut === selectedStatut);
    
    return matchQuartier && matchThematique && matchStatut;
  });

  renderCards(filtered);
}

// Remplissage dynamique des options du filtre Quartier
function populateQuartierFilter(data) {
  const selectQuartier = document.getElementById('select-quartier');
  if (!selectQuartier) return;

  const quartiers = [...new Set(data.map(item => item.quartier))].sort();
  
  quartiers.forEach(quartier => {
    const option = document.createElement('option');
    option.value = quartier;
    option.textContent = quartier;
    selectQuartier.appendChild(option);
  });
}
