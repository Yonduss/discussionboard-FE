import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api, { clearTokens } from "../api/api.js";
import Header from "../components/Header.jsx";
import { useAuth } from "../contexts/AuthContext.js";
import { useModal } from "../contexts/ModalContext.js";

import "../styles/auth.css";
import "../styles/user-edit.css";

function PasswordEditPage() {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const { showMessage } = useModal();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordsMatch =
        newPasswordConfirm !== "" && newPassword === newPasswordConfirm;

    const passwordsDoNotMatch =
        newPasswordConfirm !== "" &&
        newPassword !== newPasswordConfirm;

    async function handleSubmit(event) {
        event.preventDefault();

        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            await showMessage(
                "All fields are required to change your password."
            );
            return;
        }

        if (newPassword !== newPasswordConfirm) {
            await showMessage("New passwords do not match.");
            return;
        }

        try {
            setIsSubmitting(true);

            await api.patch(
                "/api/v1/users/password",
                {
                    currentPassword,
                    newPassword,
                    newPasswordConfirm
                }
            );

            clearTokens();
            setCurrentUser(null);

            await showMessage(
                "Password changed successfully. Please log in again.",
                { variant: "success" }
            );

            navigate("/login", {
                replace: true
            });

        } catch (error) {
            console.error("Password change error:", error);
            await showMessage(
                error.message || "Failed to change password.",
                { variant: "error" }
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Header />

            <main className="auth-page password-edit-page">
                <div className="signup-container">
                    <h1>Edit Password</h1>

                    <form
                        id="passwordEditForm"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label htmlFor="currentPassword">
                                Current Password
                            </label>

                            <input
                                type="password"
                                minLength={8}
                                maxLength={72}
                                id="currentPassword"
                                name="currentPassword"
                                autoComplete="current-password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(event) =>
                                    setCurrentPassword(event.target.value)
                                }
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <input
                                type="password"
                                minLength={8}
                                maxLength={72}
                                id="newPassword"
                                name="newPassword"
                                autoComplete="new-password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(event) =>
                                    setNewPassword(
                                        event.target.value
                                    )
                                }
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                minLength={8}
                                maxLength={72}
                                id="confirmPassword"
                                name="confirmPassword"
                                autoComplete="new-password"
                                placeholder="Confirm new password"
                                value={newPasswordConfirm}
                                onChange={(event) =>
                                    setNewPasswordConfirm(
                                        event.target.value
                                    )
                                }
                                disabled={isSubmitting}
                                required
                            />

                            <div
                                className={`password-match-indicator ${
                                    passwordsMatch ? "match" : passwordsDoNotMatch
                                            ? "nomatch" : ""
                                }`}
                            >
                                {passwordsMatch && "✓ Passwords match"}
                                {passwordsDoNotMatch && "✗ Passwords do not match"}
                            </div>
                        </div>

                        <div className="button-group">
                            <button
                                type="submit"
                                className="save-changes-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Changing..." : "Change Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

export default PasswordEditPage;
