// import React, { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';

// const LoginPage = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { loading, error } = useSelector((state) => state.auth);
//     const [showPassword, setShowPassword] = useState(false);
//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//     });

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         dispatch(loginStart());

//         try {
//             const response = await axios.post('http://localhost:5000/api/auth/login', formData);
//             dispatch(loginSuccess(response.data.data));
//             toast.success('Login successful!');
//             navigate('/dashboard');
//         } catch (error) {
//             const message = error.response?.data?.message || 'Login failed';
//             dispatch(loginFailure(message));
//             toast.error(message);
//         }
//     };

//     return (
//         <div className="login-container">
//             <div className="login-card">
//                 <div className="login-header">
//                     <div className="login-icon">📋</div>
//                     <h1>Welcome Back!</h1>
//                     <p>Login to your account</p>
//                 </div>

//                 {error && <div className="alert alert-error">{error}</div>}

//                 <form onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label className="form-label">Email Address</label>
//                         <div className="input-icon">
//                             <Email className="icon" />
//                             <input
//                                 type="email"
//                                 name="email"
//                                 className="form-input"
//                                 placeholder="Enter your email"
//                                 value={formData.email}
//                                 onChange={handleChange}
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <div className="form-group">
//                         <label className="form-label">Password</label>
//                         <div className="input-icon">
//                             <Lock className="icon" />
//                             <input
//                                 type={showPassword ? 'text' : 'password'}
//                                 name="password"
//                                 className="form-input"
//                                 placeholder="Enter your password"
//                                 value={formData.password}
//                                 onChange={handleChange}
//                                 required
//                             />
//                             <button
//                                 type="button"
//                                 className="password-toggle"
//                                 onClick={() => setShowPassword(!showPassword)}
//                             >
//                                 {showPassword ? <VisibilityOff /> : <Visibility />}
//                             </button>
//                         </div>
//                     </div>

//                     <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
//                         {loading ? 'Logging in...' : 'Sign In'}
//                     </button>
//                 </form>

//                 <div className="login-footer">
//                     <p>Don't have an account? <Link to="/register">Create Account</Link></p>
//                     <Link to="/admin/login" className="admin-link">👑 Admin Login</Link>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { api } from '../api';
import toast from 'react-hot-toast';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(loginStart());

        try {
            const response = await api.post('/api/auth/login', formData);

            // ✅ backend response structure handle
            const userData = response.data.data;

            dispatch(loginSuccess(userData));

            // ✅ token save (अगर है)
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }

            toast.success('Login successful!');
            navigate('/dashboard');

        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            dispatch(loginFailure(message));
            toast.error(message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">📋</div>
                    <h1>Welcome Back!</h1>
                    <p>Login to your account</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-icon">
                            <Email className="icon" />
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-icon">
                            <Lock className="icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <Link to="/register">Create Account</Link></p>
                    <Link to="/admin/login" className="admin-link">👑 Admin Login</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;