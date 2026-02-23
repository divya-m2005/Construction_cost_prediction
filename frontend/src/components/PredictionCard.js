import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const formatPrice = (val, currency) =>
  new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0
  }).format(val);

const formatPercent = (val) => `${(val * 100).toFixed(0)}%`;

const BREAKDOWN_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];

function PhaseTimeline({ totalInr, theme }) {
  const phases = [
    { name: "Site Prep & Foundation", pct: 0.15, icon: "🏗️", desc: "Excavation, footings, and plinth" },
    { name: "RCC Structure", pct: 0.35, icon: "🧱", desc: "Slabs, beams, and columns" },
    { name: "MEP & Services", pct: 0.20, icon: "🔌", desc: "Plumbing, electrical, and HVAC" },
    { name: "Finishing & Interior", pct: 0.20, icon: "🎨", desc: "Plaster, paint, and flooring" },
    { name: "External & Handover", pct: 0.10, icon: "🔑", desc: "Landscaping and final cleaning" }
  ];

  return (
    <div style={{ marginTop: "32px" }}>
      <h4 style={{ fontSize: "13px", fontWeight: "800", color: theme.subtext, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>🗓️</span> CONSTRUCTION ROADMAP (INR)
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {phases.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: "20px", position: "relative" }}>
            {i !== phases.length - 1 && (
              <div style={{ position: "absolute", left: "15px", top: "30px", bottom: "-10px", width: "2px", background: theme.border, zIndex: 0 }} />
            )}

            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", background: theme.cardBg, border: `2px solid ${theme.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, fontSize: "16px", flexShrink: 0
            }}>
              {p.icon}
            </div>

            <div style={{ paddingBottom: "24px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <span style={{ fontWeight: "700", color: theme.text, fontSize: "14px" }}>{p.name}</span>
                <span style={{ fontWeight: "800", color: theme.accent, fontSize: "14px" }}>{formatPrice(totalInr * p.pct, "INR")}</span>
              </div>
              <p style={{ fontSize: "11px", color: theme.subtext, margin: 0 }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfidenceBar({ score, theme }) {
  const color = score >= 0.85 ? "#10b981" : score >= 0.7 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
        <span style={{ color: theme.subtext, fontWeight: "600" }}>MODEL CONFIDENCE</span>
        <span style={{ fontWeight: "800", color }}>{formatPercent(score)}</span>
      </div>
      <div style={{ height: "6px", background: theme.border, borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score * 100}%`, background: color, borderRadius: "10px", transition: "width 1s ease-out" }} />
      </div>
    </div>
  );
}

function PredictionCard({ result, isDark, theme }) {
  if (!result) return null;

  const {
    predicted_cost,
    cost_per_sqft,
    cost_range_low,
    cost_range_high,
    confidence_score,
    breakdown,
    explanation,
    anomalies,
    derived_distance,
    derived_zone
  } = result;

  const INR_COST = predicted_cost * 83.5;

  const pieData = Object.entries(breakdown).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }));

  return (
    <div style={{ fontFamily: "inherit" }}>
      <div style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(59,130,246,0.03)",
        border: `1px solid ${theme.border}`,
        borderRadius: "20px",
        padding: "32px",
        textAlign: "center",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: theme.accent }} />

        <p style={{ fontSize: "12px", fontWeight: "800", color: theme.subtext, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
          Estimated Total Cost
        </p>

        <h2 style={{ fontSize: "42px", fontWeight: "900", color: theme.text, margin: "0 0 4px", letterSpacing: "-1px" }}>
          {formatPrice(predicted_cost, "USD")}
        </h2>
        <p style={{ fontSize: "20px", fontWeight: "800", color: "#f59e0b", marginBottom: "16px" }}>
          ≈ {formatPrice(INR_COST, "INR")}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "24px", borderTop: `1px solid ${theme.border}`, paddingTop: "16px" }}>
          <div>
            <p style={{ fontSize: "11px", color: theme.subtext, marginBottom: "2px" }}>PER SQ FT</p>
            <p style={{ fontSize: "15px", fontWeight: "700", color: theme.text }}>{formatPrice(cost_per_sqft, "USD")}</p>
          </div>
          <div style={{ width: "1px", background: theme.border }} />
          <div>
            <p style={{ fontSize: "11px", color: theme.subtext, marginBottom: "2px" }}>IN INR</p>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#f59e0b" }}>{formatPrice(cost_per_sqft * 83.5, "INR")}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "16px", borderRadius: "16px", background: isDark ? "rgba(16,185,129,0.05)" : "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <p style={{ fontSize: "10px", fontWeight: "800", color: "#10b981", marginBottom: "4px" }}>LOW RANGE</p>
          <p style={{ fontSize: "16px", fontWeight: "800", color: theme.text }}>{formatPrice(cost_range_low, "USD")}</p>
        </div>
        <div style={{ padding: "16px", borderRadius: "16px", background: isDark ? "rgba(239, 68, 68, 0.05)" : "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          <p style={{ fontSize: "10px", fontWeight: "800", color: "#ef4444", marginBottom: "4px" }}>HIGH RANGE</p>
          <p style={{ fontSize: "16px", fontWeight: "800", color: theme.text }}>{formatPrice(cost_range_high, "USD")}</p>
        </div>
      </div>

      <ConfidenceBar score={confidence_score} theme={theme} />

      <div style={{ marginBottom: "32px" }}>
        <h4 style={{ fontSize: "13px", fontWeight: "800", color: theme.subtext, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>📊</span> COST BREAKDOWN
        </h4>
        <div style={{ height: "240px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: "12px", fontSize: "12px" }}
                formatter={(value) => formatPrice(value, "USD")}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "600", paddingTop: "20px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <PhaseTimeline totalInr={INR_COST} theme={theme} />

      <div style={{
        marginTop: "32px",
        background: isDark ? "linear-gradient(135deg, rgba(59,130,246,0.1), transparent)" : "#f0f9ff",
        borderRadius: "16px",
        padding: "20px",
        border: `1px solid ${theme.accent}33`,
      }}>
        <h4 style={{ fontSize: "13px", fontWeight: "800", color: theme.accent, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🤖</span> AI INSIGHT
        </h4>
        <p style={{ fontSize: "13.5px", color: theme.text, lineHeight: "1.6", fontWeight: "500" }}>{explanation}</p>

        {anomalies && anomalies.length > 0 && (
          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${theme.border}` }}>
            {anomalies.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", color: "#ef4444", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                <span>⚠️</span> {a}
              </div>
            ))}
          </div>
        )}
      </div>

      {(derived_distance !== undefined || derived_zone) && (
        <div style={{
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
          borderRadius: "12px",
          padding: "14px",
          marginTop: "24px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
          border: `1px dashed ${theme.border}`
        }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "16px" }}>📍</span>
            <span style={{ fontWeight: "600", color: theme.text, textTransform: "capitalize" }}>{derived_zone} Zone</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "16px" }}>📏</span>
            <span style={{ fontWeight: "700", color: theme.accent }}>{derived_distance?.toFixed(2)} km from center</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionCard;
