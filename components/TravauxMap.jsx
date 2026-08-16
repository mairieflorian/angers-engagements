'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet par défaut avec Webpack / Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function TravauxMap() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialisation de la carte centré sur Angers
    const map = L.map(mapContainerRef.current).setView([47.4784, -0.5632], 13);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap / Ville d\'Angers'
    }).addTo(map);

    // URL officielle Open Data Ville d'Angers : dataset info-travaux
    const apiUrl = "https://data.angers.fr/api/explore/v2.1/catalog/datasets/info-travaux/records?limit=100";

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          data.results.forEach(chantier => {
            // Extraction des coordonnées GPS (lat/lon)
            const lat = chantier.geo_point_2d?.lat || chantier.location?.geometry?.coordinates?.[1];
            const lon = chantier.geo_point_2d?.lon || chantier.location?.geometry?.coordinates?.[0];

            if (lat && lon) {
              const marker = L.marker([lat, lon]).addTo(map);

              // Formattage des dates si disponibles
              const startDate = chantier.startat ? new Date(chantier.startat).toLocaleDateString('fr-FR') : 'N/C';
              const endDate = chantier.endat ? new Date(chantier.endat).toLocaleDateString('fr-FR') : 'N/C';

              marker.bindPopup(`
                <div style="font-family: sans-serif; max-width: 240px;">
                  <h4 style="margin: 0 0 5px 0; color: #ea580c; font-size: 14px; font-weight: bold;">
                    🚧 ${chantier.title || 'Chantier / Travaux'}
                  </h4>
                  <p style="margin: 3px 0; font-size: 12px; color: #475569;">
                    <b>Adresse :</b> ${chantier.address || 'Angers'}
                  </p>
                  <p style="margin: 3px 0; font-size: 12px; color: #475569;">
                    <b>Impact :</b> ${chantier.description || 'Perturbations à prévoir'}
                  </p>
                  <p style="margin: 3px 0; font-size: 11px; color: #64748b;">
                    📅 Du ${startDate} au ${endDate}
                  </p>
                </div>
              `);
            }
          });
        }
      })
      .catch(error => {
        console.error('Erreur chargement OpenData Angers :', error);
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
