import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateAdminPage = () => {
    const { token, user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobileNumber: '',
        role: 'admin'
    });

    // Check if current user is super admin
    const isSuperAdmin = user?.role === 'super_admin';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log('=== CREATE ADMIN DEBUG ===');
        console.log('Form Data:', formData);
        console.log('Token:', token);
        console.log('User Role:', user?.role);

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.mobileNumber) {
            toast.error('All fields are required');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:5000/api/admin/create',
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    mobileNumber: formData.mobileNumber,
                    role: formData.role
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Response:', response.data);

            if (response.data.success) {
                toast.success('✅ Admin created successfully!');
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    mobileNumber: '',
                    role: 'admin'
                });

                setTimeout(() => {
                    navigate('/admin/users');
                }, 2000);
            }
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            const message = error.response?.data?.message || 'Failed to create admin';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isSuperAdmin) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h1>⛔ Access Denied</h1>
                <p>Only Super Admin can create new admin users.</p>
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    style={{
                        padding: '10px 20px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginTop: '20px'
                    }}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const styles = {
        container: {
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px'
        },
        card: {
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        title: {
            fontSize: '28px',
            color: '#333',
            marginBottom: '10px'
        },
        subtitle: {
            color: '#666',
            marginBottom: '30px'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#333'
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.3s'
        },
        select: {
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            fontSize: '14px',
            backgroundColor: 'white'
        },
        button: {
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '10px',
            transition: 'transform 0.3s'
        },
        infoBox: {
            background: '#e3f2fd',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px'
        },
        infoText: {
            color: '#1976d2',
            fontSize: '14px',
            margin: 0
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>👑 Create New Admin</h1>
                <p style={styles.subtitle}>Add a new administrator to the platform</p>

                <div style={styles.infoBox}>
                    <p style={styles.infoText}>
                        ⚠️ Only Super Admin can create new admin users.
                        New admin will have full access to admin panel.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={handleChange}
                            style={styles.input}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="admin@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password *</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            required
                        />
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                            Password must be at least 8 characters
                        </small>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mobile Number *</label>
                        <input
                            type="tel"
                            name="mobileNumber"
                            placeholder="10 digit mobile number"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            style={styles.input}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Role *</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={styles.select}
                        >
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                            Super Admin can create other admins
                        </small>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {loading ? 'Creating Admin...' : '👑 Create Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAdminPage;