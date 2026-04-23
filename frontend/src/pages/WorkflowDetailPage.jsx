import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const WorkflowDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [workflow, setWorkflow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (token && id) {
            fetchWorkflow();
        }
    }, [token, id]);

    const fetchWorkflow = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/workflows/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkflow(response.data.data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load workflow');
            setWorkflow(null); // ❌ REMOVE DEMO DATA
        }
        finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(1)} Cr`;
        if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(1)} L`;
        return `₹${amount.toLocaleString()}`;
    };

    const getStatusColor = (status) => {
        const colors = {
            not_started: '#999', in_progress: '#ff9800', submitted: '#2196f3',
            awarded: '#4caf50', lost: '#f44336'
        };
        return colors[status] || '#999';
    };

    const getStepStatusColor = (status) => {
        const colors = { pending: '#999', in_progress: '#ff9800', completed: '#4caf50', blocked: '#f44336' };
        return colors[status] || '#999';
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Loading workflow details...</div>;

    const styles = {
        container: { maxWidth: 1200, margin: '0 auto', padding: 20 },
        backBtn: { backgroundColor: '#667eea', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 20 },
        headerCard: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 20, padding: 30, marginBottom: 25, color: 'white' },
        title: { fontSize: 28, marginBottom: 10 },
        tenderTitle: { fontSize: 20, marginBottom: 5 },
        statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.2)' },
        tabs: { display: 'flex', gap: 10, borderBottom: '2px solid #e0e0e0', marginBottom: 20 },
        tab: { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 'bold', color: '#666' },
        activeTab: { color: '#667eea', borderBottom: '2px solid #667eea' },
        card: { background: 'white', borderRadius: 16, padding: 25, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
        sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, borderLeft: '4px solid #667eea', paddingLeft: 12 },
        infoRow: { display: 'flex', padding: '10px 0', borderBottom: '1px solid #eee' },
        infoLabel: { width: 140, fontWeight: 'bold', color: '#666' },
        infoValue: { flex: 1, color: '#333' },
        stepItem: { display: 'flex', alignItems: 'center', gap: 15, padding: 12, borderBottom: '1px solid #eee' },
        stepStatus: { width: 16, height: 16, borderRadius: '50%' },
        stepName: { flex: 1, fontWeight: 'bold' },
        stepDate: { fontSize: 12, color: '#999' },
        teamMember: { padding: 10, background: '#f8f9fa', borderRadius: 8, marginBottom: 10, display: 'flex', justifyContent: 'space-between' },
        noteItem: { padding: 12, background: '#f8f9fa', borderRadius: 8, marginBottom: 10 },
        noteText: { marginBottom: 5 },
        noteMeta: { fontSize: 12, color: '#999' }
    };

    return (
        <div style={styles.container}>
            <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>

            {/* Header */}
            <div style={styles.headerCard}>
                <h1 style={styles.title}>Workflow Details</h1>
                <h3 style={styles.tenderTitle}>{workflow?.tenderId?.title}</h3>
                <span style={styles.statusBadge}>{workflow?.status?.replace('_', ' ')}</span>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button style={{ ...styles.tab, ...(activeTab === 'details' ? styles.activeTab : {}) }} onClick={() => setActiveTab('details')}>Details</button>
                <button style={{ ...styles.tab, ...(activeTab === 'steps' ? styles.activeTab : {}) }} onClick={() => setActiveTab('steps')}>Steps</button>
                <button style={{ ...styles.tab, ...(activeTab === 'team' ? styles.activeTab : {}) }} onClick={() => setActiveTab('team')}>Team</button>
                <button style={{ ...styles.tab, ...(activeTab === 'notes' ? styles.activeTab : {}) }} onClick={() => setActiveTab('notes')}>Notes</button>
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
                <div style={styles.card}>
                    <div style={styles.infoRow}><div style={styles.infoLabel}>Tender ID:</div><div style={styles.infoValue}>{workflow?.tenderId?._id}</div></div>
                    <div style={styles.infoRow}><div style={styles.infoLabel}>Tender Value:</div><div style={styles.infoValue}>{formatCurrency(workflow?.tenderId?.estimatedValue?.amount)}</div></div>
                    <div style={styles.infoRow}><div style={styles.infoLabel}>Deadline:</div><div style={styles.infoValue}>{new Date(workflow?.tenderId?.bidSubmissionDeadline).toLocaleDateString()}</div></div>
                    <div style={styles.infoRow}><div style={styles.infoLabel}>Company:</div><div style={styles.infoValue}>{workflow?.companyId?.companyName}</div></div>
                    <div style={styles.infoRow}><div style={styles.infoLabel}>Current Step:</div><div style={styles.infoValue}>{workflow?.currentStep?.replace('_', ' ')}</div></div>
                    <div style={styles.infoRow}><div style={styles.infoLabel}>Created:</div><div style={styles.infoValue}>{new Date(workflow?.createdAt).toLocaleString()}</div></div>
                    <div style={styles.infoRow}><div style={styles.infoLabel}>Last Updated:</div><div style={styles.infoValue}>{new Date(workflow?.updatedAt).toLocaleString()}</div></div>
                </div>
            )}

            {/* Steps Tab */}
            {activeTab === 'steps' && (
                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>Workflow Steps</h3>
                    {workflow?.steps?.map((step, idx) => (
                        <div key={idx} style={styles.stepItem}>
                            <div style={{ ...styles.stepStatus, backgroundColor: getStepStatusColor(step.status) }} />
                            <div style={styles.stepName}>{step.name}</div>
                            <div style={styles.stepDate}>
                                {step.completedAt ? `Completed: ${new Date(step.completedAt).toLocaleDateString()}` :
                                    step.startedAt ? `Started: ${new Date(step.startedAt).toLocaleDateString()}` : 'Not started'}
                            </div>
                            <span style={{ color: getStepStatusColor(step.status), fontWeight: 'bold' }}>{step.status}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>Team Members</h3>
                    {workflow?.team?.length > 0 ? workflow.team.map((member, idx) => (
                        <div key={idx} style={styles.teamMember}>
                            <div><strong>{member.userId?.name}</strong> ({member.userId?.email})</div>
                            <div style={{ color: '#667eea' }}>{member.role}</div>
                        </div>
                    )) : <p>No team members assigned.</p>}
                </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
                <div style={styles.card}>
                    <h3 style={styles.sectionTitle}>Activity Notes</h3>
                    {workflow?.notes?.length > 0 ? workflow.notes.map((note, idx) => (
                        <div key={idx} style={styles.noteItem}>
                            <div style={styles.noteText}>{note.content}</div>
                            <div style={styles.noteMeta}>By {note.createdBy?.name} on {new Date(note.createdAt).toLocaleString()}</div>
                        </div>
                    )) : <p>No notes available.</p>}
                </div>
            )}
        </div>
    );
};

export default WorkflowDetailPage;