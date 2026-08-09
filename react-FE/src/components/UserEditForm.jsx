import { useState } from "react";

import api, { clearTokens } from "../api/api.js";
import { useModal } from "../contexts/ModalContext.js";

function UserEditForm({
                          currentUser,
                          setCurrentUser,
                          navigate
                      }) {
    const { showMessage, showConfirm } = useModal();
    const [nickname, setNickname] = useState(
        currentUser.nickname
    );

    const [profileImageUrl, setProfileImageUrl] = useState(
        currentUser.personalProfileImageUrl ?? currentUser.profileImageUrl ?? ""
    );

    const [profilePreviewUrl, setProfilePreviewUrl] = useState(
        currentUser.personalProfileImageUrl ?? currentUser.profileImageUrl ?? ""
    );

    const [isProfileUrlBoxOpen, setIsProfileUrlBoxOpen] = useState(false);
    const [nicknameError, setNicknameError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isBusy = isSaving || isDeleting;

    function handleProfileCircleClick() {
        setIsProfileUrlBoxOpen(
            (previous) => !previous
        );
    }

    function handleProfileImageKeyDown(event) {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        const trimmedUrl = profileImageUrl.trim();

        setProfilePreviewUrl(trimmedUrl);
        setIsProfileUrlBoxOpen(false);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isBusy) {
            return;
        }

        const trimmedNickname = nickname.trim();
        const trimmedProfileImageUrl = profileImageUrl.trim();

        if (!trimmedNickname) {
            setNicknameError("Nickname is required.");
            return;
        }

        setNicknameError("");

        try {
            setIsSaving(true);

            const result = await api.patch(
                "/api/v1/users",
                {
                    nickname: trimmedNickname,
                    profileImageUrl:
                        trimmedProfileImageUrl || null
                }
            );

            setCurrentUser(result.data);

            await showMessage("Profile updated successfully.", {
                variant: "success"
            });

            navigate("/posts", {
                replace: true
            });
        } catch (error) {
            console.error("Update profile error:", error);

            await showMessage(error.message || "Failed to update profile.", {
                variant: "error"
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteAccount() {
        if (isBusy) {
            return;
        }

        const confirmed = await showConfirm(
            "Are you sure you want to delete your account? This cannot be undone.",
            {
                title: "Delete account",
                confirmText: "Delete Account",
                confirmVariant: "danger"
            }
        );

        if (!confirmed) {
            return;
        }

        try {
            setIsDeleting(true);

            await api.delete("/api/v1/users");

            clearTokens();
            setCurrentUser(null);

            await showMessage("Account deleted successfully.", {
                variant: "success"
            });

            navigate("/login", {
                replace: true
            });
        } catch (error) {
            console.error("Delete account error:", error);
            await showMessage(error.message || "Failed to delete account.", {
                variant: "error"
            });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <main className="auth-page user-edit-page">
            <div className="signup-container">
                <h1>Edit Profile</h1>

                <section className="edit-profile-section">
                    <div
                        className="edit-profile-image-container"
                        onClick={handleProfileCircleClick}
                        role="button"
                        tabIndex={0}
                        aria-label="Edit profile image"
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleProfileCircleClick();
                            }
                        }}
                    >
                        <div
                            className={`edit-profile-circle ${
                                profilePreviewUrl ? "" : "empty"
                            }`}
                            title="Click to edit profile image"
                        >
                            {profilePreviewUrl && (
                                <img
                                    src={profilePreviewUrl}
                                    alt="Profile preview"
                                    onError={() =>
                                        setProfilePreviewUrl("")
                                    }
                                />
                            )}
                        </div>
                    </div>

                    <div
                        className={`edit-profile-url-box ${
                            isProfileUrlBoxOpen ? "show" : ""}`}
                    >
                        <label htmlFor="profileImageUrl">
                            Profile Image URL
                        </label>

                        <input
                            type="url"
                            maxLength={255}
                            id="profileImageUrl"
                            name="profileImageUrl"
                            placeholder="Enter image URL and press Enter"
                            value={profileImageUrl}
                            onChange={(event) =>
                                setProfileImageUrl(event.target.value)
                            }
                            onKeyDown={ handleProfileImageKeyDown }
                            disabled={isBusy}
                        />
                    </div>
                </section>

                <form
                    id="userEditForm"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            type="email"
                            id="email"
                            value={currentUser.email}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="nickname">
                            Nickname
                        </label>

                        <input
                            type="text"
                            maxLength={50}
                            id="nickname"
                            placeholder="Enter your nickname"
                            value={nickname}
                            onChange={(event) => {
                                setNickname(event.target.value);

                                if (nicknameError) {
                                    setNicknameError("");
                                }
                            }}
                            disabled={isBusy}
                            required
                        />

                        <div
                            className={`error-message ${
                                nicknameError ? "show" : ""
                            }`}
                        >
                            {nicknameError}
                        </div>
                    </div>

                    <div className="button-group">
                        <button
                            type="submit"
                            className="save-changes-btn"
                            disabled={isBusy}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            className="delete-acc-btn"
                            onClick={
                                handleDeleteAccount
                            }
                            disabled={isBusy}
                        >
                            {isDeleting ? "Deleting..." : "Delete Account"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default UserEditForm;
