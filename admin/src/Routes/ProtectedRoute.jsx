import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { loadUser } from '../actions/userAction';

const ProtectedRoute = ({ children }) => {
    const dispatch = useDispatch();
    const { loading, isAuthenticated, user } = useSelector((state) => state.user);

    useEffect(() => {
        if (!isAuthenticated) {
            dispatch(loadUser());
        }
    }, [dispatch, isAuthenticated]);

    if (loading === true) {
        return (
            <div className="min-h-screen bg-[#0E1017] flex items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#5B5CE5] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-mono">Verifying Admin Access...</span>
                </div>
            </div>
        );
    }

    if (isAuthenticated === false) {
        return <Navigate to="/login" />;
    }

    if (user && user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'staff') {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;

