// // src/pages/DashboardPage.jsx
// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { logout } from '../store/authSlice';
// import {
//     BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//     PieChart, Pie, Cell
// } from 'recharts';
// import toast from 'react-hot-toast';

// const DashboardPage = () => {
//     const { user, token } = useSelector((state) => state.auth);
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const [loading, setLoading] = useState(true);
//     const [stats, setStats] = useState({
//         totalTenders: 0,
//         eligibleTenders: 0,
//         activeBids: 0,
//         winRate: 0
//     });

//     const [recentTenders, setRecentTenders] = useState([]);
//     const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
//     const [categoryData, setCategoryData] = useState([]);
//     const [scoreDistribution, setScoreDistribution] = useState([]);
//     const [recentActivities, setRecentActivities] = useState([]);
//     const [topTenders, setTopTenders] = useState([]);

//     useEffect(() => {
//         if (token) fetchData();
//     }, [token]);

//     const fetchData = async () => {
//         try {
//             setLoading(true);

//             // ✅ STATS
//             const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });

//             if (statsRes.data.success) {
//                 const data = statsRes.data.data;
//                 setStats({
//                     totalTenders: data.tenders?.total ?? 0,
//                     eligibleTenders: data.tenders?.eligible ?? 0,
//                     activeBids: data.workflows?.submitted ?? 0,
//                     winRate: Number(data.workflows?.winRate) || 0
//                 });
//             }

//             // ✅ RECENT TENDERS
//             const recentRes = await axios.get('http://localhost:5000/api/tenders?limit=5', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setRecentTenders(recentRes.data.data || []);

//             // ✅ DEADLINES FIXED
//             const today = new Date();
//             const res = await axios.get('http://localhost:5000/api/tenders', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });

//             const deadlines = (res.data.data || [])
//                 .map(t => {
//                     const daysLeft = Math.ceil(
//                         (new Date(t.bidSubmissionDeadline) - today) / (1000 * 60 * 60 * 24)
//                     );

//                     if (daysLeft < 0) return null;

//                     return {
//                         id: t._id,
//                         title: t.title,
//                         daysLeft,
//                         priority: daysLeft <= 2 ? 'high' : daysLeft <= 5 ? 'medium' : 'low'
//                     };
//                 })
//                 .filter(Boolean);

//             setUpcomingDeadlines(deadlines.slice(0, 5));

//             // ✅ CATEGORY
//             const tenders = res.data.data || [];
//             const catMap = {};
//             tenders.forEach(t => {
//                 const cat = t.category || 'Other';
//                 catMap[cat] = (catMap[cat] || 0) + 1;
//             });
//             setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

//             // ✅ SCORE
//             const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
//             tenders.forEach(t => {
//                 const score = t.eligibilityScore || 0;
//                 if (score <= 20) buckets['0-20']++;
//                 else if (score <= 40) buckets['21-40']++;
//                 else if (score <= 60) buckets['41-60']++;
//                 else if (score <= 80) buckets['61-80']++;
//                 else buckets['81-100']++;
//             });
//             setScoreDistribution(Object.entries(buckets).map(([range, count]) => ({ range, count })));

//             // ✅ TOP TENDERS
//             const top = [...tenders].sort((a, b) => (b.eligibilityScore || 0) - (a.eligibilityScore || 0)).slice(0, 5);
//             setTopTenders(top);

//             // ✅ ACTIVITIES (temporary safe)
//             setRecentActivities([
//                 { id: 1, text: 'Dashboard loaded successfully', time: 'Just now' }
//             ]);

//         } catch (err) {
//             console.error(err);
//             toast.error("Dashboard error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleLogout = () => {
//         dispatch(logout());
//         navigate('/');
//     };

//     const matchRate = stats.totalTenders
//         ? Math.round((stats.eligibleTenders / stats.totalTenders) * 100)
//         : 0;

//     const COLORS = ['#4361ee', '#4caf50', '#ff9800', '#9c27b0'];

