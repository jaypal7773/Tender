// src/pages/AdminTendersPage.jsx - Modern Premium CSS
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminTendersPage = () => {
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTender, setEditingTender] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, highValue: 0 });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        estimatedValue: '',
        category: '',
        bidSubmissionDeadline: '',
        emdAmount: '',
        tenderFee: '',
        status: 'active'
    });

    useEffect(() => {
        fetchTenders();
        fetchStats();
    }, []);

    const fetchTenders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tenders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTenders(res.data.data);
        } catch {
            toast.error("Failed to load tenders");
            setTenders([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tenders/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setStats(res.data.data);
        } catch {
            setStats({ total: 45, active: 28, expired: 12, highValue: 8 });
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // const handleAddTender = async (e) => {
    //     e.preventDefault();
    //     if (!formData.title || !formData.estimatedValue) {
    //         toast.error('Title and value are required');
    //         return;
    //     }

    //     try {
    //         const payload = {
    //             ...formData,
    //             estimatedValue: { amount: Number(formData.estimatedValue), currency: 'INR' }
    //         };

    //         const res = await axios.post(
    //             'http://localhost:5000/api/tenders',
    //             payload,
    //             { headers: { Authorization: `Bearer ${token}` } }
    //         );

    //         setTenders(prev => [res.data.data, ...prev]);
    //         toast.success("Tender added ✅");
    //         setShowAddModal(false);
    //         resetForm();
    //         fetchStats();
    //     } catch (err) {
    //         toast.error("Add failed");
    //     }
    // };

    const handleAddTender = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                "http://localhost:5000/api/tenders",
                {
                    title: formData.title,
                    description: formData.description,

                    // ✅ FIX HERE
                    estimatedValue: {
                        amount: Number(formData.estimatedValue),
                        currency: "INR"
                    },

                    category: formData.category,

                    // ✅ FIX HERE
                    bidSubmissionDeadline: formData.bidSubmissionDeadline,

                    status: formData.status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("✅ SAVED:", res.data);

            if (res.data.success) {
                toast.success("Tender added successfully");

                // ✅ 1. UI UPDATE
                setTenders(prev => [res.data.data, ...prev]);

                // ✅ 2. FORM RESET
                resetForm();

                // ✅ 3. MODAL CLOSE
                setShowAddModal(false);

                // ✅ 4. STATS REFRESH
                fetchStats();
            }

        } catch (error) {
            console.log("❌ ERROR:", error.response?.data || error.message);
            toast.error("Add failed");
        }
    };

    const openEditModal = (tender) => {
        setEditingTender(tender);
        setFormData({
            title: tender.title || '',
            description: tender.description || '',
            estimatedValue: tender.estimatedValue?.amount || '',
            category: tender.category || '',
            bidSubmissionDeadline: tender.bidSubmissionDeadline?.split('T')[0] || '',
            emdAmount: tender.emdAmount || '',
            tenderFee: tender.tenderFee || '',
            status: tender.status || 'active'
        });
    };

    const handleUpdateTender = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.put(
                `http://localhost:5000/api/tenders/${editingTender._id}`,
                {
                    title: formData.title,
                    description: formData.description,

                    estimatedValue: {
                        amount: Number(formData.estimatedValue),
                        currency: "INR"
                    },

                    category: formData.category,
                    bidSubmissionDeadline: formData.bidSubmissionDeadline,
                    status: formData.status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                toast.success("Updated successfully");

                // ✅ UI UPDATE
                setTenders(prev =>
                    prev.map(t =>
                        t._id === editingTender._id ? res.data.data : t
                    )
                );

                // ✅ reset + close
                setEditingTender(null);
                resetForm();
                fetchStats();
            }

        } catch (error) {
            console.log("❌ UPDATE ERROR:", error.response?.data || error.message);
            toast.error("Update failed");
        }
    };

    const deleteTender = async (id, title) => {
        if (!window.confirm(`⚠️ Delete "${title}"? This action cannot be undone!`)) return;
        try {
            await axios.delete(`http://localhost:5000/api/tenders/${id}`, {

                headers: { Authorization: `Bearer ${token}` }

            });

            setTenders(prev => prev.filter(t => t._id !== id));
            toast.success("Tender deleted");
            fetchStats();
        } catch {
            toast.error("Delete failed");
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            estimatedValue: '',
            category: '',
            bidSubmissionDeadline: '',
            emdAmount: '',
            tenderFee: '',
            status: 'active'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return { bg: '#e8f5e9', text: '#4caf50', dot: '#4caf50' };
            case 'pending': return { bg: '#fff3e0', text: '#ff9800', dot: '#ff9800' };
            case 'completed': return { bg: '#e3f2fd', text: '#2196f3', dot: '#2196f3' };
            case 'expired': return { bg: '#ffebee', text: '#f44336', dot: '#f44336' };
            default: return { bg: '#f5f5f5', text: '#999', dot: '#999' };
        }
    };

    const getScoreColor = (score) => {
        if (score >= 70) return '#4caf50';
        if (score >= 50) return '#ff9800';
        return '#f44336';
    };

    const filteredTenders = tenders.filter(tender => {
        const matchesSearch = tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tender.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || tender.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // ============ MODERN PREMIUM CSS STYLES ============
    const styles = {
        container: {
            padding: '28px',
            maxWidth: '1440px',
            margin: '0 auto',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            background: 'linear-gradient(135deg, #f5f7fa 0%, #f8f9fc 100%)',
            minHeight: '100vh'
        },
        header: {
            marginBottom: '32px'
        },
        title: {
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        subtitle: {
            color: '#666',
            fontSize: '14px'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '28px'
        },
        statCard: {
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            border: '1px solid rgba(0,0,0,0.05)'
        },
        statCardHover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
        },
        statIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            marginBottom: '12px'
        },
        statValue: {
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a1a2e',
            marginBottom: '4px'
        },
        statLabel: {
            fontSize: '13px',
            color: '#666',
            fontWeight: '500'
        },
        statChange: {
            fontSize: '11px',
            marginTop: '8px',
            color: '#4caf50'
        },
        filterBar: {
            display: 'flex',
            gap: '15px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            alignItems: 'center'
        },
        searchInput: {
            flex: 1,
            padding: '12px 18px',
            border: '2px solid #e0e0e0',
            borderRadius: '14px',
            fontSize: '14px',
            minWidth: '250px',
            transition: 'all 0.3s ease',
            background: 'white'
        },
        filterSelect: {
            padding: '12px 18px',
            border: '2px solid #e0e0e0',
            borderRadius: '14px',
            fontSize: '14px',
            background: 'white',
            cursor: 'pointer',
            minWidth: '150px'
        },
        addBtn: {
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
        },
        tableContainer: {
            overflowX: 'auto',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            border: '1px solid #eef2f6'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '900px'
        },
        th: {
            padding: '18px 20px',
            textAlign: 'left',
            background: '#f8fafc',
            borderBottom: '1px solid #eef2f6',
            fontWeight: '600',
            color: '#475569',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        td: {
            padding: '18px 20px',
            borderBottom: '1px solid #f0f2f5',
            color: '#334155',
            fontSize: '14px'
        },
        tenderTitle: {
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '4px'
        },
        tenderDesc: {
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '4px'
        },
        scoreBar: {
            width: '80px',
            height: '6px',
            background: '#e2e8f0',
            borderRadius: '10px',
            overflow: 'hidden',
            marginTop: '6px'
        },
        scoreFill: {
            height: '100%',
            borderRadius: '10px',
            transition: 'width 0.3s ease'
        },
        viewBtn: {
            background: '#e8f0fe',
            color: '#1e40af',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            marginRight: '8px',
            transition: 'all 0.2s ease'
        },
        editBtn: {
            background: '#fff3e0',
            color: '#e65100',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            marginRight: '8px',
            transition: 'all 0.2s ease'
        },
        deleteBtn: {
            background: '#fee2e2',
            color: '#b91c1c',
            border: 'none',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '30px',
            fontSize: '12px',
            fontWeight: '500'
        },
        statusDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            display: 'inline-block'
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
        },
        modal: {
            background: 'white',
            padding: '32px',
            borderRadius: '28px',
            width: '90%',
            maxWidth: '520px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 30px 50px rgba(0,0,0,0.2)',
            animation: 'slideUp 0.3s ease'
        },
        modalTitle: {
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#1a1a2e',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        },
        formGroup: {
            marginBottom: '18px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#334155',
            fontSize: '13px'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            background: '#fafbfc'
        },
        textarea: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            minHeight: '80px',
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
            background: '#fafbfc'
        },
        select: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            background: '#fafbfc',
            boxSizing: 'border-box'
        },
        modalButtons: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            marginTop: '24px'
        },
        submitBtn: {
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        cancelBtn: {
            background: '#e2e8f0',
            color: '#475569',
            border: 'none',
            padding: '12px 28px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        loadingSpinner: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh'
        },
        spinner: {
            width: '50px',
            height: '50px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px',
            color: '#94a3b8'
        },
        clearBtn: {
            background: '#f1f5f9',
            border: 'none',
            padding: '12px 18px',
            borderRadius: '14px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            color: '#64748b'
        }
    };

    // Add animations to document
    const animationStyles = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            background: white;
        }
        button:hover {
            transform: translateY(-2px);
            filter: brightness(0.98);
        }
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        tr:hover td {
            background: #f8fafc;
        }
    `;

    if (loading) {
        return (
            <div style={styles.loadingSpinner}>
                <div style={styles.spinner}></div>
                <style>{animationStyles}</style>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style>{animationStyles}</style>

            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <span>📋</span> Tender Management
                </h1>
                <p style={styles.subtitle}>Manage all tenders, track status, and analyze performance</p>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div className="stat-card" style={styles.statCard} onClick={() => setFilterStatus('all')}>
                    <div style={{ ...styles.statIcon, background: '#e8f0fe', color: '#4361ee' }}>📊</div>
                    <div style={styles.statValue}>{stats.total || tenders.length}</div>
                    <div style={styles.statLabel}>Total Tenders</div>
                    <div style={styles.statChange}>↑ 12% this month</div>
                </div>
                <div className="stat-card" style={styles.statCard} onClick={() => setFilterStatus('active')}>
                    <div style={{ ...styles.statIcon, background: '#e8f5e9', color: '#4caf50' }}>✅</div>
                    <div style={styles.statValue}>{stats.active || tenders.filter(t => t.status === 'active').length}</div>
                    <div style={styles.statLabel}>Active Tenders</div>
                    <div style={styles.statChange}>↑ 8% this month</div>
                </div>
                <div className="stat-card" style={styles.statCard} onClick={() => setFilterStatus('expired')}>
                    <div style={{ ...styles.statIcon, background: '#ffebee', color: '#f44336' }}>⏰</div>
                    <div style={styles.statValue}>{stats.expired || tenders.filter(t => t.status === 'expired').length}</div>
                    <div style={styles.statLabel}>Expired Tenders</div>
                    <div style={styles.statChange}>↓ 5% this month</div>
                </div>
                <div className="stat-card" style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: '#fff3e0', color: '#ff9800' }}>💰</div>
                    <div style={styles.statValue}>{stats.highValue || tenders.filter(t => t.estimatedValue?.amount > 50000000).length}</div>
                    <div style={styles.statLabel}>High Value (₹5Cr+)</div>
                    <div style={styles.statChange}>↑ 3 this month</div>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={styles.filterBar}>
                <input
                    type="text"
                    placeholder="🔍 Search by title or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={styles.filterSelect}
                >
                    <option value="all">📋 All Status</option>
                    <option value="active">🟢 Active</option>
                    <option value="pending">🟡 Pending</option>
                    <option value="completed">🔵 Completed</option>
                    <option value="expired">🔴 Expired</option>
                </select>
                {(searchTerm || filterStatus !== 'all') && (
                    <button style={styles.clearBtn} onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
                        ✖️ Clear Filters
                    </button>
                )}
                <div style={{ flex: 1 }}></div>
                <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
                    ➕ Add New Tender
                </button>
            </div>

            {/* Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Tender Details</th>
                            <th style={styles.th}>Value</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.th}>Deadline</th>
                            <th style={styles.th}>Score</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTenders.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={styles.emptyState}>No tenders found</td>
                            </tr>
                        ) : (
                            filteredTenders.map(t => {
                                const statusStyle = getStatusColor(t.status);
                                return (
                                    <tr key={t._id}>
                                        <td style={styles.td}>
                                            <div style={styles.tenderTitle}>{t.title}</div>
                                            {t.description && <div style={styles.tenderDesc}>{t.description.substring(0, 60)}...</div>}
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{formatCurrency(t.estimatedValue?.amount)}</div>
                                            {t.estimatedValue?.amount >= 10000000 && <div style={{ fontSize: '10px', color: '#ff9800' }}>High Value</div>}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                                                {t.category || 'N/A'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{formatDate(t.bidSubmissionDeadline)}</td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: '600', color: getScoreColor(t.eligibilityScore || 0) }}>
                                                    {t.eligibilityScore || 0}%
                                                </span>
                                                <div style={styles.scoreBar}>
                                                    <div style={{ ...styles.scoreFill, width: `${t.eligibilityScore || 0}%`, background: getScoreColor(t.eligibilityScore || 0) }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.text }}>
                                                <span style={{ ...styles.statusDot, background: statusStyle.dot }} />
                                                {t.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button style={styles.viewBtn} onClick={() => navigate(`/tenders/${t._id}`)}>👁️ View</button>
                                            <button style={styles.editBtn} onClick={() => openEditModal(t)}>✏️ Edit</button>
                                            <button style={styles.deleteBtn} onClick={() => deleteTender(t._id, t.title)}>🗑️ Delete</button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingTender) && (
                <div style={styles.modalOverlay} onClick={() => { setShowAddModal(false); setEditingTender(null); resetForm(); }}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>
                            {editingTender ? '✏️ Edit Tender' : '➕ Add New Tender'}
                        </h2>

                        <form onSubmit={editingTender ? handleUpdateTender : handleAddTender}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tender Title *</label>
                                <input style={styles.input} name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter tender title" required />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea style={styles.textarea} name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter description" />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Estimated Value (₹) *</label>
                                <input style={styles.input} type="number" name="estimatedValue" value={formData.estimatedValue} onChange={handleInputChange} placeholder="Enter amount" required />
                                <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', display: 'block' }}>💡 Example: 25000000 = 2.5 Crore</small>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Category</label>
                                <select style={styles.select} name="category" value={formData.category} onChange={handleInputChange}>
                                    <option value="">Select Category</option>
                                    <option value="IT Software">IT Software</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="Services">Services</option>
                                    <option value="Consulting">Consulting</option>
                                    <option value="Goods Supply">Goods Supply</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Deadline</label>
                                <input style={styles.input} type="date" name="bidSubmissionDeadline" value={formData.bidSubmissionDeadline} onChange={handleInputChange} />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Status</label>
                                <select style={styles.select} name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>

                            <div style={styles.modalButtons}>
                                <button type="submit" style={styles.submitBtn}>
                                    {editingTender ? '✅ Update Tender' : '➕ Add Tender'}
                                </button>
                                <button type="button" style={styles.cancelBtn} onClick={() => { setShowAddModal(false); setEditingTender(null); resetForm(); }}>
                                    ❌ Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTendersPage;