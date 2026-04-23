import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    // Login Form State
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // Signup Form State
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
        companyId: '507f1f77bcf86cd799439011',
    });

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSignupChange = (e) => {
        setSignupData({
            ...signupData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: loginData.email,
                password: loginData.password
            });

            if (response.data.success) {
                dispatch(loginSuccess(response.data.data));
                toast.success('Login successful!');
                navigate('/dashboard');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            setError(message);
            dispatch(loginFailure(message));
            toast.error(message);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (signupData.password !== signupData.confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        if (signupData.password.length < 8) {
            setError('Password must be at least 8 characters');
            toast.error('Password must be at least 8 characters');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                name: signupData.name,
                email: signupData.email,
                mobileNumber: signupData.mobileNumber,
                password: signupData.password,
                companyId: signupData.companyId
            });

            toast.success('Registration successful! Please login.');
            setIsLogin(true);
            setSignupData({
                name: '',
                email: '',
                mobileNumber: '',
                password: '',
                confirmPassword: '',
                companyId: '507f1f77bcf86cd799439011',
            });
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            setError(message);
            toast.error(message);
        }
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        },
        card: {
            maxWidth: '480px',
            width: '100%',
            background: 'white',
            borderRadius: '30px',
            padding: '45px 40px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
            animation: 'fadeInUp 0.5s ease'
        },
        header: {
            textAlign: 'center',
            marginBottom: '35px'
        },
        logo: {
            fontSize: '48px',
            marginBottom: '15px'
        },
        title: {
            fontSize: '28px',
            color: '#333',
            marginBottom: '8px',
            fontWeight: '700'
        },
        subtitle: {
            color: '#666',
            fontSize: '14px'
        },
        toggleButtons: {
            display: 'flex',
            gap: '15px',
            marginBottom: '30px',
            background: '#f5f5f5',
            padding: '5px',
            borderRadius: '15px'
        },
        toggleBtn: {
            flex: 1,
            padding: '12px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            color: '#666'
        },
        toggleBtnActive: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: '500',
            color: '#333',
            fontSize: '14px'
        },
        input: {
            width: '100%',
            padding: '14px 16px',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            outline: 'none',
            fontFamily: 'inherit'
        },
        inputFocus: {
            borderColor: '#667eea',
            boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
        },
        row: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px'
        },
        checkboxRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
        },
        checkbox: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
        },
        forgotLink: {
            color: '#667eea',
            textDecoration: 'none',
            fontSize: '13px'
        },
        button: {
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            marginBottom: '20px'
        },
        buttonDisabled: {
            opacity: 0.7,
            cursor: 'not-allowed'
        },
        divider: {
            textAlign: 'center',
            position: 'relative',
            marginBottom: '20px'
        },
        dividerText: {
            background: 'white',
            padding: '0 15px',
            color: '#999',
            fontSize: '13px',
            position: 'relative',
            zIndex: 1
        },
        dividerLine: {
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: '#e0e0e0',
            zIndex: 0
        },
        adminLink: {
            textAlign: 'center'
        },
        adminBtn: {
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '13px',
            textDecoration: 'underline'
        },
        errorBox: {
            background: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px',
            textAlign: 'center'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logo}>📋</div>
                    <h1 style={styles.title}>Smart Tender</h1>
                    <p style={styles.subtitle}>Intelligence Platform</p>
                </div>

                {/* Toggle Buttons */}
                <div style={styles.toggleButtons}>
                    <button
                        style={{ ...styles.toggleBtn, ...(isLogin ? styles.toggleBtnActive : {}) }}
                        onClick={() => setIsLogin(true)}
                    >
                        LOGIN
                    </button>
                    <button
                        style={{ ...styles.toggleBtn, ...(!isLogin ? styles.toggleBtnActive : {}) }}
                        onClick={() => setIsLogin(false)}
                    >
                        REGISTER
                    </button>
                </div>

                {/* Error Message */}
                {error && <div style={styles.errorBox}>{error}</div>}

                {/* Login Form */}
                {isLogin && (
                    <form onSubmit={handleLoginSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email ID</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                style={styles.input}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                style={styles.input}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                required
                            />
                        </div>

                        <div style={styles.checkboxRow}>
                            <label style={styles.checkbox}>
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" style={styles.forgotLink}>Forget Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
                            onMouseEnter={(e) => {
                                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {loading ? 'Logging in...' : 'LOGIN'}
                        </button>

                        <div style={styles.divider}>
                            <div style={styles.dividerLine}></div>
                            <div style={styles.dividerText}>New to Smart Tender?</div>
                        </div>

                        <div style={styles.adminLink}>
                            <button
                                type="button"
                                style={styles.adminBtn}
                                onClick={() => navigate('/admin/login')}
                            >
                                👑 Admin Login
                            </button>
                        </div>
                    </form>
                )}

                {/* Signup Form */}
                {!isLogin && (
                    <form onSubmit={handleSignupSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={signupData.name}
                                onChange={handleSignupChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email ID</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={signupData.email}
                                onChange={handleSignupChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.row}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Mobile Number</label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    placeholder="Mobile number"
                                    value={signupData.mobileNumber}
                                    onChange={handleSignupChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Company ID</label>
                                <input
                                    type="text"
                                    name="companyId"
                                    placeholder="Company ID"
                                    value={signupData.companyId}
                                    onChange={handleSignupChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Create password (min 8 characters)"
                                value={signupData.password}
                                onChange={handleSignupChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={signupData.confirmPassword}
                                onChange={handleSignupChange}
                                style={styles.input}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
                        >
                            {loading ? 'Creating Account...' : 'REGISTER'}
                        </button>

                        <div style={styles.divider}>
                            <div style={styles.dividerLine}></div>
                            <div style={styles.dividerText}>Already have an account?</div>
                        </div>

                        <div style={styles.adminLink}>
                            <button
                                type="button"
                                style={styles.adminBtn}
                                onClick={() => setIsLogin(true)}
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthPage;