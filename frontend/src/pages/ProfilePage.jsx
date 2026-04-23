import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loginSuccess } from '../store/authSlice';

const ProfilePage = () => {
    const { user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        mobileNumber: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                mobileNumber: user.mobileNumber || ''
            });
        }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setProfile(response.data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log('Updating profile:', { name: profile.name, mobileNumber: profile.mobileNumber });

        try {
            const response = await axios.put(
                'http://localhost:5000/api/users/profile',
                {
                    name: profile.name,
                    mobileNumber: profile.mobileNumber
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Update response:', response.data);

            if (response.data.success) {
                toast.success('Profile updated successfully!');

                // Update Redux store
                const updatedUser = {
                    ...user,
                    name: profile.name,
                    mobileNumber: profile.mobileNumber
                };
                dispatch(loginSuccess({ user: updatedUser, token }));
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Refresh page to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('Update error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/users/change-password',
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Password changed successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordModal(false);
            }
        } catch (error) {
            console.error('Password error:', error);
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: { maxWidth: '600px', margin: '50px auto', padding: '20px' },
        card: { background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' },
        title: { marginBottom: '25px', borderBottom: '2px solid #667eea', paddingBottom: '10px', color: '#333' },
        formGroup: { marginBottom: '20px' },
        label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' },
        input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
        buttonGroup: { display: 'flex', gap: '15px', marginTop: '20px' },
        primaryBtn: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer' },
        secondaryBtn: { background: '#6c757d', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '450px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>My Profile</h2>

                <form onSubmit={handleUpdateProfile}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleProfileChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={profile.email}
                            style={{ ...styles.input, background: '#f5f5f5' }}
                            disabled
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobileNumber"
                            value={profile.mobileNumber}
                            onChange={handleProfileChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.buttonGroup}>
                        <button type="submit" disabled={loading} style={styles.primaryBtn}>
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                        <button type="button" onClick={() => setShowPasswordModal(true)} style={styles.secondaryBtn}>
                            Change Password
                        </button>
                    </div>
                </form>
            </div>

            {showPasswordModal && (
                <div style={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>Change Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <div style={styles.formGroup}>
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>New Password (Min 6 characters)</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.buttonGroup}>
                                <button type="submit" disabled={loading} style={styles.primaryBtn}>
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button type="button" onClick={() => setShowPasswordModal(false)} style={styles.secondaryBtn}>
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage; 