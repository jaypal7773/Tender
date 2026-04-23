import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const TenderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [tender, setTender] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchTenderDetails();
        }
    }, [id]);

    const fetchTenderDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/tenders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setTender(response.data.data);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to load tender details');
            // Demo data
            setTender({
                _id: id,
                title: "IT Hardware Supply",
                description: "Supply of 500 desktop computers, 100 laptops, and 50 printers with 3 years warranty.",
                estimatedValue: { amount: 25000000, currency: "INR" },
                emdAmount: 500000,
                tenderFee: 5000,
                category: "IT Software",
                bidSubmissionDeadline: "2024-03-15",
                publishedDate: "2024-02-15",
                status: "active",
                eligibilityScore: 85,
                scoreBreakdown: {
                    financial: 80,
                    technical: 90,
                    experience: 85,
                    compliance: 95
                },
                scoreReasons: [
                    "Financial criteria met - Turnover exceeds requirement",
                    "Technical capabilities sufficient - Certified team available",
                    "Relevant experience found - Similar projects completed",
                    "Compliance requirements satisfied - All documents verified"
                ],
                eligibilityCriteria: {
                    minTurnover: 10000000,
                    requiredCertifications: ["ISO 9001:2015", "MSME Registration"],
                    experienceYears: 3,
                    locationConstraints: ["Maharashtra", "Mumbai"],
                    msmeBenefits: true,
                    startupBenefits: false
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Crore`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh`;
        return `₹${amount?.toLocaleString() || 0}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // ============ STYLES - MOVED BEFORE RETURN ============
    const styles = {
        container: {
            maxWidth: '1200px',
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
        errorContainer: {
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '20px',
            margin: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        },
        errorIcon: {
            fontSize: '64px',
            marginBottom: '20px'
        },
        button: {
            padding: '10px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '20px'
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
            marginBottom: '25px'
        },
        headerCard: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '24px',
            padding: '30px',
            marginBottom: '25px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        },
        title: {
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '15px'
        },
        description: {
            fontSize: '16px',
            lineHeight: '1.6',
            opacity: 0.95,
            marginBottom: '20px'
        },
        statusBadge: {
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '13px',
            fontWeight: '600',
            background: 'rgba(255,255,255,0.2)'
        },
        scoreCard: {
            background: 'white',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            textAlign: 'center'
        },
        scoreValue: {
            fontSize: '56px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
        },
        scoreLabel: {
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px'
        },
        breakdownGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '15px',
            marginTop: '20px'
        },
        breakdownItem: {
            textAlign: 'center',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '12px'
        },
        breakdownValue: {
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#667eea'
        },
        breakdownLabel: {
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
            background: '#f0f4ff',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            margin: '2px',
            color: '#667eea'
        },
        reasonItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            marginBottom: '10px',
            background: '#f8f9fa',
            borderRadius: '12px'
        },
        reasonIcon: {
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#4caf50',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
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

    // Loading state
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading tender details...</p>
            </div>
        );
    }

    // Error state
    if (error && !tender) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorIcon}>⚠️</div>
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/tenders')} style={styles.button}>Back to Tenders</button>
            </div>
        );
    }

    // Main render
    return (
        <div style={styles.container}>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

            {/* Back Button */}
            <button onClick={() => navigate('/tenders')} style={styles.backButton}>
                ← Back to Tenders
            </button>

            {/* Header Card */}
            <div style={styles.headerCard}>
                <div style={styles.gradientBg}></div>
                <h1 style={styles.title}>{tender?.title}</h1>
                <p style={styles.description}>{tender?.description}</p>
                <span style={styles.statusBadge}>
                    {tender?.status === 'active' ? '● Active' : '● Expired'}
                </span>
            </div>

            {/* Score Section */}
            {tender?.eligibilityScore > 0 && (
                <div style={styles.scoreCard}>
                    <div style={styles.scoreValue}>{tender.eligibilityScore}%</div>
                    <div style={styles.scoreLabel}>Overall Eligibility Score</div>
                    {tender.scoreBreakdown && (
                        <div style={styles.breakdownGrid}>
                            <div style={styles.breakdownItem}>
                                <div style={styles.breakdownValue}>{tender.scoreBreakdown.financial}%</div>
                                <div style={styles.breakdownLabel}>Financial</div>
                            </div>
                            <div style={styles.breakdownItem}>
                                <div style={styles.breakdownValue}>{tender.scoreBreakdown.technical}%</div>
                                <div style={styles.breakdownLabel}>Technical</div>
                            </div>
                            <div style={styles.breakdownItem}>
                                <div style={styles.breakdownValue}>{tender.scoreBreakdown.experience}%</div>
                                <div style={styles.breakdownLabel}>Experience</div>
                            </div>
                            <div style={styles.breakdownItem}>
                                <div style={styles.breakdownValue}>{tender.scoreBreakdown.compliance}%</div>
                                <div style={styles.breakdownLabel}>Compliance</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Two Column Layout */}
            <div style={styles.twoColumn}>
                {/* Left Column */}
                <div>
                    {/* Basic Information */}
                    <div style={styles.card}>
                        <h3 style={styles.sectionTitle}>📋 Basic Information</h3>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Tender ID:</span>
                            <span style={styles.infoValue}>{tender?._id?.slice(-8)}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Category:</span>
                            <span style={styles.infoValue}>{tender?.category || 'N/A'}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Published Date:</span>
                            <span style={styles.infoValue}>{formatDate(tender?.publishedDate)}</span>
                        </div>
                    </div>

                    {/* Financial Details */}
                    <div style={styles.card}>
                        <h3 style={styles.sectionTitle}>💰 Financial Details</h3>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Estimated Value:</span>
                            <span style={styles.infoValue}>{formatCurrency(tender?.estimatedValue?.amount)}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>EMD Amount:</span>
                            <span style={styles.infoValue}>{formatCurrency(tender?.emdAmount) || 'N/A'}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Tender Fee:</span>
                            <span style={styles.infoValue}>{formatCurrency(tender?.tenderFee) || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    {/* Timeline */}
                    <div style={styles.card}>
                        <h3 style={styles.sectionTitle}>📅 Timeline</h3>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Submission Deadline:</span>
                            <span style={styles.infoValue}>{formatDate(tender?.bidSubmissionDeadline)}</span>
                        </div>
                    </div>

                    {/* Eligibility Criteria */}
                    {tender?.eligibilityCriteria && (
                        <div style={styles.card}>
                            <h3 style={styles.sectionTitle}>✅ Eligibility Criteria</h3>
                            {tender.eligibilityCriteria.minTurnover && (
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Min Turnover:</span>
                                    <span style={styles.infoValue}>{formatCurrency(tender.eligibilityCriteria.minTurnover)}</span>
                                </div>
                            )}
                            {tender.eligibilityCriteria.experienceYears && (
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Experience Required:</span>
                                    <span style={styles.infoValue}>{tender.eligibilityCriteria.experienceYears} years</span>
                                </div>
                            )}
                            {tender.eligibilityCriteria.requiredCertifications?.length > 0 && (
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Certifications:</span>
                                    <span style={styles.infoValue}>
                                        {tender.eligibilityCriteria.requiredCertifications.map((cert, i) => (
                                            <span key={i} style={styles.tag}>{cert}</span>
                                        ))}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Reasons Section */}
            {tender?.scoreReasons && tender.scoreReasons.length > 0 && (
                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>📊 Analysis Summary</h3>
                    {tender.scoreReasons.map((reason, index) => (
                        <div key={index} style={styles.reasonItem}>
                            <div style={styles.reasonIcon}>✓</div>
                            <span>{reason}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TenderDetailPage;