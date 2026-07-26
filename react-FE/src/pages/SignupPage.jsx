import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/api.js";
import mlbLogo from "../assets/MLB_logo.svg";
import "../styles/auth.css";

function SignupPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [nickname, setNickname] = useState("");

    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [profilePreviewUrl, setProfilePreviewUrl] = useState("");
    const [isProfileUrlBoxOpen, setIsProfileUrlBoxOpen] = useState(false);

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        nickname: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordsMatch = passwordConfirm !== "" && password === passwordConfirm;

    const passwordsDoNotMatch = passwordConfirm !== "" && password !== passwordConfirm;

    function handleProfileCircleClick() {
        setIsProfileUrlBoxOpen((previous) => !previous);
    }

    function handleProfileImageKeyDown(event) {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        const trimmedImageUrl = profileImageUrl.trim();

        if (!trimmedImageUrl) {
            setProfilePreviewUrl("");
            return;
        }

        setProfilePreviewUrl(trimmedImageUrl);
        setIsProfileUrlBoxOpen(false);
    }

    function validateForm() {
        const nextErrors = {
            email: "",
            password: "",
            nickname: ""
        };

        let isValid = true;

        if (!email.trim()) {
            nextErrors.email = "Email is required";
            isValid = false;
        }

        if (!password) {
            nextErrors.password = "Password is required";
            isValid = false;
        }

        if (password !== passwordConfirm) {
            nextErrors.password = "Passwords do not match";
            isValid = false;
        }

        if (!nickname.trim()) {
            nextErrors.nickname = "Nickname is required";
            isValid = false;
        }

        setErrors(nextErrors);

        return isValid;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            await api.post(
                "/api/v1/users/signup",
                {
                    email: email.trim(),
                    password,
                    passwordConfirm,
                    nickname: nickname.trim(),
                    profileImageUrl: profileImageUrl.trim() || null
                },
                {
                    auth: false
                }
            );

            alert("Sign up successful!");
            navigate("/login", {
                replace: true
            });

        } catch (error) {
            console.error("Sign up error:", error);
            alert(error.message || "Server connection failed.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <header className="top-banner">
                <Link
                    to="/login"
                    className="logo-link"
                    aria-label="Go to login page"
                >
                    <img
                        src={mlbLogo}
                        alt="MLB logo"
                        className="logo-img"
                    />
                </Link>

                <h2>2026 MLB BOARD</h2>
            </header>

            <main className="auth-page">
                <div className="signup-container">
                    <h1>Sign Up</h1>

                    <section className="main-profile-section">
                        <div
                            className="main-profile-image-container"
                            onClick={handleProfileCircleClick}
                            role="button"
                            tabIndex={0}
                        >
                            <div
                                className={`main-profile-circle ${
                                    profilePreviewUrl ? "" : "empty"
                                }`}
                            >
                                {profilePreviewUrl && (
                                    <img
                                        src={profilePreviewUrl}
                                        alt="Profile preview"
                                        onError={() => setProfilePreviewUrl("")}
                                    />
                                )}
                            </div>
                        </div>

                        <div
                            className={`main-profile-url-box ${
                                isProfileUrlBoxOpen ? "show" : ""
                            }`}
                        >
                            <label htmlFor="profileImageUrl">Profile Image URL</label>
                            <input
                                type="url"
                                id="profileImageUrl"
                                name="profileImageUrl"
                                placeholder="Enter image URL and press Enter"
                                value={profileImageUrl}
                                onChange={(event) =>
                                    setProfileImageUrl(event.target.value)
                                }
                                onKeyDown={handleProfileImageKeyDown}
                            />
                        </div>
                    </section>

                    <form id="signupForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />

                            <div
                                className={`error-message ${
                                    errors.email ? "show" : ""
                                }`}
                            >
                                {errors.email}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />

                            <div
                                className={`error-message ${
                                    errors.password ? "show" : ""
                                }`}
                            >
                                {errors.password}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                autoComplete="new-password"
                                placeholder="Enter your password again"
                                value={passwordConfirm}
                                onChange={(event) =>
                                    setPasswordConfirm(event.target.value)
                                }
                                required
                            />

                            <div
                                className={`password-match-indicator ${
                                    passwordsMatch
                                        ? "match"
                                        : passwordsDoNotMatch ? "nomatch" : ""
                                }`}
                            >
                                {passwordsMatch && "✓ Passwords match"}
                                {passwordsDoNotMatch && "✗ Passwords do not match"}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="nickname">Nickname</label>
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                autoComplete="nickname"
                                placeholder="Enter your nickname"
                                value={nickname}
                                onChange={(event) =>
                                    setNickname(event.target.value)
                                }
                                required
                            />

                            <div
                                className={`error-message ${
                                    errors.nickname ? "show" : ""
                                }`}
                            >
                                {errors.nickname}
                            </div>
                        </div>

                        <div className="button-group">
                            <button
                                type="submit"
                                className="signup-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Signing up..." : "Sign Up"}
                            </button>

                            <button
                                type="button"
                                className="login-btn"
                                onClick={() => navigate("/login")}
                                disabled={isSubmitting}
                            >
                                Go to Login
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

export default SignupPage;