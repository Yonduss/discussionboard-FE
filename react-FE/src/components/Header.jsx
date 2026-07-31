import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext.js";
import mlbLogo from "../images/MLB_logo.svg";

function Header() {

    const navigate = useNavigate();

    const { currentUser, setCurrentUser, loading } = useAuth();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function handleProfileClick(event) {
        event.stopPropagation();
        setIsDropdownOpen((previous) => !previous);
    }

    function handleLogout() {
        localStorage.clear();
        setCurrentUser(null);
        navigate("/login", {
            replace: true
        });
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (!event.target.closest(".profile-container")) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <header className="top-banner">
            <Link
                to="/posts"
                className="logo-link"
                aria-label="Go to posts page"
            >
                <img
                    src={mlbLogo}
                    alt="MLB logo"
                    className="logo-img"
                />
            </Link>

            <h2>2026 MLB BOARD</h2>

            <div className="profile-container">
                <button
                    type="button"
                    className="profile-circle"
                    onClick={handleProfileClick}
                    aria-label="Open profile menu"
                >
                    {!loading && (
                        currentUser?.profileImageUrl ? (
                            <img
                                src={currentUser.profileImageUrl}
                                alt="Profile"
                            />
                        ) : (
                            currentUser?.nickname?.charAt(0).toUpperCase() || "👤"
                        )
                    )}
                </button>

                <div
                    className={`profile-dropdown ${
                        isDropdownOpen ? "active" : ""
                    }`}
                >
                    <Link to="/users/edit">
                        Edit Profile
                    </Link>

                    <Link to="/users/password-edit">
                        Change Password
                    </Link>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;