import React from "react";

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

const formatPercent = (val) => `${(val * 100).toFixed(0)}%`;

function ConfidenceBar({ score }) {
  const color = score >= 0.85 ? "#16a34a" : score >= 0.7 ? "#d97706" : "#dc2626";
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
        <span style={{ color: "#6b7280" }}>Model Confidence</span>
        <span style={{ fontWeight: "700", color }}>{formatPercent(score)}</span>
      </div>
      <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score * 100}%`, background: color, borderRadius: "4px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, total, color }) {
  const pct = (value / total) * 100;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
        <span style={{ color: "#4b5563" }}>{label}</span>
        <span style={{ fontWeight: "600", color: "#1f2937" }}>{formatCurrency(value)}</span>
      </div>
      <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "3px" }} />
      </div>
    </div>
  );
}

const BREAKDOWN_COLORS = [
  "#2563eb", "#16a34a", "#d97706", "#7c3aed",
  "#dc2626", "#0891b2", "#9d174d"
];

function PredictionCard({ result }) {
  if (!result) return null;

  const {
    predicted_cost,
    cost_per_sqft,
    cost_range_low,
    cost_range_high,
    confidence_score,
    breakdown,
    recommendations,
  } = result;

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Main Cost Display */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
        borderRadius: "14px",
        padding: "28px",
        color: "#fff",
        textAlign: "center",
        marginBottom: "20px",
        boxShadow: "0 4px 20px rgba(37,99,235,0.35)"
      }}>
        <p style={{ fontSize: "13px", opacity: 0.8, marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>
          Estimated Construction Cost
        </p>
        <h2 style={{ fontSize: "38px", fontWeight: "800", margin: "0 0 6px" }}>
          {formatCurrency(predicted_cost)}
        </h2>
        <p style={{ fontSize: "15px", opacity: 0.85 }}>
          {formatCurrency(cost_per_sqft)} per sq ft
        </p>
      </div>

      {/* Cost Range */}
      <div style={{
        background: "#f0f9ff",
        border: "1px solid #bae6fd",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "3px" }}>LOW ESTIMATE</p>
          <p style={{ fontSize: "17px", fontWeight: "700", color: "#16a34a" }}>{formatCurrency(cost_range_low)}</p>
        </div>
        <div style={{ fontSize: "20px", color: "#94a3b8" }}>↔</div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "3px" }}>HIGH ESTIMATE</p>
          <p style={{ fontSize: "17px", fontWeight: "700", color: "#dc2626" }}>{formatCurrency(cost_range_high)}</p>
        </div>
      </div>

      {/* Confidence */}
      <ConfidenceBar score={confidence_score} />

      {/* Cost Breakdown */}
      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1e3a5f", marginBottom: "14px" }}>
          📊 Cost Breakdown
        </h4>
        {Object.entries(breakdown).map(([label, value], i) => (
          <BreakdownBar
            key={label}
            label={label}
            value={value}
            total={predicted_cost}
            color={BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length]}
          />
        ))}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "10px",
          padding: "16px"
        }}>
          <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#92400e", marginBottom: "10px" }}>
            💡 Optimization Tips
          </h4>
          {recommendations.map((rec, i) => (
            <div key={i} style={{
              display: "flex", gap: "8px", alignItems: "flex-start",
              fontSize: "13px", color: "#78350f", marginBottom: i < recommendations.length - 1 ? "8px" : "0"
            }}>
              <span style={{ flexShrink: 0 }}>•</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PredictionCard;