import React, { useState } from 'react';

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
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px',
    },
    th: {
        textAlign: 'left',
        padding: '16px 12px',
        borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
        color: isDark ? '#93c5fd' : '#3b82f6',
        fontSize: '13px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    td: {
        padding: '16px 12px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}`,
        fontSize: '14px',
        color: isDark ? '#e2e8f0' : '#475569',
        fontWeight: '500'
    }
});

const PracticalTools = ({ currentPrediction, currentInput, isDark }) => {
    const [comparisonList, setComparisonList] = useState([]);
    const STYLES = getStyles(isDark);

    const addToComparison = () => {
        if (!currentPrediction) return;
        if (comparisonList.length >= 3) {
            alert("Max 3 projects for comparison");
            return;
        }
        setComparisonList([...comparisonList, { ...currentPrediction, ...currentInput, id: Date.now() }]);
    };

    const generateBOQ = () => {
        if (!currentInput) return null;
        const area = currentInput.area_sqft;
        const floors = currentInput.num_floors;
        return [
            { item: "Cement", qty: `${(area * 0.4 * floors).toFixed(0)} Bags`, unit: "Bag" },
            { item: "Steel", qty: `${(area * 4 * floors).toFixed(0)} kg`, unit: "kg" },
            { item: "Bricks", qty: `${(area * 25 * floors).toFixed(0)} Pcs`, unit: "Pcs" },
            { item: "Sand", qty: `${(area * 1.8 * floors).toFixed(0)} cu.ft`, unit: "cu.ft" },
            { item: "Aggregate", qty: `${(area * 1.3 * floors).toFixed(0)} cu.ft`, unit: "cu.ft" },
        ];
    };

    const boq = generateBOQ();

    return (
        <div style={STYLES.container}>
            {/* Multi-project Comparison */}
            <div style={STYLES.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h2 style={{ ...STYLES.title, marginBottom: 0 }}>📊 Project Comparison</h2>
                    <button
                        onClick={addToComparison}
                        disabled={!currentPrediction}
                        style={{ padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '800', boxShadow: isDark ? 'none' : '0 4px 12px rgba(16,185,129,0.2)' }}
                    >
                        + Add Project
                    </button>
                </div>

                {comparisonList.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={STYLES.table}>
                            <thead>
                                <tr>
                                    <th style={STYLES.th}>Feature</th>
                                    {comparisonList.map((p, i) => <th key={i} style={STYLES.th}>Project {i + 1}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={STYLES.td}>Type</td>
                                    {comparisonList.map((p, i) => <td key={i} style={STYLES.td}>{p.project_type}</td>)}
                                </tr>
                                <tr>
                                    <td style={STYLES.td}>Area (sqft)</td>
                                    {comparisonList.map((p, i) => <td key={i} style={STYLES.td}>{p.area_sqft}</td>)}
                                </tr>
                                <tr>
                                    <td style={STYLES.td}>Quality</td>
                                    {comparisonList.map((p, i) => <td key={i} style={STYLES.td}>{p.quality_grade}</td>)}
                                </tr>
                                <tr>
                                    <td style={{ ...STYLES.td, fontWeight: '800', color: isDark ? '#4ade80' : '#16a34a' }}>Total Cost</td>
                                    {comparisonList.map((p, i) => <td key={i} style={{ ...STYLES.td, fontWeight: '800', color: isDark ? '#4ade80' : '#16a34a' }}>₹{(p.predicted_cost / 100000).toFixed(2)}L</td>)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : <p style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '14px', fontWeight: '500' }}>No projects added for comparison yet.</p>}
            </div>

            {/* BOQ Generator */}
            <div style={STYLES.section}>
                <h2 style={STYLES.title}>📝 Bill of Quantities</h2>
                {boq ? (
                    <table style={STYLES.table}>
                        <thead>
                            <tr>
                                <th style={STYLES.th}>Material Item</th>
                                <th style={STYLES.th}>Quantity</th>
                                <th style={STYLES.th}>Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {boq.map((item, i) => (
                                <tr key={i}>
                                    <td style={STYLES.td}>{item.item}</td>
                                    <td style={STYLES.td}>{item.qty}</td>
                                    <td style={STYLES.td}>{item.unit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Predict a cost to see material quantities.</p>}
            </div>

            {/* Contractor Database */}
            <div style={STYLES.section}>
                <h2 style={STYLES.title}>👷 Top Contractors</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    {[
                        { name: "Apex Builders", rating: 4.8, rate: "₹1,800/sqft", specialty: "Residential" },
                        { name: "Skyline Infra", rating: 4.5, rate: "₹2,200/sqft", specialty: "Commercial" },
                        { name: "Procon Services", rating: 4.9, rate: "₹1,400/sqft", specialty: "Renovation" }
                    ].map((c, i) => (
                        <div key={i} style={{
                            background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                            padding: '24px',
                            borderRadius: '20px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
                            transition: 'transform 0.2s ease'
                        }}>
                            <div style={{ fontWeight: '800', marginBottom: '8px', fontSize: '18px', color: isDark ? '#fff' : '#1e293b' }}>{c.name}</div>
                            <div style={{ color: '#f59e0b', fontSize: '13px', marginBottom: '12px', fontWeight: '800' }}>⭐ {c.rating} / 5.0</div>
                            <div style={{ fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b', fontWeight: '600' }}>Base Rate: <span style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{c.rate}</span></div>
                            <div style={{ display: 'inline-block', fontSize: '11px', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '4px 10px', borderRadius: '8px', marginTop: '12px', fontWeight: '800', textTransform: 'uppercase' }}>{c.specialty}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PracticalTools;
