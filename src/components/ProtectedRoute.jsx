import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, allowedRoles = ["student", "admin"] }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

    return children;
};