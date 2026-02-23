import React, { useState, useEffect } from "react";

const getStyles = (theme, isDark) => ({
  select: {
    width: "100%",
    padding: "12px 14px",
    border: `1.5px solid ${theme.border}`,
    borderRadius: "12px",
    fontSize: "14px",
    background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
    color: theme.text,
    outline: "none",
    transition: "all 0.2s ease",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: theme.subtext,
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  field: { marginBottom: "20px" },
});

const initialState = {
  area_sqft: "",
  num_floors: "",
  project_type: "residential",
  location_zone: "suburban",
  foundation_type: "slab",
  wall_material: "brick",
  roof_type: "gable",
  has_basement: false,
  has_parking: false,
  quality_grade: "standard",
  soil_type: "loamy",
  distance_to_city_center: "",
  latitude: "",
  longitude: "",
};

function InputForm({ onSubmit, isLoading, selectedCoords, aiFill, isDark, theme }) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const STYLES = getStyles(theme, isDark);

  // Sync with AI auto-fill data
  useEffect(() => {
    if (aiFill) {
      setFormData((prev) => ({
        ...prev,
        ...aiFill
      }));
    }
  }, [aiFill]);

  useEffect(() => {
    if (selectedCoords?.latitude && selectedCoords?.longitude) {
      setFormData((prev) => ({
        ...prev,
        latitude: selectedCoords.latitude,
        longitude: selectedCoords.longitude,
      }));
    }
  }, [selectedCoords]);

  const validate = () => {
    const errs = {};
    if (!formData.area_sqft || parseFloat(formData.area_sqft) <= 0)
      errs.area_sqft = "Area must be greater than 0";
    if (!formData.num_floors || parseInt(formData.num_floors) < 1)
      errs.num_floors = "At least 1 floor required";
    if (formData.distance_to_city_center === "" || formData.distance_to_city_center === null)
      errs.distance_to_city_center = "Distance is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
      ...formData,
      area_sqft: parseFloat(formData.area_sqft),
      num_floors: parseInt(formData.num_floors),
      distance_to_city_center: parseFloat(formData.distance_to_city_center),
      latitude: formData.latitude !== "" ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude !== "" ? parseFloat(formData.longitude) : null,
    };
    onSubmit(payload);
  };

  const renderSelect = (name, label, options) => (
    <div style={STYLES.field}>
      <label style={STYLES.label}>{label}</label>
      <select name={name} value={formData[name]} onChange={handleChange} style={STYLES.select}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: theme.cardBg }}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const renderInput = (name, label, type = "number", placeholder = "") => (
    <div style={STYLES.field}>
      <label style={STYLES.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ ...STYLES.select, borderColor: errors[name] ? "#ef4444" : theme.border }}
      />
      {errors[name] && (
        <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors[name]}</span>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ padding: "0" }}>
      {renderInput("area_sqft", "Total Area (sq ft)", "number", "e.g., 5000")}
      {renderInput("num_floors", "Number of Floors", "number", "e.g., 3")}
      {renderInput("distance_to_city_center", "Distance to City Center (km)", "number", "e.g., 10.5")}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {renderSelect("project_type", "Project Type", [
          { value: "residential", label: "Residential" },
          { value: "commercial", label: "Commercial" },
          { value: "industrial", label: "Industrial" },
          { value: "infrastructure", label: "Infrastructure" },
        ])}
        {renderSelect("quality_grade", "Quality Grade", [
          { value: "economy", label: "Economy" },
          { value: "standard", label: "Standard" },
          { value: "premium", label: "Premium" },
          { value: "luxury", label: "Luxury" },
        ])}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {renderSelect("wall_material", "Wall Material", [
          { value: "brick", label: "Brick" },
          { value: "concrete", label: "Concrete" },
          { value: "steel", label: "Steel" },
          { value: "wood", label: "Wood" },
          { value: "glass", label: "Glass" },
        ])}
        {renderSelect("foundation_type", "Foundation", [
          { value: "slab", label: "Slab" },
          { value: "crawl_space", label: "Crawl Space" },
          { value: "basement", label: "Basement" },
          { value: "pile", label: "Pile" },
        ])}
      </div>

      {/* Checkboxes */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "24px", padding: "8px 0" }}>
        {[
          { name: "has_basement", label: "Basement" },
          { name: "has_parking", label: "Parking" },
        ].map(({ name, label }) => (
          <label key={name} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: theme.text }}>
            <input
              type="checkbox"
              name={name}
              checked={formData[name]}
              onChange={handleChange}
              style={{ width: "18px", height: "18px", accentColor: theme.accent }}
            />
            {label}
          </label>
        ))}
      </div>

      {/* Coordinates */}
      <div style={{ marginBottom: "28px", padding: "16px", borderRadius: "12px", border: `1px dashed ${theme.border}`, background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
        <label style={{ ...STYLES.label, color: theme.accent, display: "flex", justifyContent: "space-between" }}>
          <span>📍 Map Coordinates</span>
          <span style={{ fontSize: "10px", opacity: 0.7 }}>Auto-filled from map</span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ ...STYLES.label, fontSize: "11px", marginBottom: "4px" }}>Lat</label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="10.9..."
              style={{ ...STYLES.select, fontSize: "13px", padding: "8px 12px" }}
              step="any"
            />
          </div>
          <div>
            <label style={{ ...STYLES.label, fontSize: "11px", marginBottom: "4px" }}>Lng</label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="76.9..."
              style={{ ...STYLES.select, fontSize: "13px", padding: "8px 12px" }}
              step="any"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "16px",
          background: isLoading ? theme.subtext : `linear-gradient(135deg, ${theme.accent}, #2563eb)`,
          color: "#fff",
          border: "none",
          borderRadius: "14px",
          fontSize: "16px",
          fontWeight: "800",
          cursor: isLoading ? "not-allowed" : "pointer",
          letterSpacing: "0.5px",
          boxShadow: isDark ? "none" : "0 4px 12px rgba(59,130,246,0.3)",
          transition: "all 0.2s ease",
        }}
      >
        {isLoading ? "🔍 Calculating..." : "🔮 Get Precise Prediction"}
      </button>
    </form>
  );
}

export default InputForm;