import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import MetaData from '../Layouts/MetaData';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';

const AdminLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // If user is already logged in with admin credentials, navigate to dashboard
    const { isAuthenticated, user } = useSelector((state) => state.user);

    useEffect(() => {
        if (isAuthenticated && user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'staff')) {
            navigate('/admin/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post('/api/v1/admin/login', { email, password }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (data && data.success) {
                enqueueSnackbar('Admin Authentication Successful. Welcome back!', { variant: 'success' });
                dispatch({ type: 'LOGIN_USER_SUCCESS', payload: data.user });
                navigate('/admin/dashboard');
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || 'Admin Authentication Failed: Invalid credentials or insufficient permissions', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = (emailVal, passVal) => {
        setEmail(emailVal);
        setPassword(passVal);
    };

    return (
        <div className="min-h-screen bg-[#0E1017] flex items-center justify-center p-4">
            <MetaData title="Admin Sign In | Nexmart Management Suite" />

            <div className="w-full max-w-md bg-[#171825] border border-[#232538] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#5B5CE5]/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Logo and Header */}
                <div className="text-center space-y-3 mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#5B5CE5]/15 border border-[#5B5CE5]/30 text-[#818CF8] shadow-lg shadow-[#5B5CE5]/20">
                        <SecurityRoundedIcon sx={{ fontSize: 32 }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                            <span>Nexmart</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#5B5CE5] text-white">
                                Admin Suite
                            </span>
                        </h1>
                        <p className="text-xs text-[#8E92BC] mt-1">
                            Secure Portal for Store Owners, Managers & Staff
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Administrator Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#63688E]">
                                <EmailOutlinedIcon sx={{ fontSize: 18 }} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none transition-colors"
                                placeholder="admin@flipkart.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Security Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#63688E]">
                                <LockOutlinedIcon sx={{ fontSize: 18 }} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl pl-10 pr-10 py-3 text-xs text-white outline-none transition-colors"
                                placeholder="••••••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#63688E] hover:text-white transition-colors cursor-pointer"
                            >
                                {showPassword ? (
                                    <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                                ) : (
                                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-[#5B5CE5] hover:bg-[#4E4FD9] text-white text-xs font-bold shadow-lg shadow-[#5B5CE5]/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
                    </button>
                </form>

                {/* Quick 1-Click Master Login Shortcut */}
                <div className="mt-6 pt-5 border-t border-[#232538] text-center">
                    <p className="text-[11px] text-[#63688E] mb-2 font-medium">Quick Master Admin Fill:</p>
                    <button
                        type="button"
                        onClick={() => handleQuickLogin('admin@flipkart.com', 'admin123')}
                        className="px-3 py-1.5 rounded-lg bg-[#202234] hover:bg-[#2B2E44] border border-[#2F3249] text-[11px] font-mono text-[#818CF8] transition-colors cursor-pointer"
                    >
                        ⚡ admin@flipkart.com / admin123
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <a
                        href="http://localhost:3000"
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        ← Back to Customer Storefront
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
