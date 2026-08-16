'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icône Bleue (Chantiers en cours / à venir)
const blueIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icône Rouge (Chantiers récents terminés < 2 mois)
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function TravauxMap() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialisation de la carte centrée sur Angers
    const map = L.map(mapContainerRef.current).setView([47.4784, -0.5632], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap / Ville d\'Angers'
    }).addTo(map);

    const now = new Date();
    
    // Calcul de la date seuil : il y a 2 mois
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    const twoMonthsAgoIso = twoMonthsAgo.toISOString().split('T')[0];

    // Requête API pour récupérer les travaux se terminant après cette date seuil
    const apiUrl = `https://data.angers.fr/api/explore/v2.1/catalog/datasets/info-travaux/records?where=endat%20%3E%3D%20date'${twoMonthsAgoIso}'&order_by=startat%20DESC&limit=100`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const records = data.results || [];

        records.forEach(chantier => {
          // Extraction des coordonnées GPS
          const lat = chantier.geo_point_2d?.lat || chantier.location?.geometry?.coordinates?.[1];
          const lon = chantier.geo_point_2d?.lon || chantier.location?.geometry?.coordinates?.[0];

          if (lat && lon) {
            const endDate = chantier.endat ? new Date(chantier.endat) : null;
            
            // Un chantier est considéré comme terminé s'il a une date de fin passée
            const isFinished = endDate && endDate < now;

            // Sélection de l'icône selon l'état du chantier
            const markerIcon = isFinished ? redIcon : blueIcon;

            const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(map);

            const startDateStr = chantier.startat ? new Date(chantier.startat).toLocaleDateString('fr-FR') : 'N/C';
            const endDateStr = chantier.endat ? new Date(chantier.endat).toLocaleDateString('fr-FR') : 'N/C';

            // Étiquette de statut HTML dans la modale
            const statusBadge = isFinished 
              ? `<span style="display:inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; color: #b91c1c; background-color: #fef2f2; border-radius: 4px; margin-bottom: 4px;">🔴 Terminé (< 2 mois)</span>`
              : `<span style="display:inline-block; padding: 2px 6px; font-size: 10px; font-weight: bold; color: #15803d; background-color: #f0fdf4; border-radius: 4px; margin-bottom: 4px;">🟢 En cours / À venir</span>`;

            marker.bindPopup(`
              <div style="font-family: sans-serif; max-width: 240px;">
                ${statusBadge}
                <h4 style="margin: 2px 0 5px 0; color: #0f172a; font-size: 14px; font-weight: bold;">
                  🚧 ${chantier.title || 'Chantier / Travaux'}
                </h4>
                <p style="margin: 3px 0; font-size: 12px; color: #475569;">
                  <b>Adresse :</b> ${chantier.address || 'Angers'}
                </p>
                <p style="margin: 3px 0; font-size: 12px; color: #475569;">
                  <b>Impact :</b> ${chantier.description || 'Perturbations à prévoir'}
                </p>
                <p style="margin: 3px 0; font-size: 11px; color: #64748b; font-weight: 600;">
                  📅 Du ${startDateStr} au ${endDateStr}
                </p>
              </div>
            `);
          }
        });
      })
      .catch(error => {
        console.error('Erreur lors du chargement de l\'API OpenData Angers :', error);
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0 relative">
      {/* Légende interactive sur la carte */}
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-md z-[1000] border border-slate-200 text-xs space-y-1.5">
        <div className="font-bold text-slate-800 border-b pb-1">Légende</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
          <span className="text-slate-600">En cours / À venir</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
          <span className="text-slate-600">Terminé (&lt; 2 mois)</span>
        </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
