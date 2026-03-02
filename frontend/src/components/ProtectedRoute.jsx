import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const location = useLocation();

    if (!token || !role) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // If user's role isn't allowed here, send them to their own dashboard
        return <Navigate to={`/${role}`} replace />;
    }

    return children;
};

export default ProtectedRoute;
