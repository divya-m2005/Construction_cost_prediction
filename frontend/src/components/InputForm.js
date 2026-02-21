import React, { useState } from "react";

const SELECT_STYLES = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  background: "#fff",
  color: "#1f2937",
  outline: "none",
  transition: "border-color 0.2s",
};

const LABEL_STYLES = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "5px",
};

const FIELD_STYLES = { marginBottom: "18px" };

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

function InputForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.area_sqft || formData.area_sqft <= 0)
      errs.area_sqft = "Area must be greater than 0";
    if (!formData.num_floors || formData.num_floors < 1)
      errs.num_floors = "At least 1 floor required";
    if (!formData.distance_to_city_center && formData.distance_to_city_center !== 0)
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
    onSubmit({
      ...formData,
      area_sqft: parseFloat(formData.area_sqft),
      num_floors: parseInt(formData.num_floors),
      distance_to_city_center: parseFloat(formData.distance_to_city_center),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    });
  };

  const renderSelect = (name, label, options) => (
    <div style={FIELD_STYLES}>
      <label style={LABEL_STYLES}>{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        style={SELECT_STYLES}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderInput = (name, label, type = "number", placeholder = "") => (
    <div style={FIELD_STYLES}>
      <label style={LABEL_STYLES}>{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          ...SELECT_STYLES,
          borderColor: errors[name] ? "#ef4444" : "#d1d5db",
        }}
      />
      {errors[name] && (
        <span style={{ color: "#ef4444", fontSize: "12px" }}>{errors[name]}</span>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ padding: "0 4px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e3a5f", marginBottom: "20px" }}>
        Project Details
      </h3>

      {renderInput("area_sqft", "Total Area (sq ft)", "number", "e.g., 5000")}
      {renderInput("num_floors", "Number of Floors", "number", "e.g., 3")}
      {renderInput("distance_to_city_center", "Distance to City Center (km)", "number", "e.g., 10.5")}

      {renderSelect("project_type", "Project Type", [
        { value: "residential", label: "Residential" },
        { value: "commercial", label: "Commercial" },
        { value: "industrial", label: "Industrial" },
        { value: "infrastructure", label: "Infrastructure" },
      ])}

      {renderSelect("location_zone", "Location Zone", [
        { value: "urban", label: "Urban" },
        { value: "suburban", label: "Suburban" },
        { value: "rural", label: "Rural" },
      ])}

      {renderSelect("quality_grade", "Quality Grade", [
        { value: "economy", label: "Economy" },
        { value: "standard", label: "Standard" },
        { value: "premium", label: "Premium" },
        { value: "luxury", label: "Luxury" },
      ])}

      {renderSelect("foundation_type", "Foundation Type", [
        { value: "slab", label: "Slab" },
        { value: "crawl_space", label: "Crawl Space" },
        { value: "basement", label: "Basement" },
        { value: "pile", label: "Pile" },
      ])}

      {renderSelect("wall_material", "Wall Material", [
        { value: "brick", label: "Brick" },
        { value: "concrete", label: "Concrete" },
        { value: "steel", label: "Steel" },
        { value: "wood", label: "Wood" },
        { value: "glass", label: "Glass" },
      ])}

      {renderSelect("roof_type", "Roof Type", [
        { value: "flat", label: "Flat" },
        { value: "gable", label: "Gable" },
        { value: "hip", label: "Hip" },
        { value: "mansard", label: "Mansard" },
      ])}

      {renderSelect("soil_type", "Soil Type", [
        { value: "clay", label: "Clay" },
        { value: "sandy", label: "Sandy" },
        { value: "rocky", label: "Rocky" },
        { value: "loamy", label: "Loamy" },
      ])}

      {/* Checkboxes */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "18px" }}>
        {[
          { name: "has_basement", label: "Includes Basement" },
          { name: "has_parking", label: "Includes Parking" },
        ].map(({ name, label }) => (
          <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#374151" }}>
            <input
              type="checkbox"
              name={name}
              checked={formData[name]}
              onChange={handleChange}
              style={{ width: "16px", height: "16px", accentColor: "#1e3a5f" }}
            />
            {label}
          </label>
        ))}
      </div>

      {/* Optional coordinates */}
      <details style={{ marginBottom: "18px" }}>
        <summary style={{ cursor: "pointer", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>
          📍 Optional: Map Coordinates
        </summary>
        <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={LABEL_STYLES}>Latitude</label>
            <input type="number" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="e.g., 40.7128" style={SELECT_STYLES} step="any" />
          </div>
          <div>
            <label style={LABEL_STYLES}>Longitude</label>
            <input type="number" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="e.g., -74.006" style={SELECT_STYLES} step="any" />
          </div>
        </div>
      </details>

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "13px",
          background: isLoading ? "#9ca3af" : "linear-gradient(135deg, #1e3a5f, #2563eb)",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontSize: "15px",
          fontWeight: "700",
          cursor: isLoading ? "not-allowed" : "pointer",
          letterSpacing: "0.5px",
          transition: "opacity 0.2s",
        }}
      >
        {isLoading ? "⏳ Predicting..." : "🔮 Predict Cost"}
      </button>
    </form>
  );
}

export default InputForm;