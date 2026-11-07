import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import BackdropLoader from '../components/Layouts/BackdropLoader';

const ProtectedRoute = ({ children, isAdmin }) => {
    const { loading, isAuthenticated, user } = useSelector(state => state.user);

    // Also check localStorage for seamless session restoration on page reload
    let cachedUser = null;
    try {
        const saved = localStorage.getItem('user');
        if (saved) cachedUser = JSON.parse(saved);
    } catch (e) {}

    const currentUser = user || cachedUser;
    const isAuth = isAuthenticated || Boolean(cachedUser && localStorage.getItem('token'));

    if (loading === true && !currentUser) {
        return <BackdropLoader />;
    }

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    if (isAdmin && currentUser && currentUser.role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
