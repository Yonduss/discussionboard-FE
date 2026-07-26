import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header.jsx";
import UserEditForm from "../components/UserEditForm.jsx";
import { useAuth } from "../contexts/AuthContext.js";

import "../styles/user-edit.css";

function UserEditPage() {
    const navigate = useNavigate();

    const {
        currentUser,
        setCurrentUser,
        loading: authLoading
    } = useAuth();

    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate("/login", {
                replace: true
            });
        }
    }, [
        authLoading,
        currentUser,
        navigate
    ]);

    if (authLoading || !currentUser) {
        return (
            <>
                <Header />

                <main className="auth-page">
                    <div className="signup-container">
                        Loading profile...
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />

            <UserEditForm
                key={currentUser.id}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                navigate={navigate}
            />
        </>
    );
}

export default UserEditPage;