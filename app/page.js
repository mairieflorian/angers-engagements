'use client';
import React, { useState, useMemo } from 'react';
import commitmentsData from '../data/commitments.json';

export default function App() {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [onlyTop10, setOnlyTop10] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Statistiques globales
  const stats = useMemo(() => {
    const total = commitmentsData.length;
    const fait = commitmentsData.filter(c => c.status === 'FAIT').length;
    const enCours = commitmentsData.filter(c => c.status === 'EN_COURS').length;
    const aFaire = commitmentsData.filter(c => c.status === 'A_FAIRE').length;
    const globalProgress = Math.round(
      commitmentsData.reduce((acc, c) => acc + c.progress, 0) / total
    );
    return { total, fait, enCours, aFaire, globalProgress };
  }, []);

  // Liste unique des catégories
  const categories = useMemo(() => {
    return ['ALL', ...new Set(commitmentsData.map(c => c.category))];
  }, []);

  // Filtrage des données
  const filteredCommitments = useMemo(() => {
    return commitmentsData.filter(item => {
      const matchCat = filterCategory === 'ALL' || item.category === filterCategory;
      const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const matchTop10 = !onlyTop10 || item.isTop10;
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchStatus && matchTop10 && matchSearch;
    });
  }, [filterCategory, filterStatus, onlyTop10, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* En-tête */}
      <header className="bg-blue-900 text-white py-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">Angers - Suivi des Engagements Municipaux</h1>
          <p className="text-blue-200 mt-2">
            Observatoire citoyen de l'avancement du programme municipal (Mandat 2026-2032)
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Tableau de bord / Global Progress */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">Avancement Global</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <div className="text-3xl font-bold text-slate-800">{stats.globalProgress}%</div>
              <div className="text-sm text-slate-500 mt-1">Avancement Global</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-slate-500 mt-1">Engagements</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="text-3xl font-bold text-emerald-600">{stats.fait}</div>
              <div className="text-sm text-emerald-600 mt-1">Réalisés</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="text-3xl font-bold text-amber-600">{stats.enCours}</div>
              <div className="text-sm text-amber-600 mt-1">En cours</div>
            </div>
            <div className="p-4 bg-slate-100 rounded-lg border">
              <div className="text-3xl font-bold text-slate-500">{stats.aFaire}</div>
              <div className="text-sm text-slate-500 mt-1">À venir</div>
            </div>
          </div>
          
          {/* Barre de progression macro */}
          <div className="w-full bg-slate-200 rounded-full h-3 mt-6 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${stats.globalProgress}%` }}
            ></div>
          </div>
        </section>

        {/* Barre de recherche et filtres */}
        <section className="bg-white p-6 rounded-xl shadow-md border border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <input
              type="text"
              placeholder="Rechercher une mesure..."
              className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
              {/* Filtre Catégorie */}
              <select 
                className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'Toutes les catégories' : cat}
                  </option>
                ))}
              </select>

              {/* Filtre Statut */}
              <select 
                className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">Tous les statuts</option>
                <option value="FAIT">Réalisé</option>
                <option value="EN_COURS">En cours</option>
                <option value="A_FAIRE">À venir</option>
              </select>

              {/* Bouton Toggle Top 10 */}
              <button
                onClick={() => setOnlyTop10(!onlyTop10)}
                className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                  onlyTop10 
                    ? 'bg-blue-900 text-white border-blue-900' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ⭐ Top 10 Mesures
              </button>
            </div>
          </div>
        </section>

        {/* Liste des Engagements */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommitments.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded">
                    {item.category}
                  </span>
                  {item.isTop10 && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300">
                      ⭐ 10 Premières Mesures
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-4">{item.title}</h3>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                  <span>
                    Statut: 
                    <strong className={`ml-1 ${
                      item.status === 'FAIT' ? 'text-emerald-600' :
                      item.status === 'EN_COURS' ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      {item.status === 'FAIT' ? 'Réalisé' : item.status === 'EN_COURS' ? 'En cours' : 'À venir'}
                    </strong>
                  </span>
                  <span>Mise à jour: {item.lastUpdate}</span>
                </div>
                {/* Barre de progression individuelle */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full ${
                      item.status === 'FAIT' ? 'bg-emerald-500' :
                      item.status === 'EN_COURS' ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
