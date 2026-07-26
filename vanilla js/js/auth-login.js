import api from "./api.js";

const loginForm = document.getElementById("login-form");
const signupButton = document.getElementById("signup-button");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter a valid email and password.");
        return;
    }

    try {
        const result = await api.post(
            "/api/v1/auth/login",
            {
                email,
                password
            },
            {
                auth: false
            }
        );

        localStorage.setItem("loginUserEmail", result.data.email);
        localStorage.setItem("accessToken", result.data.accessToken);

        window.location.href = "posts.html";

    } catch (error) {
        console.error("Login error:", error);

        if (error.status === 401) {
            alert("Email or password is incorrect.");
            return;
        }

        alert(error.message || "Login failed.");
    }
});

signupButton.addEventListener("click", function () {
    window.location.href = "signup.html";
});