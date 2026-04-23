import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const menuItems = [
        { path: '/dashboard', name: 'Dashboard', icon: '📊' },
        { path: '/tenders', name: 'Tenders', icon: '📋' },
        { path: '/workflows', name: 'Workflows', icon: '🔄' },
        { path: '/company', name: 'Company', icon: '🏢' },
        { path: '/profile', name: 'Profile', icon: '👤' },  // Profile link added
    ];

    // Admin menu items
    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
    const adminMenuItems = [
        { path: '/admin/dashboard', name: 'Admin Panel', icon: '👑' },
        { path: '/admin/create', name: 'Create Admin', icon: '➕' },
    ];

    return (
        <div style={{
            width: '260px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: 'white',
            height: 'calc(100vh - 70px)',
            position: 'fixed',
            top: '70px',
            left: 0,
            overflowY: 'auto',
            boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
        }}>
            <div style={{ padding: '20px' }}>
                {/* User Info */}
                <div style={{
                    textAlign: 'center',
                    paddingBottom: '20px',
                    marginBottom: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px',
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: '500', marginBottom: '5px' }}>{user?.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{user?.role}</div>
                </div>

                {/* Main Menu */}
                {menuItems.map((item) => (
                    <div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            padding: '12px 15px',
                            marginBottom: '5px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            background: location.pathname === item.path ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                        onMouseEnter={(e) => {
                            if (location.pathname !== item.path) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (location.pathname !== item.path) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>{item.icon}</span>
                        <span>{item.name}</span>
                    </div>
                ))}

                {/* Admin Section */}
                {isAdmin && (
                    <>
                        <div style={{
                            padding: '12px 15px',
                            marginTop: '10px',
                            fontSize: '12px',
                            opacity: 0.7,
                            letterSpacing: '1px'
                        }}>
                            ADMIN
                        </div>
                        {adminMenuItems.map((item) => (
                            <div
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                style={{
                                    padding: '12px 15px',
                                    marginBottom: '5px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    background: location.pathname === item.path ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => {
                                    if (location.pathname !== item.path) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (location.pathname !== item.path) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                <span>{item.name}</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;