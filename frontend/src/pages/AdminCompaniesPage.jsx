// src/pages/AdminCompaniesPage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminCompaniesPage = () => {
    const { token, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [viewCompany, setViewCompany] = useState(null);

    const [formData, setFormData] = useState({
        userId: '',
        companyName: '',
        registrationNumber: '',
        gstin: '',
        pan: '',
        financials: {
            annualTurnover: { current: 0 },
            netWorth: 0,
            profitAfterTax: 0
        },
        teamCapabilities: {
            totalEmployees: 0,
            technicalStaff: 0,
            projectManagers: 0
        }
    });

    // ================= FETCH =================
    useEffect(() => {
        if (token) {
            fetchCompanies();
            fetchUsers();
        }
    }, [token]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/company/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setCompanies(res.data.data);
        } catch {
            toast.error("Failed to fetch companies");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setUsers(res.data.data);
        } catch {
            setUsers([]);
        }
    };

    // ================= HANDLE INPUT =================
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const keys = name.split('.');
            setFormData(prev => {
                let updated = { ...prev };
                let current = updated;

                for (let i = 0; i < keys.length - 1; i++) {
                    current[keys[i]] = { ...current[keys[i]] };
                    current = current[keys[i]];
                }

                current[keys[keys.length - 1]] = value;
                return updated;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // ================= RESET =================
    const resetForm = () => {
        setFormData({
            userId: '',
            companyName: '',
            registrationNumber: '',
            gstin: '',
            pan: '',
            financials: {
                annualTurnover: { current: 0 },
                netWorth: 0,
                profitAfterTax: 0
            },
            teamCapabilities: {
                totalEmployees: 0,
                technicalStaff: 0,
                projectManagers: 0
            }
        });
    };

    // ================= ADD =================
    const handleAddCompany = async () => {
        try {
            const res = await axios.post(
                'http://localhost:5000/api/company',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success("Company added");
                setCompanies(prev => [res.data.data, ...prev]);
                resetForm();
                setShowAddModal(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Add failed");
        }
    };

    // ================= UPDATE =================
    const handleUpdateCompany = async () => {
        try {
            const payload = {
                companyName: formData.companyName,
                registrationNumber: formData.registrationNumber,
                gstin: formData.gstin,
                pan: formData.pan,
                financials: {
                    annualTurnover: {
                        current: Number(formData.financials?.annualTurnover?.current) || 0
                    },
                    netWorth: Number(formData.financials?.netWorth) || 0,
                    profitAfterTax: Number(formData.financials?.profitAfterTax) || 0
                },
                teamCapabilities: {
                    totalEmployees: Number(formData.teamCapabilities?.totalEmployees) || 0,
                    technicalStaff: Number(formData.teamCapabilities?.technicalStaff) || 0,
                    projectManagers: Number(formData.teamCapabilities?.projectManagers) || 0
                }
            };

            console.log("UPDATE PAYLOAD:", payload);

            const res = await axios.put(
                `http://localhost:5000/api/company/${editingCompany._id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.data.success) {
                toast.success("Updated successfully ✅");

                setCompanies(prev =>
                    prev.map(c =>
                        c._id === editingCompany._id ? res.data.data : c
                    )
                );

                setEditingCompany(null);
                resetForm();
            }

        } catch (err) {
            console.log("UPDATE ERROR:", err.response?.data);
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    // ================= DELETE =================
    const handleDeleteCompany = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/company/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCompanies(prev => prev.filter(c => c._id !== id));
            toast.success("Deleted");
        } catch {
            toast.error("Delete failed");
        }
    };

    const isSuperAdmin = user?.role === 'super_admin';

    // ================= CSS STYLES =================
    const styles = {
        container: {
            padding: '24px',
            maxWidth: '1400px',
            margin: '0 auto',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
        },
        title: {
            fontSize: '28px',
            color: '#1a1a2e',
            margin: 0,
            fontWeight: '600'
        },
        addBtn: {
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s'
        },
        tableContainer: {
            overflowX: 'auto',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '800px'
        },
        th: {
            padding: '16px',
            textAlign: 'left',
            background: '#f8f9fa',
            borderBottom: '2px solid #e0e0e0',
            fontWeight: '600',
            color: '#444',
            fontSize: '14px'
        },
        td: {
            padding: '16px',
            borderBottom: '1px solid #eee',
            color: '#555',
            fontSize: '14px'
        },
        btn: {
            padding: '6px 12px',
            margin: '0 4px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
        },
        viewBtn: {
            backgroundColor: '#2196f3',
            color: 'white'
        },
        editBtn: {
            backgroundColor: '#ff9800',
            color: 'white'
        },
        deleteBtn: {
            backgroundColor: '#dc3545',
            color: 'white'
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        },
        modal: {
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '550px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease'
        },
        modalTitle: {
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#1a1a2e',
            textAlign: 'center'
        },
        formGroup: {
            marginBottom: '16px'
        },
        label: {
            display: 'block',
            marginBottom: '6px',
            fontWeight: '500',
            color: '#333',
            fontSize: '13px'
        },
        input: {
            width: '100%',
            padding: '10px 12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'border-color 0.2s',
            outline: 'none'
        },
        select: {
            width: '100%',
            padding: '10px 12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white'
        },
        modalButtons: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '20px'
        },
        saveBtn: {
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        cancelBtn: {
            background: '#999',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
        },
        companyName: {
            fontWeight: '600',
            color: '#1a1a2e'
        },
        loadingContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh'
        },
        spinner: {
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },
        detailRow: {
            display: 'flex',
            padding: '10px 0',
            borderBottom: '1px solid #eee'
        },
        detailLabel: {
            width: '140px',
            fontWeight: '500',
            color: '#666'
        },
        detailValue: {
            flex: 1,
            color: '#333'
        }
    };

    // Add keyframes for animation
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        input:focus, select:focus {
            border-color: #667eea;
            outline: none;
        }
    `;
    document.head.appendChild(styleSheet);

    // ================= UI =================
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        return `₹${amount.toLocaleString()}`;
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🏢 Company Management</h1>
                <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
                    ➕ Add New Company
                </button>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Company Name</th>
                            <th style={styles.th}>GSTIN</th>
                            <th style={styles.th}>Owner</th>
                            <th style={styles.th}>Turnover</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(c => (
                            <tr key={c._id}>
                                <td style={styles.td}>
                                    <span style={styles.companyName}>{c.companyName}</span>
                                </td>
                                <td style={styles.td}>{c.gstin || '-'}</td>
                                <td style={styles.td}>{c.userId?.name || 'N/A'}</td>
                                <td style={styles.td}>{formatCurrency(c.financials?.annualTurnover?.current)}</td>
                                <td style={styles.td}>
                                    <button
                                        style={{ ...styles.btn, ...styles.viewBtn }}
                                        onClick={() => setViewCompany(c)}
                                    >
                                        👁️ View
                                    </button>
                                    <button
                                        style={{ ...styles.btn, ...styles.editBtn }}
                                        onClick={() => {
                                            setEditingCompany(c);
                                            setFormData({
                                                userId: c.userId?._id || '',
                                                companyName: c.companyName || '',
                                                registrationNumber: c.registrationNumber || '',
                                                gstin: c.gstin || '',
                                                pan: c.pan || '',
                                                financials: {
                                                    annualTurnover: { current: c.financials?.annualTurnover?.current || 0 },
                                                    netWorth: c.financials?.netWorth || 0,
                                                    profitAfterTax: c.financials?.profitAfterTax || 0
                                                },
                                                teamCapabilities: {
                                                    totalEmployees: c.teamCapabilities?.totalEmployees || 0,
                                                    technicalStaff: c.teamCapabilities?.technicalStaff || 0,
                                                    projectManagers: c.teamCapabilities?.projectManagers || 0
                                                }
                                            });
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                    {isSuperAdmin && (
                                        <button
                                            style={{ ...styles.btn, ...styles.deleteBtn }}
                                            onClick={() => handleDeleteCompany(c._id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ADD / EDIT MODAL */}
            {(showAddModal || editingCompany) && (
                <div style={styles.modalOverlay} onClick={() => {
                    setShowAddModal(false);
                    setEditingCompany(null);
                    resetForm();
                }}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>
                            {editingCompany ? "✏️ Edit Company" : "➕ Add New Company"}
                        </h3>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Select User *</label>
                            <select
                                name="userId"
                                value={formData.userId}
                                onChange={handleChange}
                                style={styles.select}
                                required
                            >
                                <option value="">-- Select a user --</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Company Name *</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Enter company name"
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Registration Number</label>
                            <input
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Enter registration number"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>GSTIN</label>
                            <input
                                type="text"
                                name="gstin"
                                value={formData.gstin}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Enter GSTIN"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>PAN</label>
                            <input
                                type="text"
                                name="pan"
                                value={formData.pan}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Enter PAN"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Annual Turnover (₹)</label>
                            <input
                                type="number"
                                name="financials.annualTurnover.current"
                                value={formData.financials?.annualTurnover?.current || 0}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Enter annual turnover"
                                step="1000"
                                min="0"
                            />
                            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                                💡 Examples: 25000000 = 2.5 Crore | 5000000 = 50 Lakh
                            </small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Net Worth (₹)</label>
                            <input
                                type="number"
                                name="financials.netWorth"
                                value={formData.financials?.netWorth || 0}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Enter net worth"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Total Employees</label>
                            <input
                                type="number"
                                name="teamCapabilities.totalEmployees"
                                value={formData.teamCapabilities?.totalEmployees || 0}
                                onChange={handleChange}
                                style={styles.input}
                                placeholder="Enter number of employees"
                            />
                        </div>

                        <div style={styles.modalButtons}>
                            <button
                                style={styles.saveBtn}
                                onClick={editingCompany ? handleUpdateCompany : handleAddCompany}
                            >
                                {editingCompany ? '✅ Update Company' : '✅ Add Company'}
                            </button>
                            <button
                                style={styles.cancelBtn}
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingCompany(null);
                                    resetForm();
                                }}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {viewCompany && (
                <div style={styles.modalOverlay} onClick={() => setViewCompany(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>🏢 Company Details</h3>

                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>Company Name:</div>
                            <div style={styles.detailValue}>{viewCompany.companyName}</div>
                        </div>
                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>Registration No:</div>
                            <div style={styles.detailValue}>{viewCompany.registrationNumber || '-'}</div>
                        </div>
                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>GSTIN:</div>
                            <div style={styles.detailValue}>{viewCompany.gstin || '-'}</div>
                        </div>
                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>PAN:</div>
                            <div style={styles.detailValue}>{viewCompany.pan || '-'}</div>
                        </div>
                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>Owner:</div>
                            <div style={styles.detailValue}>{viewCompany.userId?.name || 'N/A'}</div>
                        </div>
                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>Annual Turnover:</div>
                            <div style={styles.detailValue}>{formatCurrency(viewCompany.financials?.annualTurnover?.current)}</div>
                        </div>
                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>Net Worth:</div>
                            <div style={styles.detailValue}>{formatCurrency(viewCompany.financials?.netWorth)}</div>
                        </div>
                        <div style={styles.detailRow}>
                            <div style={styles.detailLabel}>Total Employees:</div>
                            <div style={styles.detailValue}>{viewCompany.teamCapabilities?.totalEmployees || 0}</div>
                        </div>

                        <div style={styles.modalButtons}>
                            <button
                                style={styles.cancelBtn}
                                onClick={() => setViewCompany(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompaniesPage;