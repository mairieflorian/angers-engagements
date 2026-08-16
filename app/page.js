'use client';

import React, { useState, useMemo } from 'react';
import commitmentsData from '../data/commitments.json';
import electedData from '../data/elected.json';

// Composant pour gérer l'avatar avec fallback sans manipuler directement le DOM
function ElectedAvatar({ photo, name, firstName, lastName }) {
  const [imgError, setImgError] = useState(false);

  const initials = `${(firstName || '?')[0]}${(lastName || '?')[0]}`;

  if (imgError || !photo) {
    return (
      <div className="w-24 h-28 mb-3 rounded-xl bg-blue-100 border border-slate-200 flex items-center justify-center text-blue-800 font-bold text-lg shadow-inner">
        {initials}
      </div>
    );
  }

  return (
    <div className="w-24 h-28 mb-3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
      <img
        src={photo}
        alt={name || 'Élu'}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('commitments');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterDistrict, setFilterDistrict] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [onlyTop10, setOnlyTop10] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Filtre supplémentaire pour les élus ('ALL', 'ADJOINT', 'CONSEILLER')
  const [roleFilter, setRoleFilter] = useState('ALL');

  const districts = useMemo(() => {
    if (!Array.isArray(commitmentsData)) return ['ALL'];
    return ['ALL', ...new Set(commitmentsData.map(c => c.district || 'Tous les quartiers'))];
  }, []);

  const categories = useMemo(() => {
    if (!Array.isArray(commitmentsData)) return ['ALL'];
    return ['ALL', ...new Set(commitmentsData.map(c => c.category))];
  }, []);

  const filteredCommitments = useMemo(() => {
    if (!Array.isArray(commitmentsData)) return [];
    return commitmentsData.filter(item => {
      const matchCat = filterCategory === 'ALL' || item.category === filterCategory;
      const matchDist = filterDistrict === 'ALL' || (item.district || 'Tous les quartiers') === filterDistrict;
      const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const matchTop10 = !onlyTop10 || item.isTop10;
      const matchSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchDist && matchStatus && matchTop10 && matchSearch;
    });
  }, [filterCategory, filterDistrict, filterStatus, onlyTop10, searchTerm]);

  // Formateur dynamique sécurisé des adresses mail
  const generateEmail = (firstName = '', lastName = '') => {
    const cleanStr = (str) =>
      String(str)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/\s+/g, "-");          // Remplace les espaces par des tirets

    return `${cleanStr(firstName)}.${cleanStr(lastName)}@ville.angers.fr`;
  };

  const filteredElected = useMemo(() => {
    if (!Array.isArray(electedData)) return [];
    return electedData.filter(e => {
      const roleLower = (e.role || '').toLowerCase();
      
      let matchRole = true;
      if (roleFilter === 'ADJOINT') {
        matchRole = roleLower.includes('adjoint');
      } else if (roleFilter === 'CONSEILLER') {
        matchRole = roleLower.includes('conseiller');
      }

      const searchLower = searchTerm.toLowerCase();
      const matchSearch = (e.name || '').toLowerCase().includes(searchLower) || 
                          (e.delegation || '').toLowerCase().includes(searchLower);
      
      return matchRole && matchSearch;
    });
  }, [roleFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16">
      {/* En-tête / Navigation */}
      <header className="bg-slate-900 text-white py-8 px-6 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Angers - Observatoire Citoyen</h1>
            <p className="text-slate-400 text-sm">Suivi des engagements et de l'équipe municipale</p>
          </div>
          <nav className="flex gap-2 bg-slate-800 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab('commitments')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'commitments' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 Engagements
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'team' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              👥 Conseil Municipal ({Array.isArray(electedData) ? electedData.length : 0})
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'commitments' ? (
          <>
            {/* Filtres Engagements */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="🔍 Rechercher une mesure..."
                className="px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
              >
                <option value="ALL">📍 Tous les quartiers</option>
                {districts.filter(d => d !== 'ALL').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select 
                className="px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="ALL">🏷️ Toutes catégories</option>
                {categories.filter(c => c !== 'ALL').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </section>

            {/* Cartes Engagements */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCommitments.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded text-slate-600">
                        📍 {item.district || 'Tous les quartiers'}
                      </span>
                      <span className="text-xs font-bold text-blue-600">En savoir + →</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-4">{item.title}</h3>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${item.progress || 0}%` }}></div>
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : (
          /* Onglet Trombinoscope */
          <>
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3 items-center justify-between">
              <input
                type="text"
                placeholder="🔍 Rechercher un élu, une fonction..."
                className="px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    roleFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Tous ({Array.isArray(electedData) ? electedData.length : 0})
                </button>
                <button
                  onClick={() => setRoleFilter('ADJOINT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    roleFilter === 'ADJOINT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Adjoints
                </button>
                <button
                  onClick={() => setRoleFilter('CONSEILLER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    roleFilter === 'CONSEILLER' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Conseillers
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredElected.map((elus) => {
                const email = generateEmail(elus.firstName, elus.lastName);

                return (
                  <div 
                    key={elus.id} 
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all text-center flex flex-col justify-between items-center"
                  >
                    <div className="flex flex-col items-center w-full">
                      <ElectedAvatar
                        photo={elus.photo}
                        name={elus.name}
                        firstName={elus.firstName}
                        lastName={elus.lastName}
                      />

                      <a 
                        href={`mailto:${email}`}
                        title={`Envoyer un email à ${elus.name || 'l\'élu'}`}
                        className="font-bold text-base text-slate-900 hover:text-blue-600 hover:underline transition-colors"
                      >
                        {elus.name}
                      </a>

                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded my-1.5">
                        {elus.role}
                      </span>

                      <p className="text-xs text-slate-500 leading-relaxed mb-4">
                        {elus.delegation}
                      </p>
                    </div>

                    <a 
                      href={`mailto:${email}`}
                      className="w-full py-2 px-3 bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      ✉️ {email}
                    </a>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>

      {/* Modal Détails */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold"
            >
              ✕
            </button>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded">
              {selectedItem.category} • {selectedItem.district || 'Tous les quartiers'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2 mb-4">{selectedItem.title}</h2>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400">Description</h4>
                <p className="text-sm text-slate-700 mt-1">
                  {selectedItem.details?.description || "Aucun détail complémentaire renseigné."}
                </p>
              </div>

              {selectedItem.details?.updates && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Historique des actions</h4>
                  <ul className="space-y-2">
                    {selectedItem.details.updates.map((update, idx) => (
                      <li key={idx} className="text-xs bg-slate-50 p-2.5 rounded-lg border text-slate-600">
                        {update}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
