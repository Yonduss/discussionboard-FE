import { useNavigate } from "react-router-dom";

import Header from "../components/Header.jsx";
import UserEditForm from "../components/UserEditForm.jsx";
import { useAuth } from "../contexts/AuthContext.js";

import "../styles/user-edit.css";

function UserEditPage() {
    const navigate = useNavigate();

    const {
        currentUser,
        setCurrentUser
    } = useAuth();

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
