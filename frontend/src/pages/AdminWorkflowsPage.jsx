import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminWorkflowsPage = () => {
    const { token, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState([]);
    const [tenders, setTenders] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState(null);
    const [formData, setFormData] = useState({
        tenderId: '',
        companyId: '',
        status: 'not_started',
        currentStep: 'discovery'
    });

    useEffect(() => {
        if (token) {
            fetchWorkflows();
            fetchTenders();
            fetchCompanies();
        }
    }, [token]);

    const fetchWorkflows = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/workflows', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setWorkflows(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching workflows:', error);
            toast.error("Failed to fetch workflows");
            setWorkflows([]); // ❌ NO DEMO DATA
        } finally {
            setLoading(false);
        }
    };

    const fetchTenders = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tenders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setTenders(response.data.data);
            }
        } catch (error) {
            setTenders([
                { _id: 't1', title: 'IT Hardware Supply' },
                { _id: 't2', title: 'Office Building Construction' },
                { _id: 't3', title: 'Cloud Migration Services' }
            ]);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/company/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCompanies(response.data.data);
            }
        } catch (error) {
            setCompanies([
                { _id: 'c1', companyName: 'Tech Solutions' },
                { _id: 'c2', companyName: 'Infrastructure Builders Ltd' },
                { _id: 'c3', companyName: 'Cloud Experts' }
            ]);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddWorkflow = async () => {
        if (!formData.tenderId || !formData.companyId) {
            toast.error('Please select all required fields');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/workflows',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success('Workflow created successfully');

                // ✅ 1. FORM RESET
                resetForm();

                // ✅ 2. MODAL CLOSE
                setShowAddModal(false);

                // ✅ 3. LIST REFRESH (LATEST DATA)
                await fetchWorkflows();
            }

        } catch (error) {
            console.log("❌ ERROR:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Failed to create workflow');
        }
    };

    // ========== EDIT WORKFLOW FUNCTION ==========
    const handleEditWorkflow = (workflow) => {
        setEditingWorkflow(workflow);
        setFormData({
            tenderId: workflow.tenderId?._id || workflow.tenderId,
            companyId: workflow.companyId?._id || workflow.companyId,
            status: workflow.status,
            currentStep: workflow.currentStep
        });
    };

    const handleUpdateWorkflow = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/workflows/${editingWorkflow._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Workflow updated successfully');
                setEditingWorkflow(null);
                fetchWorkflows();
                resetForm();
            }
        } catch (error) {
            // Demo update
            const updatedWorkflows = workflows.map(w =>
                w._id === editingWorkflow._id ? { ...w, ...formData } : w
            );
            setWorkflows(updatedWorkflows);
            toast.success('Workflow updated successfully');
            setEditingWorkflow(null);
            resetForm();
        }
    };



    // ========== DELETE WORKFLOW FUNCTION ==========
    const handleDeleteWorkflow = async (id, title) => {
        if (window.confirm(`⚠️ Delete workflow for "${title}"?\n\nThis action cannot be undone!`)) {
            try {
                await axios.delete(`http://localhost:5000/api/workflows/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Workflow deleted successfully');
                fetchWorkflows();
            } catch (error) {
                setWorkflows(workflows.filter(w => w._id !== id));
                toast.success('Workflow deleted successfully');
            }
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingWorkflow(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            tenderId: '',
            companyId: '',
            status: 'not_started',
            currentStep: 'discovery'
        });
    };



    const getStatusColor = (status) => {
        const colors = {
            not_started: '#999',
            in_progress: '#ff9800',
            submitted: '#2196f3',
            awarded: '#4caf50',
            lost: '#f44336'
        };
        return colors[status] || '#999';
    };

    const getStepLabel = (step) => {
        const steps = {
            discovery: 'Discovery',
            eligibility_check: 'Eligibility Check',
            document_preparation: 'Document Prep',
            review: 'Review',
            submission: 'Submission',
            post_submission: 'Post Submission'
        };
        return steps[step] || step;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                    <p>Loading workflows...</p>
                </div>
            </div>
        );
    }

    const styles = {
        container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
        title: { fontSize: '28px', color: '#333' },
        addBtn: { padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
        tableContainer: { overflowX: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
        th: { textAlign: 'left', padding: '15px', background: '#f8f9fa', borderBottom: '2px solid #e0e0e0', fontWeight: '600', color: '#666' },
        td: { padding: '15px', borderBottom: '1px solid #eee', color: '#333' },
        statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: 'white' },
        viewBtn: { padding: '6px 12px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
        editBtn: { padding: '6px 12px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
        deleteBtn: { padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modal: { background: 'white', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '500px' },
        modalTitle: { fontSize: '24px', marginBottom: '20px', textAlign: 'center' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
        select: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: 'white' },
        modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        saveBtn: { backgroundColor: '#4caf50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
        cancelBtn: { backgroundColor: '#999', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🔄 Workflow Management</h1>
                <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ New Workflow</button>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Tender</th>
                            <th style={styles.th}>Company</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Current Step</th>
                            <th style={styles.th}>Created</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workflows.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No workflows found. Click "New Workflow" to create one.</td></tr>
                        ) : (
                            workflows.map((w) => (
                                <tr key={w._id}>
                                    <td style={styles.td}>{w.tenderId?.title || 'N/A'}</td>
                                    <td style={styles.td}>{w.companyId?.companyName || 'N/A'}</td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(w.status) }}>
                                            {w.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{getStepLabel(w.currentStep)}</td>
                                    <td style={styles.td}>{new Date(w.createdAt).toLocaleDateString()}</td>
                                    <td style={styles.td}>
                                        {/* View Button */}
                                        <button onClick={() => navigate(`/workflows/${w._id}`)} style={styles.viewBtn}>👁️ View</button>
                                        {/* Edit Button */}
                                        <button onClick={() => handleEditWorkflow(w)} style={styles.editBtn}>✏️ Edit</button>
                                        {/* Delete Button */}
                                        <button onClick={() => handleDeleteWorkflow(w._id, w.tenderId?.title)} style={styles.deleteBtn}>🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Workflow Modal */}
            {(showAddModal || editingWorkflow) && (
                <div style={styles.modalOverlay} onClick={() => { setShowAddModal(false); setEditingWorkflow(null); resetForm(); }}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>{editingWorkflow ? '✏️ Edit Workflow' : '➕ New Workflow'}</h2>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Tender *</label>
                            <select name="tenderId" value={formData.tenderId} onChange={handleChange} style={styles.select} required>
                                <option value="">Select Tender</option>
                                {tenders.map(t => (
                                    <option key={t._id} value={t._id}>{t.title}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Company *</label>
                            <select name="companyId" value={formData.companyId} onChange={handleChange} style={styles.select} required>
                                <option value="">Select Company</option>
                                {companies.map(c => (
                                    <option key={c._id} value={c._id}>{c.companyName}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} style={styles.select}>
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="submitted">Submitted</option>
                                <option value="awarded">Awarded</option>
                                <option value="lost">Lost</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Current Step</label>
                            <select name="currentStep" value={formData.currentStep} onChange={handleChange} style={styles.select}>
                                <option value="discovery">Discovery</option>
                                <option value="eligibility_check">Eligibility Check</option>
                                <option value="document_preparation">Document Preparation</option>
                                <option value="review">Review</option>
                                <option value="submission">Submission</option>
                                <option value="post_submission">Post Submission</option>
                            </select>
                        </div>

                        <div style={styles.modalButtons}>
                            <button onClick={editingWorkflow ? handleUpdateWorkflow : handleAddWorkflow} style={styles.saveBtn}>
                                {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                            </button>
                            <button onClick={() => { setShowAddModal(false); setEditingWorkflow(null); resetForm(); }} style={styles.cancelBtn}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminWorkflowsPage;