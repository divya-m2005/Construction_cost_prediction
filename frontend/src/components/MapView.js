import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for selected location
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function MapEvents({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map center
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const MapView = ({ latitude, longitude, predictedCost, projectType, onLocationSelect, isDark }) => {
  const [position, setPosition] = useState([19.076, 72.877]); // Default to Mumbai

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
      <MapContainer center={position} zoom={11} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={position} />
        <TileLayer url={tileUrl} attribution={attribution} />
        <MapEvents onLocationSelect={handleSelect} />
        {latitude && longitude && (
          <Marker position={[latitude, longitude]} icon={selectedIcon}>
            <Popup>
              <div style={{ textAlign: 'center', color: '#1e293b' }}>
                <strong style={{ textTransform: 'capitalize' }}>{projectType || 'Project'} Site</strong><br />
                {predictedCost ? (
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>
                    Est: INR {(predictedCost * 83.5).toLocaleString()}
                  </span>
                ) : 'Selected Location'}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );

  function handleSelect(lat, lng) {
    onLocationSelect(lat, lng);
  }
};

export default MapView;
