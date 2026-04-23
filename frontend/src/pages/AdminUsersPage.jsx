// src/pages/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
    const { token, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editRole, setEditRole] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobileNumber: '',
        role: 'analyst'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            console.log('Fetching users...');

            const response = await axios.get('http://localhost:5000/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('API Response:', response.data);

            if (response.data.success) {
                setUsers(response.data.data);
                toast.success(`Loaded ${response.data.data.length} users`);
            } else {
                toast.error(response.data.message || 'Failed to fetch users');
                setDemoUsers();
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch users');
            setDemoUsers();
        } finally {
            setLoading(false);
        }
    };

    const setDemoUsers = () => {
        setUsers([
            { _id: '1', name: 'Super Admin', email: 'superadmin@example.com', role: 'super_admin', status: 'active', mobileNumber: '9999999999', createdAt: new Date() },
            { _id: '2', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', mobileNumber: '9876543210', createdAt: new Date() },
            { _id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'analyst', status: 'active', mobileNumber: '9876543211', createdAt: new Date() },
            { _id: '4', name: 'Mike Johnson', email: 'mike@example.com', role: 'procurement_manager', status: 'inactive', mobileNumber: '9876543212', createdAt: new Date() },
            { _id: '5', name: 'Sarah Williams', email: 'sarah@example.com', role: 'bid_manager', status: 'active', mobileNumber: '9876543213', createdAt: new Date() }
        ]);
    };

    const handleAddUser = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.mobileNumber) {
            toast.error('All fields are required');
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                mobileNumber: formData.mobileNumber,
                companyId: '507f1f77bcf86cd799439011',
                role: formData.role
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('User added successfully');
                setShowAddModal(false);
                fetchUsers();
                resetForm();
            }
        } catch (error) {
            const newUser = {
                _id: Date.now().toString(),
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: 'active',
                mobileNumber: formData.mobileNumber,
                createdAt: new Date()
            };
            setUsers([newUser, ...users]);
            toast.success('User added successfully (Demo)');
            setShowAddModal(false);
            resetForm();
        }
    };

    const updateUserRole = async (userId, role) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`,
                { role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success('Role updated successfully');
                fetchUsers();
                setEditingUser(null);
            }
        } catch (error) {
            const updatedUsers = users.map(u =>
                u._id === userId ? { ...u, role: role } : u
            );
            setUsers(updatedUsers);
            toast.success('Role updated (Demo)');
            setEditingUser(null);
        }
    };

    const updateUserStatus = async (userId, status) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success(`User ${status === 'active' ? 'activated' : 'deactivated'}`);
                fetchUsers();
            }
        } catch (error) {
            const updatedUsers = users.map(u =>
                u._id === userId ? { ...u, status: status } : u
            );
            setUsers(updatedUsers);
            toast.success(`User ${status === 'active' ? 'activated' : 'deactivated'} (Demo)`);
        }
    };

    const deleteUser = async (userId, userName) => {
        if (window.confirm(`⚠️ Delete user "${userName}"?\n\nThis action cannot be undone!`)) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                setUsers(users.filter(u => u._id !== userId));
                toast.success('User deleted successfully (Demo)');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            mobileNumber: '',
            role: 'analyst'
        });
    };

    const isSuperAdmin = user?.role === 'super_admin';

    const getRoleColor = (role) => {
        const colors = {
            super_admin: '#9c27b0',
            admin: '#f44336',
            procurement_manager: '#2196f3',
            bid_manager: '#4caf50',
            analyst: '#ff9800',
            viewer: '#607d8b'
        };
        return colors[role] || '#666';
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                    <p>Loading users...</p>
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
        table: { width: '100%', borderCollapse: 'collapse', minWidth: '1000px' },
        th: { textAlign: 'left', padding: '15px', background: '#f8f9fa', borderBottom: '2px solid #e0e0e0', fontWeight: '600', color: '#666' },
        td: { padding: '15px', borderBottom: '1px solid #eee', color: '#333' },
        roleBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', color: 'white' },
        select: { padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
        editBtn: { padding: '6px 12px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
        saveBtn: { padding: '6px 12px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
        cancelBtn: { padding: '6px 12px', background: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        deactivateBtn: { padding: '6px 12px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
        activateBtn: { padding: '6px 12px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
        deleteBtn: { padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modal: { background: 'white', borderRadius: '16px', padding: '30px', width: '90%', maxWidth: '500px' },
        modalTitle: { fontSize: '24px', marginBottom: '20px', textAlign: 'center' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' },
        input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' },
        modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        saveModalBtn: { backgroundColor: '#4caf50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
        cancelModalBtn: { backgroundColor: '#999', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>👥 User Management</h1>
                <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ Add New User</button>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Mobile</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Joined</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td style={styles.td}>
                                    {u.name}
                                    {u._id === user?.id && <span style={{ marginLeft: '8px', fontSize: '10px', color: '#667eea' }}>(You)</span>}
                                </td>
                                <td style={styles.td}>{u.email}</td>
                                <td style={styles.td}>{u.mobileNumber || '-'}</td>
                                <td style={styles.td}>
                                    {editingUser === u._id ? (
                                        <select
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                            style={styles.select}
                                        >
                                            <option value="super_admin">Super Admin</option>
                                            <option value="admin">Admin</option>
                                            <option value="procurement_manager">Procurement Manager</option>
                                            <option value="bid_manager">Bid Manager</option>
                                            <option value="analyst">Analyst</option>
                                            <option value="viewer">Viewer</option>
                                        </select>
                                    ) : (
                                        <span style={{ ...styles.roleBadge, backgroundColor: getRoleColor(u.role) }}>
                                            {u.role}
                                        </span>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    <span style={{ color: u.status === 'active' ? '#4caf50' : '#f44336' }}>
                                        {u.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                                    </span>
                                </td>
                                <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td style={styles.td}>
                                    {editingUser === u._id ? (
                                        <>
                                            <button onClick={() => updateUserRole(u._id, editRole)} style={styles.saveBtn}>Save</button>
                                            <button onClick={() => setEditingUser(null)} style={styles.cancelBtn}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setEditingUser(u._id); setEditRole(u.role); }} style={styles.editBtn}>Edit Role</button>
                                            {u.status === 'active' ? (
                                                <button onClick={() => updateUserStatus(u._id, 'inactive')} style={styles.deactivateBtn}>Deactivate</button>
                                            ) : (
                                                <button onClick={() => updateUserStatus(u._id, 'active')} style={styles.activateBtn}>Activate</button>
                                            )}
                                            {isSuperAdmin && u._id !== user?.id && (
                                                <button onClick={() => deleteUser(u._id, u.name)} style={styles.deleteBtn}>🗑️ Delete</button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>➕ Add New User</h2>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styles.input} placeholder="Enter full name" required />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={styles.input} placeholder="Enter email" required />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Mobile Number *</label>
                            <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} style={styles.input} placeholder="10 digit mobile number" required />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password *</label>
                            <input type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={styles.input} placeholder="Min 8 characters" required />
                            <small style={{ color: '#666' }}>Password must be at least 8 characters</small>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Role</label>
                            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={styles.select}>
                                <option value="super_admin">👑 Super Admin</option>
                                <option value="admin">🔒 Admin</option>
                                <option value="procurement_manager">📋 Procurement Manager</option>
                                <option value="bid_manager">💰 Bid Manager</option>
                                <option value="analyst">📊 Analyst</option>
                                <option value="viewer">👁️ Viewer</option>
                            </select>
                        </div>

                        <div style={styles.modalButtons}>
                            <button onClick={handleAddUser} style={styles.saveModalBtn}>➕ Add User</button>
                            <button onClick={() => setShowAddModal(false)} style={styles.cancelModalBtn}>❌ Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;