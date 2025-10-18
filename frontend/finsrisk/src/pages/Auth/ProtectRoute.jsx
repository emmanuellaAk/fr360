import { Navigate, Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from "../../context/AuthContext";

const ProtectRoute = ({ children }) => {

    const { isAuthenticated, loading } = useAuth()// Replace with actual auth logic

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }
    return (
        <DashboardLayout>{children ? children : <Outlet />}</DashboardLayout>
    )
}

export default ProtectRoute