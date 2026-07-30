import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.js";
import { Link, useNavigate} from "react-router-dom";

import api from "../api/api.js";
import "../styles/auth.css";
import mlbLogo from "../assets/MLB_logo.svg";

function LoginPage() {
    const navigate = useNavigate();
    const { loadCurrentUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            alert("Please enter a valid email and password.");
            return;
        }

        try {
            setIsSubmitting(true);

            const result = await api.post(
                "/api/v1/auth/login",
                {
                    email: trimmedEmail,
                    password: trimmedPassword
                },
                {
                    auth: false
                }
            );

            localStorage.setItem("loginUserEmail", result.data.email);
            localStorage.setItem("accessToken", result.data.accessToken);
            localStorage.setItem("refreshToken", result.data.refreshToken);

            await loadCurrentUser();

            navigate("/posts", { replace: true });

        } catch (error) {
            console.error("Login error:", error);

            if (error.status === 401) {
                alert("Email or password is incorrect.");
                return;
            }

            alert(error.message || "Login failed.");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleSignup() {
        navigate("/signup");
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
                <div className="login-container">
                    <h1>Login</h1>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email"> Email </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            required
                        />

                        <label htmlFor="password"> Password </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />

                        <button id="login-button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                        <button
                            id="signup-button"
                            type="button"
                            className="signup-button"
                            onClick={handleSignup}
                            disabled={isSubmitting}
                        >
                            Sign Up
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}

export default LoginPage;