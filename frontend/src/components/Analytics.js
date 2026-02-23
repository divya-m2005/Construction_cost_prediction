import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getPrediction } from '../services/api';

const getStyles = (isDark) => ({
  container: {
    padding: '20px',
    color: isDark ? '#f8fafc' : '#1e293b',
  },
  section: {
    background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`,
    boxShadow: isDark ? 'none' : '0 10px 30px rgba(0,0,0,0.04)',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    marginBottom: '24px',
    color: isDark ? '#60a5fa' : '#2563eb',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sliderContainer: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '10px',
    color: isDark ? '#94a3b8' : '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    outline: 'none',
    WebkitAppearance: 'none',
    accentColor: '#3b82f6'
  },
  resultBox: {
    padding: '24px',
    background: isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(59, 130, 246, 0.05)',
    borderRadius: '20px',
    border: '1px solid rgba(37, 99, 235, 0.2)',
    textAlign: 'center',
  },
  costText: {
    fontSize: '32px',
    fontWeight: '900',
    color: isDark ? '#4ade80' : '#16a34a',
    margin: '8px 0'
  },
  input: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
    color: isDark ? '#fff' : '#1e293b',
    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    outline: 'none',
    fontSize: '15px'
  }
});

const Analytics = ({ isDark }) => {
  const [trends, setTrends] = useState(null);
  const [whatIfData, setWhatIfData] = useState({
    area_sqft: 2000,
    num_floors: 2,
    quality_grade: 'standard',
    project_type: 'residential',
    location_zone: 'suburban',
    foundation_type: 'slab',
    wall_material: 'brick',
    roof_type: 'gable',
    has_basement: false,
    has_parking: false,
    soil_type: 'loamy',
    distance_to_city_center: 10,
  });
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const STYLES = getStyles(isDark);

  useEffect(() => {
    fetchTrendData();
    calculateWhatIf();
  }, []);

  const handleOptimize = async (budget) => {
    if (!budget) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/analytics/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: parseFloat(budget) })
      });
      const data = await response.json();
      setOptimizationResults(data.suggestions);
    } catch (error) {
      console.error("Optimization failed", error);
    }
  };


  const fetchTrendData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/analytics/trend');
      const data = await response.json();
      const chartData = data.overall.map((item, index) => ({
        month: item.month,
        Overall: item.index,
        Cement: data.cement[index].index,
        Steel: data.steel[index].index,
        Brick: data.brick[index].index,
      }));
      setTrends(chartData);
    } catch (error) {
      console.error("Failed to fetch trends", error);
    }
  };


  const calculateWhatIf = async (updatedData = whatIfData) => {
    setLoading(true);
    try {
      const result = await getPrediction(updatedData);
      setWhatIfResult(result);
    } catch (error) {
      console.error("What-If simulation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIfChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : (type === 'range' || type === 'number' ? parseFloat(value) : value);
    const updated = { ...whatIfData, [name]: newVal };
    setWhatIfData(updated);
    calculateWhatIf(updated);
  };

  return (
    <div style={STYLES.container}>
      {/* What-If Simulator */}
      <div style={STYLES.section}>
        <h2 style={STYLES.title}><span>🔄</span> What-If Cost Simulator</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          <div>
            <div style={STYLES.sliderContainer}>
              <label style={STYLES.label}>🏗️ Total Area: {whatIfData.area_sqft} sq ft</label>
              <input
                type="range"
                name="area_sqft"
                min="500"
                max="50000"
                step="100"
                value={whatIfData.area_sqft}
                onChange={handleWhatIfChange}
                style={STYLES.slider}
              />
            </div>
            <div style={STYLES.sliderContainer}>
              <label style={STYLES.label}>🏢 Floors: {whatIfData.num_floors}</label>
              <input
                type="range"
                name="num_floors"
                min="1"
                max="50"
                step="1"
                value={whatIfData.num_floors}
                onChange={handleWhatIfChange}
                style={STYLES.slider}
              />
            </div>
            <div style={STYLES.sliderContainer}>
              <label style={STYLES.label}>💎 Quality Grade</label>
              <select
                name="quality_grade"
                value={whatIfData.quality_grade}
                onChange={handleWhatIfChange}
                style={STYLES.input}
              >
                <option value="economy">Economy</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={STYLES.resultBox}>
              <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Estimated Cost</p>
              {loading ? (
                <p style={STYLES.costText}>Calculating...</p>
              ) : (
                <p style={STYLES.costText}>
                  ₹{(whatIfResult?.predicted_cost / 100000).toFixed(2)} Lakhs
                </p>
              )}
              <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}>
                Confidence: {Math.round((whatIfResult?.confidence_score || 0) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Optimizer */}
      <div style={STYLES.section}>
        <h2 style={STYLES.title}><span>💰</span> AI Budget Optimizer</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ flex: 3, minWidth: '280px' }}>
            <label style={STYLES.label}>Target Budget (₹)</label>
            <input
              type="number"
              placeholder="e.g. 50,00,000"
              style={STYLES.input}
              onBlur={(e) => handleOptimize(e.target.value)}
            />
          </div>
          <button
            style={{ flex: 1, padding: '15px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer', minWidth: '160px' }}
          >
            Find Options
          </button>
        </div>

        {optimizationResults && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {optimizationResults.map((opt, idx) => (
              <div key={idx} style={{
                ...STYLES.resultBox,
                textAlign: 'left',
                margin: 0,
                background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                borderTop: `4px solid ${idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#f59e0b'}`
              }}>
                <h4 style={{ color: isDark ? '#fff' : '#1e293b', marginBottom: '8px', fontSize: '18px', fontWeight: '800' }}>{opt.label}</h4>
                <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>{opt.description}</p>
                <div style={{ fontSize: '14px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`, paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Area:</span>
                    <span style={{ color: theme => isDark ? '#fff' : '#1e293b', fontWeight: '700' }}>{opt.area_sqft.toLocaleString()} sqft</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Quality:</span>
                    <span style={{ color: theme => isDark ? '#fff' : '#1e293b', fontWeight: '700', textTransform: 'capitalize' }}>{opt.quality_grade}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Floors:</span>
                    <span style={{ color: theme => isDark ? '#fff' : '#1e293b', fontWeight: '700' }}>{opt.floors}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cost Trend Forecasting */}
      <div style={STYLES.section}>
        <h2 style={STYLES.title}><span>📈</span> Cost Trends & Forecast</h2>
        <div style={{ height: '350px', width: '100%', marginTop: '20px' }}>
          {trends ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="month" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} fontWeight="600" />
                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={11} fontWeight="600" />
                <Tooltip
                  contentStyle={{
                    background: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    color: isDark ? '#fff' : '#1e293b'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: '700' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '700' }} />
                <Line type="monotone" dataKey="Overall" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Cement" stroke="#f87171" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Steel" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Brick" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: isDark ? '#64748b' : '#94a3b8', fontSize: '14px', fontWeight: '600' }}>
              <div style={{ animation: 'pulse 2s infinite' }}>📊 Loading Intelligence...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