//     const StatCard = ({ title, value, subtext, icon, color, onClick }) => (
//         <div onClick={onClick} style={{
//             background: 'white',
//             borderRadius: '16px',
//             padding: '20px',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
//         }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                 <div>{icon}</div>
//                 <div style={{ fontSize: '28px', color }}>{value}</div>
//             </div>
//             <div>{title}</div>
//             <div style={{ fontSize: '12px' }}>{subtext}</div>
//         </div>
//     );

//     if (loading) return <div>Loading...</div>;

//     return (
//         <div style={{ padding: '20px' }}>

//             <h2>Welcome, {user?.name}</h2>

//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
//                 <StatCard title="Total Tenders" value={stats.totalTenders} subtext="Available" icon="📋" color="#4361ee" />
//                 <StatCard title="Eligible" value={stats.eligibleTenders} subtext={`${matchRate}% match`} icon="✅" color="#4caf50" />
//                 <StatCard title="Active Bids" value={stats.activeBids} subtext="Running" icon="🚀" color="#ff9800" />
//                 <StatCard title="Win Rate" value={`${stats.winRate}%`} subtext="Success" icon="🏆" color="#9c27b0" />
//             </div>

//             <h3>Recent Tenders</h3>
//             {(recentTenders || []).map(t => (
//                 <div key={t._id}>{t.title}</div>
//             ))}

//             <h3>Deadlines</h3>
//             {(upcomingDeadlines || []).map(d => (
//                 <div key={d.id}>
//                     {d.title} - {d.daysLeft} days
//                 </div>
//             ))}

//             <h3>Top Tenders</h3>
//             {(topTenders || []).map(t => (
//                 <div key={t._id}>{t.title}</div>
//             ))}

//             <h3>Activities</h3>
//             {(recentActivities || []).map(a => (
//                 <div key={a.id}>{a.text}</div>
//             ))}

//         </div>
//     );
// };

// export default DashboardPage;

// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../store/authSlice';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    const [stats, setStats] = useState({
        totalTenders: 0,
        eligibleTenders: 0,
        activeBids: 0,
        winRate: 0
    });

    const [recentTenders, setRecentTenders] = useState([]);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [scoreDistribution, setScoreDistribution] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [topTenders, setTopTenders] = useState([]);

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (statsRes.data.success) {
                const data = statsRes.data.data;
                setStats({
                    totalTenders: data.tenders?.total ?? 0,
                    eligibleTenders: data.tenders?.eligible ?? 0,
                    activeBids: data.workflows?.submitted ?? 0,
                    winRate: Number(data.workflows?.winRate) || 0
                });
            }

            const recentRes = await axios.get('http://localhost:5000/api/tenders?limit=5', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecentTenders(recentRes.data.data || []);

            const today = new Date();
            const res = await axios.get('http://localhost:5000/api/tenders', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const deadlines = (res.data.data || [])
                .map(t => {
                    const daysLeft = Math.ceil(
                        (new Date(t.bidSubmissionDeadline) - today) / (1000 * 60 * 60 * 24)
                    );
                    if (daysLeft < 0) return null;
                    return {
                        id: t._id,
                        title: t.title,
                        daysLeft,
                        priority: daysLeft <= 2 ? 'high' : daysLeft <= 5 ? 'medium' : 'low'
                    };
                })
                .filter(Boolean);

            setUpcomingDeadlines(deadlines.slice(0, 5));

            const tenders = res.data.data || [];
            const catMap = {};
            tenders.forEach(t => {
                const cat = t.category || 'Other';
                catMap[cat] = (catMap[cat] || 0) + 1;
            });
            setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

            const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
            tenders.forEach(t => {
                const score = t.eligibilityScore || 0;
                if (score <= 20) buckets['0-20']++;
                else if (score <= 40) buckets['21-40']++;
                else if (score <= 60) buckets['41-60']++;
                else if (score <= 80) buckets['61-80']++;
                else buckets['81-100']++;
            });
            setScoreDistribution(Object.entries(buckets).map(([range, count]) => ({ range, count })));

            const top = [...tenders].sort((a, b) => (b.eligibilityScore || 0) - (a.eligibilityScore || 0)).slice(0, 5);
            setTopTenders(top);

            setRecentActivities([
                { id: 1, text: 'Dashboard loaded successfully', time: 'Just now', type: 'success' }
            ]);

        } catch (err) {
            console.error(err);
            toast.error("Dashboard error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await axios.put('http://localhost:5000/api/auth/profile', {
                name: profileData.name,
                mobileNumber: profileData.mobileNumber
            }, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                toast.success('Profile updated successfully');
                const updatedUser = { ...user, name: profileData.name, mobileNumber: profileData.mobileNumber };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setShowProfileModal(false);
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
            }, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                toast.success('Password changed successfully! Please login again.');
                setShowProfileModal(false);
                setTimeout(() => {
                    dispatch(logout());
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            toast.error('Failed to change password');
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const matchRate = stats.totalTenders
        ? Math.round((stats.eligibleTenders / stats.totalTenders) * 100)
        : 0;

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
        return `₹${amount.toLocaleString()}`;
    };

    const getScoreColor = (score) => {
        if (score >= 70) return '#4caf50';
        if (score >= 50) return '#ff9800';
        return '#f44336';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#f44336';
            case 'medium': return '#ff9800';
            default: return '#4caf50';
        }
    };

    const COLORS = ['#4361ee', '#4caf50', '#ff9800', '#9c27b0', '#2196f3'];

    const StatCard = ({ title, value, subtext, icon, color, onClick }) => (
        <div onClick={onClick} className="stat-card" style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.3s, box-shadow 0.3s'
        }}
            onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{
                    width: '54px', height: '54px', borderRadius: '16px', background: `${color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
                }}>{icon}</div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: color }}>{value}</div>
            </div>
            <div style={{ marginTop: '16px', fontWeight: '600', fontSize: '15px', color: '#333' }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>{subtext}</div>
        </div>
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    animation: fadeInUp 0.5s ease;
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }
                .dashboard-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 24px;
                    animation: fadeInUp 0.5s ease;
                }
                .welcome-section {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 24px;
                    padding: 32px;
                    margin-bottom: 32px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }
                .welcome-section::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    animation: pulse 10s ease infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .chart-card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    transition: transform 0.3s;
                }
                .chart-card:hover {
                    transform: translateY(-5px);
                }
                .card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    transition: transform 0.3s;
                }
                .card:hover {
                    transform: translateY(-3px);
                }
                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: #333;
                    border-left: 4px solid #667eea;
                    padding-left: 12px;
                }
                .tender-item {
                    padding: 14px;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: background 0.2s;
                    border-radius: 12px;
                }
                .tender-item:hover {
                    background: #f8f9fa;
                }
                .deadline-item {
                    padding: 14px;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .priority-high {
                    background: #f44336;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 500;
                }
                .priority-medium {
                    background: #ff9800;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 500;
                }
                .priority-low {
                    background: #4caf50;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 500;
                }
                .score-badge {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    color: white;
                }
                .activity-item {
                    padding: 12px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                .profile-btn {
                    background: white;
                    color: #667eea;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .profile-btn:hover {
                    background: #f0f4ff;
                    transform: translateY(-2px);
                }
                .logout-btn {
                    background: #f44336;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-left: 10px;
                    transition: all 0.3s;
                }
                .logout-btn:hover {
                    background: #d32f2f;
                    transform: translateY(-2px);
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal {
                    background: white;
                    border-radius: 24px;
                    padding: 32px;
                    width: 90%;
                    max-width: 500px;
                    animation: fadeInUp 0.3s ease;
                }
                .modal-title {
                    font-size: 24px;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: 600;
                    color: #555;
                }
                .form-input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    font-size: 14px;
                    transition: border-color 0.3s;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #667eea;
                }
                .modal-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }
                .btn-save {
                    background: #4caf50;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .btn-cancel {
                    background: #999;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                }
                @media (max-width: 1024px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .charts-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 640px) {
                    .stats-grid { grid-template-columns: 1fr; }
                    .dashboard-container { padding: 16px; }
                    .welcome-section { padding: 20px; }
                }
            `}</style>

            {/* Header with Profile and Logout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                <div className="welcome-section" style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
                    <p style={{ opacity: 0.9 }}>Here's what's happening with your tenders today.</p>
                </div>
                <div>
                    <button onClick={() => setShowProfileModal(true)} className="profile-btn">👤 My Profile</button>
                    <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <StatCard title="Total Tenders" value={stats.totalTenders} subtext="Available for bidding" icon="📋" color="#4361ee" onClick={() => navigate('/tenders')} />
                <StatCard title="Eligible Tenders" value={stats.eligibleTenders} subtext={`${matchRate}% match rate`} icon="✅" color="#4caf50" onClick={() => navigate('/tenders')} />
                <StatCard title="Active Bids" value={stats.activeBids} subtext="In progress" icon="🚀" color="#ff9800" onClick={() => navigate('/workflows')} />
                <StatCard title="Win Rate" value={`${stats.winRate}%`} subtext="Success rate" icon="🏆" color="#9c27b0" />
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="section-title">📊 Tenders by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip /><Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3 className="section-title">📈 Eligibility Score Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={scoreDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" /><YAxis /><Tooltip />
                            <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Tenders & Upcoming Deadlines */}
            <div className="charts-grid">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 className="section-title" style={{ marginBottom: 0 }}>📋 Recent Tenders</h3>
                        <button onClick={() => navigate('/tenders')} style={{ padding: '6px 12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>View All →</button>
                    </div>
                    {recentTenders.map(tender => (
                        <div key={tender._id} onClick={() => navigate(`/tenders/${tender._id}`)} className="tender-item">
                            <div><strong>{tender.title}</strong><br /><small style={{ color: '#999' }}>{tender.category} • {formatCurrency(tender.estimatedValue?.amount)}</small></div>
                            <span className="score-badge" style={{ background: getScoreColor(tender.eligibilityScore || 0) }}>{tender.eligibilityScore || 0}%</span>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <h3 className="section-title">⏰ Upcoming Deadlines</h3>
                    {upcomingDeadlines.map(deadline => (
                        <div key={deadline.id} className="deadline-item">
                            <div><strong>{deadline.title}</strong><br /><small>{deadline.daysLeft} days left</small></div>
                            <span className={`priority-${deadline.priority}`}>{deadline.priority === 'high' ? '🔴 High' : deadline.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}</span>
                        </div>
                    ))}
                    {upcomingDeadlines.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No upcoming deadlines</p>}
                </div>
            </div>

            {/* Top Tenders & Recent Activities */}
            <div className="charts-grid">
                <div className="card">
                    <h3 className="section-title">🏆 Top Rated Tenders</h3>
                    {topTenders.map((tender, idx) => (
                        <div key={tender._id} onClick={() => navigate(`/tenders/${tender._id}`)} className="tender-item">
                            <div><span style={{ fontWeight: 'bold', color: '#ff9800' }}>#{idx + 1}</span> {tender.title}</div>
                            <span className="score-badge" style={{ background: '#4caf50' }}>{tender.eligibilityScore || 0}%</span>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <h3 className="section-title">🔄 Recent Activities</h3>
                    {recentActivities.map(activity => (
                        <div key={activity.id} className="activity-item">
                            <div>{activity.text}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>{activity.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">My Profile</h2>
                        <div className="form-group"><label className="form-label">Name</label><input type="text" className="form-input" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} /></div>
                        <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={profileData.email} disabled style={{ background: '#f5f5f5' }} /></div>
                        <div className="form-group"><label className="form-label">Mobile</label><input type="tel" className="form-input" value={profileData.mobileNumber} onChange={e => setProfileData({ ...profileData, mobileNumber: e.target.value })} /></div>
                        <hr style={{ margin: '20px 0' }} />
                        <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Change Password</h3>
                        <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} placeholder="Enter current password" /></div>
                        <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} placeholder="Min 8 characters" /></div>
                        <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-input" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} placeholder="Confirm new password" /></div>
                        <form className="modal-buttons">
                            <button onClick={handleUpdateProfile} className="btn-save">Update Profile</button>
                            <button onClick={handleChangePassword} className="btn-save" style={{ background: '#ff9800' }}>Change Password</button>
                            <button onClick={() => setShowProfileModal(false)} className="btn-cancel">Close</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;