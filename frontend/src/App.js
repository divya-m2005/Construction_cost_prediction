import React, { useState, useEffect } from "react";
import InputForm from "./components/InputForm";
import PredictionCard from "./components/PredictionCard";
import MapView from "./components/MapView";
import { getPrediction, checkHealth } from "./services/api";

const STYLES = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    padding: "0 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#fff",
    textDecoration: "none",
  },
  logoText: { fontSize: "18px", fontWeight: "700", letterSpacing: "-0.5px" },
  badge: {
    background: "rgba(37,99,235,0.4)",
    color: "#93c5fd",
    border: "1px solid rgba(147,197,253,0.3)",
    borderRadius: "20px",
    padding: "3px 10px",
    fontSize: "11px",
    fontWeight: "600",
  },
  main: { maxWidth: "1280px", margin: "0 auto", padding: "36px 24px" },
  heroTitle: {
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: "800",
    color: "#fff",
    marginBottom: "12px",
    lineHeight: 1.2,
  },
  heroSub: { fontSize: "16px", color: "#93c5fd", marginBottom: "40px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "start",
  },
  card: {
    background: "rgba(255,255,255,0.97)",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "2px solid #f3f4f6",
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
};

function App() {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [lastInput, setLastInput] = useState(null);

  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    setLastInput(formData);

    try {
      const result = await getPrediction(formData);
      setPrediction(result);
    } catch (err) {
      setError(err.message || "Failed to get prediction. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={STYLES.app}>
      {/* Header */}
      <header style={STYLES.header}>
        <div style={STYLES.logo}>
          <span style={{ fontSize: "24px" }}>🏗️</span>
          <span style={STYLES.logoText}>ConstructCost AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            color: apiStatus === "online" ? "#4ade80" : apiStatus === "offline" ? "#f87171" : "#fbbf24",
            fontSize: "13px",
          }}>
            <div style={{
              ...STYLES.statusDot,
              background: apiStatus === "online" ? "#4ade80" : apiStatus === "offline" ? "#f87171" : "#fbbf24",
              boxShadow: `0 0 6px ${apiStatus === "online" ? "#4ade80" : "#fbbf24"}`,
            }} />
            API {apiStatus}
          </div>
          <span style={STYLES.badge}>ML Powered</span>
        </div>
      </header>

      {/* Main */}
      <main style={STYLES.main}>
        <h1 style={STYLES.heroTitle}>
          Predict Construction Costs<br />
          <span style={{ color: "#60a5fa" }}>with Machine Learning</span>
        </h1>
        <p style={STYLES.heroSub}>
          Enter your project specifications to get an accurate AI-powered cost estimate in seconds.
        </p>

        <div style={STYLES.grid}>
          {/* Left: Input Form */}
          <div style={STYLES.card}>
            <p style={STYLES.cardTitle}>📋 Project Specifications</p>
            {apiStatus === "offline" && (
              <div style={{
                ...STYLES.alert,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
              }}>
                <div style={{ ...STYLES.statusDot, background: "#ef4444" }} />
                Backend API is offline. Start with: <code style={{ marginLeft: "4px" }}>uvicorn app.main:app --reload</code>
              </div>
            )}
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Right: Results */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Prediction Results */}
            <div style={STYLES.card}>
              <p style={STYLES.cardTitle}>💰 Cost Prediction</p>
              {error && (
                <div style={{
                  ...STYLES.alert,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                }}>
                  ❌ {error}
                </div>
              )}
              {!prediction && !error && (
                <div style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#94a3b8",
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔮</div>
                  <p style={{ fontSize: "15px", fontWeight: "600" }}>Ready to Predict</p>
                  <p style={{ fontSize: "13px" }}>Fill in the project details and click "Predict Cost"</p>
                </div>
              )}
              <PredictionCard result={prediction} />
            </div>

            {/* Map View */}
            {(lastInput?.latitude || prediction) && (
              <div style={STYLES.card}>
                <p style={STYLES.cardTitle}>📍 Project Location</p>
                <MapView
                  latitude={lastInput?.latitude}
                  longitude={lastInput?.longitude}
                  predictedCost={prediction?.predicted_cost}
                  projectType={lastInput?.project_type}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "24px",
        color: "rgba(255,255,255,0.4)",
        fontSize: "13px",
        marginTop: "40px",
      }}>
        Construction Cost Prediction System — Powered by Machine Learning & FastAPI
      </footer>
    </div>
  );
}

export default App;
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
