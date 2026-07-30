import { Navigate, Outlet } from "react-router-dom";

import { getAccessToken } from "../api/api.js";
import { useAuth } from "../contexts/AuthContext.js";

function ProtectedRoute() {
    const {
        currentUser,
        loading
    } = useAuth();

    if (loading) {
        return (
            <main>
                Loading...
            </main>
        );
    }

    if (!getAccessToken() || !currentUser) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;
