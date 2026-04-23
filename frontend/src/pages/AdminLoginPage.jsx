import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess } from '../store/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/login', formData);

            if (response.data.success) {
                const { user, token, isAdmin } = response.data.data;

                // Check if user has admin privileges
                if (user.role !== 'super_admin' && user.role !== 'admin' && !isAdmin) {
                    setError('Access denied. Admin privileges required.');
                    setLoading(false);
                    return;
                }

                dispatch(loginSuccess({ user, token }));
                toast.success(`Welcome ${user.name}!`);
                navigate('/admin/dashboard');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '450px',
                width: '100%',
                background: 'white',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '50px', marginBottom: '10px' }}>👑</div>
                    <h1 style={{ fontSize: '28px', color: '#333' }}>Admin Login</h1>
                    <p style={{ color: '#666' }}>Access Admin Dashboard</p>
                </div>

                {error && (
                    <div style={{
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Admin Email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '12px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '14px',
                                border: '2px solid #e0e0e0',
                                borderRadius: '12px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>← User Login</Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;