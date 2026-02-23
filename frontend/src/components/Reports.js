import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const REPORT_STYLES = {
    container: {
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '20px',
    },
    title: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#fff',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
    },
    button: {
        flex: 1,
        padding: '12px',
        borderRadius: '10px',
        border: 'none',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s',
    },
    pdfBtn: { background: '#ef4444', color: '#fff' },
    excelBtn: { background: '#22c55e', color: '#fff' },
    shareBtn: { background: '#6366f1', color: '#fff' },
};

const Reports = ({ prediction, projectData }) => {
    if (!prediction) return null;

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(30, 58, 95);
        doc.text('Construction Cost Estimate Report', 14, 22);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Project Details Table
        autoTable(doc, {
            startY: 40,
            head: [['Specification', 'Details']],
            body: [
                ['Project Type', projectData.project_type],
                ['Total Area', `${projectData.area_sqft} sq ft`],
                ['Number of Floors', projectData.num_floors],
                ['Quality Grade', projectData.quality_grade],
                ['Location Zone', projectData.location_zone],
                ['Wall Material', projectData.wall_material],
            ],
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });

        // Cost Prediction Table
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Cost Metric', 'Estimated Value']],
            body: [
                ['Total Estimated Cost', `INR ${prediction.predicted_cost.toLocaleString()}`],
                ['Cost per Sq Ft', `INR ${prediction.cost_per_sqft.toLocaleString()}`],
                ['Confidence Score', `${(prediction.confidence_score * 100).toFixed(1)}%`],
            ],
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] }
        });

        // Breakdown Table
        const breakdownData = Object.entries(prediction.breakdown).map(([k, v]) => [k, `INR ${v.toLocaleString()}`]);
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Component Breakdown', 'Cost']],
            body: breakdownData,
            theme: 'plain'
        });

        doc.save(`Cost_Estimate_${projectData.project_type}.pdf`);
    };

    const generateExcel = () => {
        const wsData = [
            ['Construction Cost Estimate Report'],
            ['Date', new Date().toLocaleDateString()],
            [],
            ['Project Specifications'],
            ['Type', projectData.project_type],
            ['Area', projectData.area_sqft],
            ['Floors', projectData.num_floors],
            ['Quality', projectData.quality_grade],
            [],
            ['Cost Prediction'],
            ['Total Cost', prediction.predicted_cost],
            ['Cost per Sqft', prediction.cost_per_sqft],
            [],
            ['Component Breakdown'],
            ...Object.entries(prediction.breakdown)
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Estimate');
        XLSX.writeFile(wb, `Cost_Estimate_${projectData.project_type}.xlsx`);
    };

    const handleShare = () => {
        const summary = `Construction Estimate for ${projectData.area_sqft} sqft ${projectData.project_type}: INR ${prediction.predicted_cost.toLocaleString()}`;
        if (navigator.share) {
            navigator.share({
                title: 'Construction Cost Estimate',
                text: summary,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(`${summary}\nGenerated at: ${window.location.href}`);
            alert('Estimate summary and link copied to clipboard!');
        }
    };

    return (
        <div style={REPORT_STYLES.container}>
            <h3 style={REPORT_STYLES.title}>📄 Reports & Export</h3>
            <div style={REPORT_STYLES.buttonGroup}>
                <button onClick={generatePDF} style={{ ...REPORT_STYLES.button, ...REPORT_STYLES.pdfBtn }}>
                    <span>📥</span> PDF Report
                </button>
                <button onClick={generateExcel} style={{ ...REPORT_STYLES.button, ...REPORT_STYLES.excelBtn }}>
                    <span>📊</span> Excel Export
                </button>
                <button onClick={handleShare} style={{ ...REPORT_STYLES.button, ...REPORT_STYLES.shareBtn }}>
                    <span>🔗</span> Share Link
                </button>
            </div>
        </div>
    );
};

export default Reports;
