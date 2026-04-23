// src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../store/authSlice';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
    const { token, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCompanies: 0,
        totalTenders: 0,
        totalWorkflows: 0,
        activeTenders: 0,
        pendingTenders: 0,
        completedTenders: 0,
        expiredTenders: 0,
        newUsers: 0,
        newCompanies: 0,
        newTenders: 0,
        newWorkflows: 0
    });
    const [recentTenders, setRecentTenders] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobileNumber: user?.mobileNumber || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // useEffect(() => {
    //     // Set a timeout to force loading to false after 3 seconds even if API fails
    //     // const timer = setTimeout(() => {
    //     //     if (loading) {
    //     //         setLoading(false);
    //     //         setDefaultStats();
    //     //         setDefaultTenders();
    //     //     }
    //     // }, 3000);

    //     fetchDashboardData();
    //     fetchRecentTenders();
    //     fetchRecentActivities();

    //     return () => clearTimeout(timer);
    // }, []);

    useEffect(() => {
        if (token) {
            fetchDashboardData();
            fetchRecentTenders();
            fetchRecentActivities();
        }
    }, [token]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.data);
            }

        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error("Dashboard load failed");
        } finally {
            setLoading(false);
        }
    };

    // const setDefaultStats = () => {
    //     setStats({
    //         totalUsers: 18,
    //         totalCompanies: 8,
    //         totalTenders: 45,
    //         totalWorkflows: 12,
    //         activeTenders: 28,
    //         pendingTenders: 10,
    //         completedTenders: 7,
    //         expiredTenders: 5,
    //         newUsers: 3,
    //         newCompanies: 2,
    //         newTenders: 8,
    //         newWorkflows: 4
    //     });
    // };

    const fetchRecentTenders = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tenders?limit=5', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000
            });
            if (response.data && response.data.success) {
                setRecentTenders(response.data.data);
            } else {
                setDefaultTenders();
            }
        } catch (error) {
            console.error('Error fetching tenders:', error);
            setDefaultTenders();
        }
    };

    // const setDefaultTenders = () => {
    //     setRecentTenders([
    //         { _id: '1', title: 'IT Hardware Supply', status: 'active', value: '2.5 Cr', deadline: '2024-03-15' },
    //         { _id: '2', title: 'Office Building Construction', status: 'active', value: '15 Cr', deadline: '2024-03-20' },
    //         { _id: '3', title: 'Cloud Migration Services', status: 'active', value: '3 Cr', deadline: '2024-03-10' },
    //         { _id: '4', title: 'Security Services', status: 'pending', value: '80 L', deadline: '2024-03-25' },
    //         { _id: '5', title: 'E-Governance Portal', status: 'completed', value: '5 Cr', deadline: '2024-03-18' }
    //     ]);
    // };

    const fetchRecentActivities = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/dashboard/activities",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                setRecentActivities(res.data.data);
            }

        } catch (error) {
            console.log("Activity error:", error);
            setRecentActivities([]); // fallback
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await axios.put('http://localhost:5000/api/auth/profile', {
                name: profileData.name,
                mobileNumber: profileData.mobileNumber
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Profile updated successfully');
                setShowProfileModal(false);
                const updatedUser = { ...user, name: profileData.name, mobileNumber: profileData.mobileNumber };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload();
            }
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        try {
            const response = await axios.put('http://localhost:5000/api/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Password changed successfully');
                setShowProfileModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            toast.error('Failed to change password');
        }
    };

    const StatCard = ({ title, value, subtext, icon, color, onClick }) => (
        <div onClick={onClick} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.3s, box-shadow 0.3s'
        }}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                }}>{icon}</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: color }}>{value}</div>
            </div>
            <div style={{ marginTop: '15px', fontWeight: '500', color: '#333' }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{subtext}</div>
        </div>
    );

    // Show dashboard even if loading (with default data)
    const showDashboard = !loading || true;

    const styles = {
        container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' },
        welcomeBox: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px', padding: '30px', color: 'white', flex: 1 },
        profileBtn: { background: 'white', color: '#667eea', padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
        logoutBtn: { background: '#f44336', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' },
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' },
        statusGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' },
        statusCard: { background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
        twoColumn: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
        card: { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modal: { background: 'white', borderRadius: '20px', padding: '30px', width: '90%', maxWidth: '500px' },
        modalTitle: { fontSize: '24px', marginBottom: '20px', textAlign: 'center' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
        input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' },
        modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
        saveBtn: { backgroundColor: '#4caf50', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' },
        cancelBtn: { backgroundColor: '#999', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.welcomeBox}>
                    <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Admin Dashboard</h1>
                    <p>Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! 👑 | {user?.role || 'Admin'}</p>
                </div>
                <div>
                    <button onClick={() => setShowProfileModal(true)} style={styles.profileBtn}>👤 My Profile</button>
                    <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <StatCard title="USERS" value={stats.totalUsers} subtext={`+${stats.newUsers || 0} this month`} icon="👥" color="#4361ee" onClick={() => navigate('/admin/users')} />
                <StatCard title="COMPANIES" value={stats.totalCompanies} subtext={`+${stats.newCompanies || 0} this month`} icon="🏢" color="#4caf50" onClick={() => navigate('/admin/companies')} />
                <StatCard title="TENDERS" value={stats.totalTenders} subtext={`+${stats.newTenders || 0} this month`} icon="📋" color="#ff9800" onClick={() => navigate('/admin/tenders')} />
                <StatCard title="WORKFLOWS" value={stats.totalWorkflows} subtext={`+${stats.newWorkflows} this month`} icon="🔄" color="#9c27b0" onClick={() => navigate('/admin/workflows')} />
            </div>

            {/* Tender Status */}
            <div style={styles.statusGrid}>
                <div style={styles.statusCard}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>{stats.activeTenders}</div>
                    <div style={{ color: '#666' }}>🟢 Active Tenders</div>
                </div>
                <div style={styles.statusCard}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>{stats.pendingTenders}</div>
                    <div style={{ color: '#666' }}>🟡 Pending Tenders</div>
                </div>
                <div style={styles.statusCard}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>{stats.completedTenders}</div>
                    <div style={{ color: '#666' }}>🔵 Completed Tenders</div>
                </div>
                <div style={styles.statusCard}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9c27b0' }}>{stats.expiredTenders}</div>
                    <div style={{ color: '#666' }}>⚫ Expired Tenders</div>
                </div>
            </div>

            {/* Recent Tenders & Activities */}
            <div style={styles.twoColumn}>
                <div style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3>📋 Recent Tenders</h3>
                        <button onClick={() => navigate('/admin/tenders')} style={{ padding: '6px 12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>View All →</button>
                    </div>
                    {recentTenders.map((tender, idx) => (
                        <div key={tender._id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{idx + 1}. {tender.title}</span>
                            <span style={{ color: tender.status === 'active' ? '#4caf50' : tender.status === 'pending' ? '#ff9800' : '#2196f3' }}>
                                {tender.status === 'active' ? '🟢 Active' : tender.status === 'pending' ? '🟡 Pending' : '🔵 Completed'}
                            </span>
                        </div>
                    ))}
                </div>
                <div style={styles.card}>
                    <h3 style={{ marginBottom: '15px' }}>🔄 Recent Activities</h3>
                    {recentActivities.map((activity, idx) => (
                        <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                            <div>{activity.text}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>{activity.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>My Profile</h2>
                        <div style={styles.formGroup}><label style={styles.label}>Name</label><input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} style={styles.input} /></div>
                        <div style={styles.formGroup}><label style={styles.label}>Email</label><input type="email" value={profileData.email} style={styles.input} disabled /></div>
                        <div style={styles.formGroup}><label style={styles.label}>Mobile</label><input type="tel" value={profileData.mobileNumber} onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })} style={styles.input} /></div>
                        <hr />
                        <div style={styles.formGroup}><label style={styles.label}>Current Password</label><input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} style={styles.input} placeholder="Enter current password" /></div>
                        <div style={styles.formGroup}><label style={styles.label}>New Password</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} style={styles.input} placeholder="Min 8 characters" /></div>
                        <div style={styles.formGroup}><label style={styles.label}>Confirm Password</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} style={styles.input} placeholder="Confirm new password" /></div>
                        <div style={styles.modalButtons}>
                            <button onClick={handleUpdateProfile} style={styles.saveBtn}>Update Profile</button>
                            <button onClick={handleChangePassword} style={styles.saveBtn}>Change Password</button>
                            <button onClick={() => setShowProfileModal(false)} style={styles.cancelBtn}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;