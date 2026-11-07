import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import BackdropLoader from '../components/Layouts/BackdropLoader';

const ProtectedRoute = ({ children, isAdmin }) => {
    const { loading, isAuthenticated, user } = useSelector(state => state.user);

    if (loading === true) {
        return <BackdropLoader />;
    }

    if (isAuthenticated === false) {
        return <Navigate to="/login" replace />;
    }

    if (isAdmin && user && user.role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
