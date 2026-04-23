import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CompanyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompanyDetails();
    }, [id]);

    const fetchCompanyDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/company/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompany(response.data.data);
        } catch (error) {
            console.error('Error:', error);
            // Demo data
            setCompany({
                _id: id,
                companyName: 'Tech Solutions India Pvt Ltd',
                registrationNumber: 'U72900MH2020PTC123456',
                gstin: '27AAACT1234F1Z',
                pan: 'AAACT1234F',
                financials: { annualTurnover: { current: 25000000 }, netWorth: 5000000, profitAfterTax: 1500000 },
                certifications: [{ name: 'ISO 9001:2015' }, { name: 'MSME Registration' }],
                operationalLocations: [{ state: 'Maharashtra', city: 'Mumbai', hasOffice: true }],
                teamCapabilities: { totalEmployees: 150, technicalStaff: 85, projectManagers: 12 }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        // Go back to previous page
        navigate(-1);
    };

    const formatCurrency = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Crore`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh`;
        return `₹${amount?.toLocaleString() || 0}`;
    };

    const styles = {
        container: {
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '30px 20px'
        },
        loadingContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            color: '#666'
        },
        spinner: {
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
        },
        backButton: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'white',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '25px',
            transition: 'all 0.3s ease'
        },
        headerCard: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '24px',
            padding: '40px',
            marginBottom: '30px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        },
        companyIcon: {
            fontSize: '48px',
            marginBottom: '15px'
        },
        companyName: {
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '10px'
        },
        companyId: {
            fontSize: '14px',
            opacity: 0.8
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '30px'
        },
        statCard: {
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        },
        statValue: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#667eea'
        },
        statLabel: {
            fontSize: '12px',
            color: '#666',
            marginTop: '5px'
        },
        twoColumn: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '25px',
            marginBottom: '25px'
        },
        card: {
            background: 'white',
            borderRadius: '20px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        },
        sectionTitle: {
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderLeft: '4px solid #667eea',
            paddingLeft: '12px'
        },
        infoRow: {
            display: 'flex',
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0'
        },
        infoLabel: {
            width: '140px',
            fontWeight: '500',
            color: '#666'
        },
        infoValue: {
            flex: 1,
            color: '#333',
            fontWeight: '500'
        },
        tag: {
            display: 'inline-block',
            background: '#e8f0fe',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            margin: '4px',
            color: '#667eea'
        },
        locationItem: {
            padding: '10px',
            marginBottom: '10px',
            background: '#f8f9fa',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        gradientBg: {
            position: 'absolute',
            top: -50,
            right: -50,
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading company details...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

            {/* Back Button - Fixed */}
            <button onClick={handleBack} style={styles.backButton}>
                ← Back to Companies
            </button>

            <div style={styles.headerCard}>
                <div style={styles.gradientBg}></div>
                <div style={styles.companyIcon}>🏢</div>
                <h1 style={styles.companyName}>{company?.companyName}</h1>
                <p style={styles.companyId}>ID: {company?._id?.slice(-8)}</p>
            </div>

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{formatCurrency(company?.financials?.annualTurnover?.current)}</div>
                    <div style={styles.statLabel}>Annual Turnover</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{formatCurrency(company?.financials?.netWorth)}</div>
                    <div style={styles.statLabel}>Net Worth</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{company?.teamCapabilities?.totalEmployees || 0}</div>
                    <div style={styles.statLabel}>Employees</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{company?.certifications?.length || 0}</div>
                    <div style={styles.statLabel}>Certifications</div>
                </div>
            </div>

            <div style={styles.twoColumn}>
                <div>
                    <div style={styles.card}>
                        <h3 style={styles.sectionTitle}>📋 Basic Information</h3>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Registration No:</span>
                            <span style={styles.infoValue}>{company?.registrationNumber || 'N/A'}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>GSTIN:</span>
                            <span style={styles.infoValue}>{company?.gstin || 'N/A'}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>PAN:</span>
                            <span style={styles.infoValue}>{company?.pan || 'N/A'}</span>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.sectionTitle}>💰 Financial Details</h3>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Annual Turnover:</span>
                            <span style={styles.infoValue}>{formatCurrency(company?.financials?.annualTurnover?.current)}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Net Worth:</span>
                            <span style={styles.infoValue}>{formatCurrency(company?.financials?.netWorth)}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Profit After Tax:</span>
                            <span style={styles.infoValue}>{formatCurrency(company?.financials?.profitAfterTax)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div style={styles.card}>
                        <h3 style={styles.sectionTitle}>👥 Team Capabilities</h3>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Total Employees:</span>
                            <span style={styles.infoValue}>{company?.teamCapabilities?.totalEmployees || 0}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Technical Staff:</span>
                            <span style={styles.infoValue}>{company?.teamCapabilities?.technicalStaff || 0}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Project Managers:</span>
                            <span style={styles.infoValue}>{company?.teamCapabilities?.projectManagers || 0}</span>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.sectionTitle}>📜 Certifications</h3>
                        {company?.certifications?.length > 0 ? (
                            company.certifications.map((cert, idx) => (
                                <span key={idx} style={styles.tag}>✓ {cert.name}</span>
                            ))
                        ) : (
                            <p style={{ color: '#666' }}>No certifications</p>
                        )}
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.sectionTitle}>📍 Operational Locations</h3>
                        {company?.operationalLocations?.length > 0 ? (
                            company.operationalLocations.map((loc, idx) => (
                                <div key={idx} style={styles.locationItem}>
                                    <span>📍</span>
                                    <span><strong>{loc.city}</strong>, {loc.state}</span>
                                    {loc.hasOffice && <span style={styles.tag}>Office</span>}
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#666' }}>No locations</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailPage;