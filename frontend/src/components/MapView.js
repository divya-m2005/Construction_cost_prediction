import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function MapView({ latitude, longitude, predictedCost, projectType }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  useEffect(() => {
    if (!latitude || !longitude) return;
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current).setView([latitude, longitude], 13);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: "",
      html: `<div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:white;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">
        🏗️ ${projectType || "Project"}<br/>
        <span style="font-size:11px">${formatCurrency(predictedCost)}</span>
      </div>`,
      iconAnchor: [60, 40],
    });

    L.marker([latitude, longitude], { icon })
      .addTo(map)
      .bindPopup(
        `<b>Construction Project</b><br/>
         Type: ${projectType || "N/A"}<br/>
         Cost: ${formatCurrency(predictedCost)}<br/>
         Lat/Lng: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      )
      .openPopup();

    L.circle([latitude, longitude], {
      radius: 500,
      color: "#2563eb",
      fillColor: "#3b82f6",
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, predictedCost, projectType]);

  if (!latitude || !longitude) {
    return (
      <div style={{
        height: "300px",
        background: "#f8fafc",
        border: "2px dashed #e2e8f0",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
      }}>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🗺️</div>
        <p style={{ fontSize: "14px", fontWeight: "600" }}>Map View</p>
        <p style={{ fontSize: "12px" }}>Enter latitude & longitude to see project location</p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <div ref={mapRef} style={{ height: "350px", width: "100%" }} />
    </div>
  );
}

export default MapView;
