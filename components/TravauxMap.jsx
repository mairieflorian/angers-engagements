import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Chargement dynamique de la carte sans SSR pour éviter les erreurs de serveur
const MapWithNoSSR = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { MapContainer, TileLayer, GeoJSON } = mod;
    return function MapComponent({ chantiers }) {
      return (
        <MapContainer center={[47.4784, -0.5632]} zoom={13} className="w-full h-[600px] rounded-lg shadow">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {chantiers.map((c, i) => c.geo_shape && (
            <GeoJSON key={i} data={c.geo_shape} style={{ color: '#e67e22', weight: 5 }} />
          ))}
        </MapContainer>
      );
    };
  }),
  { ssr: false }
);

export default function TravauxMap() {
  const [chantiers, setChantiers] = useState([]);

  useEffect(() => {
    fetch('https://data.angers.fr/api/explore/v2.1/catalog/datasets/delimitation-des-chantiers-perturbants/records?limit=100')
      .then((res) => res.json())
      .then((data) => setChantiers(data.results || []))
      .catch((err) => console.error(err));
  }, []);

  return <MapWithNoSSR chantiers={chantiers} />;
}
