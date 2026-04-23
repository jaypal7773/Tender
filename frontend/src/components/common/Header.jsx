import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import toast from 'react-hot-toast';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully!');
        navigate('/login');
    };

    const getUserInitials = () => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Check if user is admin
    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin' || user?.isAdmin === true;

    return (
        <header style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '0 30px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '70px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/dashboard')}
                >
                    <span style={{ fontSize: '24px' }}>📋</span>
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Smart Tender Platform</span>
                </div>

                {/* Right Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Admin Panel Button - Only visible to admins */}
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.3)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.2)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            <span>👑</span>
                            <span>Admin Panel</span>
                        </button>
                    )}

                    {/* User Menu */}
                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                background: showDropdown ? 'rgba(255,255,255,0.2)' : 'transparent'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: '#fff',
                                color: '#667eea',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }}>
                                {getUserInitials()}
                            </div>
                            <div>
                                <div style={{ fontWeight: '500' }}>{user?.name?.split(' ')[0]}</div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>{user?.role?.replace('_', ' ')}</div>
                            </div>
                            <span style={{ fontSize: '12px' }}>▼</span>
                        </div>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '10px',
                                background: 'white',
                                borderRadius: '10px',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                                minWidth: '220px',
                                zIndex: 1001,
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '15px',
                                    borderBottom: '1px solid #eee',
                                    background: '#f8f9fa'
                                }}>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>{user?.name}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{user?.email}</div>
                                    {isAdmin && (
                                        <div style={{
                                            marginTop: '8px',
                                            padding: '4px 8px',
                                            background: '#667eea20',
                                            color: '#667eea',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            fontWeight: '500',
                                            display: 'inline-block'
                                        }}>
                                            👑 Admin Access
                                        </div>
                                    )}
                                </div>

                                {/* Admin Dashboard Link in Dropdown */}
                                {isAdmin && (
                                    <div
                                        onClick={() => {
                                            setShowDropdown(false);
                                            navigate('/admin/dashboard');
                                        }}
                                        style={{
                                            padding: '12px 15px',
                                            cursor: 'pointer',
                                            color: '#333',
                                            transition: 'background 0.2s',
                                            borderBottom: '1px solid #eee',
                                            background: '#f0f4ff'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#e8edff'}
                                        onMouseLeave={(e) => e.target.style.background = '#f0f4ff'}
                                    >
                                        <span style={{ marginRight: '10px' }}>👑</span>
                                        Admin Dashboard
                                    </div>
                                )}

                                <div
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/profile');
                                    }}
                                    style={{
                                        padding: '12px 15px',
                                        cursor: 'pointer',
                                        color: '#333',
                                        transition: 'background 0.2s',
                                        borderBottom: '1px solid #eee'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    <span style={{ marginRight: '10px' }}>👤</span>
                                    My Profile
                                </div>

                                <div
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/company');
                                    }}
                                    style={{
                                        padding: '12px 15px',
                                        cursor: 'pointer',
                                        color: '#333',
                                        transition: 'background 0.2s',
                                        borderBottom: '1px solid #eee'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    <span style={{ marginRight: '10px' }}>🏢</span>
                                    Company Profile
                                </div>

                                <div
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/tenders');
                                    }}
                                    style={{
                                        padding: '12px 15px',
                                        cursor: 'pointer',
                                        color: '#333',
                                        transition: 'background 0.2s',
                                        borderBottom: '1px solid #eee'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    <span style={{ marginRight: '10px' }}>📋</span>
                                    Browse Tenders
                                </div>

                                <div
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/workflows');
                                    }}
                                    style={{
                                        padding: '12px 15px',
                                        cursor: 'pointer',
                                        color: '#333',
                                        transition: 'background 0.2s',
                                        borderBottom: '1px solid #eee'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    <span style={{ marginRight: '10px' }}>🔄</span>
                                    Workflows
                                </div>

                                <div
                                    onClick={handleLogout}
                                    style={{
                                        padding: '12px 15px',
                                        cursor: 'pointer',
                                        color: '#dc3545',
                                        transition: 'background 0.2s',
                                        fontWeight: '500',
                                        borderTop: '1px solid #eee'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#fee'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                >
                                    <span style={{ marginRight: '10px' }}>🚪</span>
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;