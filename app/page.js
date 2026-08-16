'use client';

import React, { useState, useMemo } from 'react';
import commitmentsData from '../data/commitments.json';

export default function App() {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [onlyTop10, setOnlyTop10] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Statistiques
  const stats = useMemo(() => {
    const total = commitmentsData.length;
    const fait = commitmentsData.filter(c => c.status === 'FAIT').length;
    const enCours = commitmentsData.filter(c => c.status === 'EN_COURS').length;
    const aFaire = commitmentsData.filter(c => c.status === 'A_FAIRE').length;
    const globalProgress = Math.round(
      commitmentsData.reduce((acc, c) => acc + (c.progress || 0), 0) / (total || 1)
    );
    return { total, fait, enCours, aFaire, globalProgress };
  }, []);

  const categories = useMemo(() => {
    return ['ALL', ...new Set(commitmentsData.map(c => c.category))];
  }, []);

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
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      {/* En-tête / Hero Section */}
      <header className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-900 text-white py-12 px-6 shadow-xl relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-sky-200 mb-4 border border-white/10">
            <span>🏛️ Ville d'Angers</span>
            <span>•</span>
            <span>Observatoire Citoyen</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Suivi des Engagements Municipaux
          </h1>
          <p className="text-sky-200 mt-3 text-base md:text-lg max-w-2xl leading-relaxed">
            Transparence & avancement en direct du programme de la municipalité d'Angers.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 space-y-8 relative z-20">
        
        {/* Tableau de bord / Statistiques */}
        <section className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200/80 backdrop-blur-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Avancement du Mandat</h2>
              <p className="text-sm text-slate-500">Progression moyenne sur l'ensemble des mesures</p>
            </div>
            <div className="text-3xl font-black text-sky-600 bg-sky-50 px-4 py-2 rounded-xl border border-sky-100 self-start md:self-auto">
              {stats.globalProgress}%
            </div>
          </div>

          {/* Barre de progression globale */}
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden mb-8 p-0.5 border border-slate-200">
            <div 
              className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${stats.globalProgress}%` }}
            ></div>
          </div>

          {/* Grid de métriques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</span>
              <p className="text-2xl md:text-3xl font-black text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Réalisés</span>
              <p className="text-2xl md:text-3xl font-black text-emerald-700 mt-1">{stats.fait}</p>
            </div>
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">En cours</span>
              <p className="text-2xl md:text-3xl font-black text-amber-700 mt-1">{stats.enCours}</p>
            </div>
            <div className="bg-slate-100/60 p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">À venir</span>
              <p className="text-2xl md:text-3xl font-black text-slate-600 mt-1">{stats.aFaire}</p>
            </div>
          </div>
        </section>

        {/* Barre de Filtres & Recherche */}
        <section className="bg-white rounded-2xl shadow-md p-5 border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Recherche */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="🔍 Rechercher une mesure..."
              className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'Toutes les catégories' : cat}
                </option>
              ))}
            </select>

            <select 
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="FAIT">Réalisés</option>
              <option value="EN_COURS">En cours</option>
              <option value="A_FAIRE">À venir</option>
            </select>

            <button
              onClick={() => setOnlyTop10(!onlyTop10)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                onlyTop10 
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              ⭐ Top 10 Mesures
            </button>
          </div>
        </section>

        {/* Liste des cartes d'engagements */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCommitments.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <span className="text-xs font-bold px-3 py-1 bg-sky-50 text-sky-700 rounded-lg border border-sky-100">
                    {item.category}
                  </span>
                  {item.isTop10 && (
                    <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60 flex items-center gap-1">
                      ⭐ 10 Mesures Phares
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug mb-4">
                  {item.title}
                </h3>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-2">
                <div className="flex justify-between items-center text-xs text-slate-500 mb-2 font-medium">
                  <span className="flex items-center gap-1.5">
                    Statut :
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      item.status === 'FAIT' ? 'bg-emerald-500' :
                      item.status === 'EN_COURS' ? 'bg-amber-500' : 'bg-slate-300'
                    }`}></span>
                    <strong className={
                      item.status === 'FAIT' ? 'text-emerald-700 font-bold' :
                      item.status === 'EN_COURS' ? 'text-amber-700 font-bold' : 'text-slate-500 font-bold'
                    }>
                      {item.status === 'FAIT' ? 'Réalisé' : item.status === 'EN_COURS' ? 'En cours' : 'À venir'}
                    </strong>
                  </span>
                  <span className="font-semibold text-slate-700">{item.progress || 0}%</span>
                </div>

                {/* Barre de progression individuelle */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'FAIT' ? 'bg-emerald-500' :
                      item.status === 'EN_COURS' ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                    style={{ width: `${item.progress || 0}%` }}
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
