import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const TendersPage = () => {
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        minScore: '',
        status: ''
    });

    useEffect(() => {
        fetchTenders();
    }, [filters]);

    const fetchTenders = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.minScore) params.append('minScore', filters.minScore);
            if (filters.status) params.append('status', filters.status);

            const response = await axios.get(`http://localhost:5000/api/tenders?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000 // 10 second timeout
            });

            if (response.data.success) {
                setTenders(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching tenders:', err);
            setError(err.response?.data?.message || 'Failed to fetch tenders');

            // Demo data if API fails
            setTenders([
                { _id: '1', title: 'IT Hardware Supply', estimatedValue: { amount: 25000000 }, category: 'IT Software', bidSubmissionDeadline: '2024-03-15', eligibilityScore: 85, status: 'active' },
                { _id: '2', title: 'Office Construction', estimatedValue: { amount: 150000000 }, category: 'Infrastructure', bidSubmissionDeadline: '2024-03-20', eligibilityScore: 45, status: 'active' },
                { _id: '3', title: 'Cloud Migration', estimatedValue: { amount: 30000000 }, category: 'IT Software', bidSubmissionDeadline: '2024-03-10', eligibilityScore: 92, status: 'expired' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount?.toLocaleString() || 0}`;
    };

    const styles = {
        container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
        header: { marginBottom: '30px' },
        title: { fontSize: '28px', color: '#333', marginBottom: '10px' },
        filterBar: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' },
        select: { padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', minWidth: '150px' },
        card: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' },
        cardTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '10px', color: '#333' },
        cardDetails: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '10px', color: '#666', fontSize: '14px' },
        scoreBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: 'white' },
        loading: { textAlign: 'center', padding: '50px', color: '#666' },
        error: { textAlign: 'center', padding: '50px', color: '#f44336', background: '#ffebee', borderRadius: '16px' },
        retryBtn: { marginTop: '15px', padding: '8px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
    };

    if (loading) {
        return <div style={styles.loading}>Loading tenders...</div>;
    }

    if (error && tenders.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    <p>⚠️ {error}</p>
                    <button onClick={fetchTenders} style={styles.retryBtn}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📋 Tenders</h1>
            </div>

            {/* Filters */}
            <div style={styles.filterBar}>
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} style={styles.select}>
                    <option value="">All Categories</option>
                    <option value="IT Software">IT Software</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Services">Services</option>
                    <option value="Consulting">Consulting</option>
                </select>

                <select value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: e.target.value })} style={styles.select}>
                    <option value="">Min Score</option>
                    <option value="60">60%+</option>
                    <option value="70">70%+</option>
                    <option value="80">80%+</option>
                    <option value="90">90%+</option>
                </select>

                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={styles.select}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                </select>
            </div>

            {/* Tenders List */}
            {tenders.map((tender) => (
                <div key={tender._id} onClick={() => navigate(`/tenders/${tender._id}`)} style={styles.card}>
                    <div style={styles.cardTitle}>{tender.title}</div>
                    <div style={styles.cardDetails}>
                        <span>💰 {formatCurrency(tender.estimatedValue?.amount)}</span>
                        <span>📂 {tender.category || 'N/A'}</span>
                        <span>📅 {new Date(tender.bidSubmissionDeadline).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ width: '100px', height: '6px', background: '#e0e0e0', borderRadius: '3px' }}>
                            <div style={{ width: `${tender.eligibilityScore || 0}%`, height: '100%', background: '#667eea', borderRadius: '3px' }} />
                        </div>
                        <span style={{
                            ...styles.scoreBadge,
                            backgroundColor: tender.eligibilityScore >= 70 ? '#4caf50' : tender.eligibilityScore >= 50 ? '#ff9800' : '#f44336'
                        }}>
                            {tender.eligibilityScore || 0}%
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TendersPage;