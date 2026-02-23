import React, { useState, useEffect, useRef } from "react";
import InputForm from "./components/InputForm";
import PredictionCard from "./components/PredictionCard";
import MapView from "./components/MapView";
import Analytics from "./components/Analytics";
import Reports from "./components/Reports";
import Chatbot from "./components/Chatbot";
import PracticalTools from "./components/PracticalTools";
import { getPrediction, checkHealth } from "./services/api";

const THEMES = {
  light: {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cardBg: "#ffffff",
    text: "#1e293b",
    subtext: "#64748b",
    border: "rgba(0,0,0,0.08)",
    accent: "#3b82f6",
    headerBg: "rgba(255,255,255,0.8)",
    footerText: "rgba(0,0,0,0.5)",
    shadow: "0 10px 30px rgba(0,0,0,0.05)",
  },
  dark: {
    background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
    cardBg: "#1e293b",
    text: "#f8fafc",
    subtext: "#94a3b8",
    border: "rgba(255,255,255,0.08)",
    accent: "#60a5fa",
    headerBg: "rgba(15,23,42,0.8)",
    footerText: "rgba(255,255,255,0.4)",
    shadow: "0 20px 60px rgba(0,0,0,0.3)",
  }
};

const getStyles = (theme, isDark) => ({
  app: {
    minHeight: "100vh",
    background: theme.background,
    color: theme.text,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    transition: "background 0.3s ease, color 0.3s ease",
  },
  header: {
    background: theme.headerBg,
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${theme.border}`,
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "72px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.03)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: theme.text,
    textDecoration: "none",
  },
  logoText: { fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px" },
  themeBtn: {
    background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    border: `1px solid ${theme.border}`,
    color: theme.text,
    padding: "8px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  badge: {
    background: isDark ? "rgba(96,165,250,0.2)" : "rgba(59,130,246,0.15)",
    color: theme.accent,
    border: `1px solid ${isDark ? "rgba(96,165,250,0.3)" : "rgba(59,130,246,0.2)"}`,
    borderRadius: "20px",
    padding: "3px 12px",
    fontSize: "12px",
    fontWeight: "700",
  },
  main: { maxWidth: "1400px", margin: "0 auto", padding: "48px 24px" },
  heroTitle: {
    fontSize: "clamp(32px, 5vw, 48px)",
    fontWeight: "800",
    color: theme.text,
    marginBottom: "16px",
    lineHeight: 1.1,
  },
  heroSub: { fontSize: "17px", color: theme.subtext, marginBottom: "48px", maxWidth: "600px" },

  // Layout Tiers
  topTier: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
    marginBottom: "32px",
    alignItems: "stretch",
  },
  bottomTier: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  resultContainer: {
    maxWidth: "900px",
    width: "100%",
  },

  card: {
    background: theme.cardBg,
    borderRadius: "24px",
    padding: "32px",
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`,
    height: "100%",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: theme.subtext,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "40px",
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    padding: "6px",
    borderRadius: "16px",
    width: "fit-content",
  },
  tab: (active) => ({
    padding: "10px 24px",
    borderRadius: "12px",
    background: active ? theme.cardBg : "transparent",
    border: "none",
    boxShadow: active ? theme.shadow : "none",
    color: active ? theme.accent : theme.subtext,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  }),
});


function App() {
  const [isDark, setIsDark] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [lastInput, setLastInput] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState({ latitude: "", longitude: "" });
  const [activeTab, setActiveTab] = useState("calculator");
  const [aiFillData, setAiFillData] = useState(null);

  const theme = isDark ? THEMES.dark : THEMES.light;
  const STYLES = getStyles(theme, isDark);
  const lastInputRef = useRef(null);

  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setLastInput(formData);
    lastInputRef.current = formData;
    try {
      const result = await getPrediction(formData);
      setPrediction(result);
    } catch (err) {
      setError(err.message || "Failed to get prediction.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setSelectedCoords({ latitude: lat, longitude: lng });
    const currentInput = lastInputRef.current;
    if (!currentInput) return;

    const updatedInput = { ...currentInput, latitude: parseFloat(lat), longitude: parseFloat(lng) };
    lastInputRef.current = updatedInput;
    setLastInput(updatedInput);
    setIsLoading(true);
    setError(null);

    getPrediction(updatedInput)
      .then((result) => setPrediction(result))
      .catch((err) => setError(err.message || "Prediction failed"))
      .finally(() => setIsLoading(false));
  };

  return (
    <div style={STYLES.app}>
      <header style={STYLES.header}>
        <div style={STYLES.logo}>
          <div style={{
            width: "40px", height: "40px", background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
          }}>🏗️</div>
          <span style={STYLES.logoText}>ConstructCost AI</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            color: apiStatus === "online" ? "#4ade80" : "#f87171",
            fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px"
          }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: apiStatus === "online" ? "#4ade80" : "#f87171",
              boxShadow: `0 0 8px ${apiStatus === "online" ? "#4ade80" : "#f87171"}`,
            }} />
            API {apiStatus}
          </div>

          <button style={STYLES.themeBtn} onClick={() => setIsDark(!isDark)}>
            {isDark ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>

          <span style={STYLES.badge}>V 2.0</span>
        </div>
      </header>

      <main style={STYLES.main}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={STYLES.heroTitle}>
            Construction Cost <br />
            <span style={{ background: "linear-gradient(to right, #60a5fa, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Estimation Redefined</span>
          </h1>
          <p style={{ ...STYLES.heroSub, margin: "0 auto" }}>
            Precision engineering meets machine learning. Get professional-grade estimates for your next project in seconds.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={STYLES.tabs}>
            <button style={STYLES.tab(activeTab === "calculator")} onClick={() => setActiveTab("calculator")}>
              📊 Calculator
            </button>
            <button style={STYLES.tab(activeTab === "analytics")} onClick={() => setActiveTab("analytics")}>
              📈 Analytics
            </button>
            <button style={STYLES.tab(activeTab === "tools")} onClick={() => setActiveTab("tools")}>
              📱 Tools
            </button>
          </div>
        </div>

        {activeTab === "calculator" ? (
          <div id="calculator-layout">
            <div id="top-tier" style={STYLES.topTier}>
              <div style={STYLES.card}>
                <p style={STYLES.cardTitle}><span>📋</span> Project Specifications</p>
                <InputForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  selectedCoords={selectedCoords}
                  aiFill={aiFillData}
                  isDark={isDark}
                  theme={theme}
                />
              </div>

              <div style={STYLES.card}>
                <p style={STYLES.cardTitle}><span>📍</span> Project Location</p>
                <MapView
                  latitude={lastInput?.latitude}
                  longitude={lastInput?.longitude}
                  predictedCost={prediction?.predicted_cost}
                  projectType={lastInput?.project_type}
                  onLocationSelect={handleLocationSelect}
                  isDark={isDark}
                />
              </div>
            </div>

            <div id="bottom-tier" style={STYLES.bottomTier}>
              <div style={{ ...STYLES.card, ...STYLES.resultContainer }}>
                <p style={STYLES.cardTitle}><span>💰</span> Prediction Result</p>
                {error && <div style={{ color: "#ef4444", padding: "12px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", fontSize: "14px", marginBottom: "20px" }}>❌ {error}</div>}
                {isLoading ? (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div style={{ fontSize: "40px", animation: "spin 2s linear infinite" }}>⏳</div>
                    <p style={{ marginTop: "16px", fontWeight: "600", opacity: 0.7 }}>Analyzing Data...</p>
                  </div>
                ) : prediction ? (
                  <div style={{ textAlign: "center" }}>
                    <PredictionCard result={prediction} isDark={isDark} theme={theme} />
                    <div style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
                      <Reports prediction={prediction} projectData={lastInput} />
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: theme.subtext }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>🔮</div>
                    <p style={{ fontWeight: "600" }}>Ready to Predict</p>
                    <p style={{ fontSize: "14px" }}>Fill the specifications above to see results</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "analytics" ? (
          <Analytics isDark={isDark} />
        ) : (
          <PracticalTools currentPrediction={prediction} currentInput={lastInput} isDark={isDark} />
        )}

        <Chatbot onSystemFill={(data) => {
          setAiFillData(data);
          setActiveTab("calculator");
        }} isDark={isDark} />
      </main>

      <footer style={{
        textAlign: "center", padding: "60px 40px", borderTop: `1px solid ${theme.border}`,
        marginTop: "80px", background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)"
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "24px" }}>
          {["Privacy", "Terms", "Documentation", "Support"].map(item => (
            <a key={item} href="#" style={{ color: theme.subtext, textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>{item}</a>
          ))}
        </div>
        <p style={{ color: theme.footerText, fontSize: "13px", fontWeight: "500" }}>
          © 2025 ConstructCost AI. All rights reserved. <br />
          Built with Precision & ML.
        </p>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:hover { transform: translateY(-1px); opacity: 0.9; }
        button:active { transform: translateY(0); }
        
        @media (max-width: 1024px) {
          #top-tier {
            grid-template-columns: 1fr !important;
          }
          #bottom-tier {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default App;