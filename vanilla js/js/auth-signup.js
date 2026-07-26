import api from "./api.js";

const profileImageContainer = document.getElementById("profileImageContainer");
const profileUrlBox = document.getElementById("profileUrlBox");
const profileImageUrlInput = document.getElementById("profileImageUrl");
const profileCircle = document.getElementById("profileCircle");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const passwordMatchIndicator = document.getElementById("passwordMatch");

const signupForm = document.getElementById("signupForm");
const signupButton = signupForm.querySelector('button[type="submit"]');
const loginBtn = document.getElementById("loginBtn");

profileImageContainer.addEventListener("click", function () {
    profileUrlBox.classList.toggle("show");
    profileImageUrlInput.focus();
});

profileImageUrlInput.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();

    const imageUrl = profileImageUrlInput.value.trim();

    if (!imageUrl) {
        profileCircle.classList.add("empty");
        profileCircle.innerHTML = "";
        return;
    }

    profileCircle.classList.remove("empty");
    profileCircle.innerHTML = `<img src="${imageUrl}" alt="Profile">`;
    profileUrlBox.classList.remove("show");
});

function checkPasswordMatch() {
    if (confirmPasswordInput.value === "") {
        passwordMatchIndicator.classList.remove("match", "nomatch");
        passwordMatchIndicator.textContent = "";
        return;
    }

    if (passwordInput.value === confirmPasswordInput.value) {
        passwordMatchIndicator.classList.remove("nomatch");
        passwordMatchIndicator.classList.add("match");
        passwordMatchIndicator.textContent = "✓ Passwords match";
    } else {
        passwordMatchIndicator.classList.remove("match");
        passwordMatchIndicator.classList.add("nomatch");
        passwordMatchIndicator.textContent = "✗ Passwords do not match";
    }
}

passwordInput.addEventListener("input", checkPasswordMatch);
confirmPasswordInput.addEventListener("input", checkPasswordMatch);

signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const passwordConfirm = document.getElementById("confirmPassword").value.trim();
    const nickname = document.getElementById("nickname").value.trim();
    const profileImageUrl = profileImageUrlInput.value.trim();

    let isValid = true;

    if (!email) {
        document.getElementById("emailError").textContent = "Email is required";
        document.getElementById("emailError").classList.add("show");
        isValid = false;
    } else {
        document.getElementById("emailError").classList.remove("show");
    }

    if (!password) {
        document.getElementById("passwordError").textContent = "Password is required";
        document.getElementById("passwordError").classList.add("show");
        isValid = false;
    } else {
        document.getElementById("passwordError").classList.remove("show");
    }

    if (password !== passwordConfirm) {
        isValid = false;
    }

    if (!nickname) {
        document.getElementById("nicknameError").textContent = "Nickname is required";
        document.getElementById("nicknameError").classList.add("show");
        isValid = false;
    } else {
        document.getElementById("nicknameError").classList.remove("show");
    }

    if (!isValid) {
        return;
    }

    try {
        signupButton.disabled = true;
        signupButton.textContent = "Signing up...";

        await api.post(
            "/api/v1/users/signup",
            {
                email,
                password,
                passwordConfirm,
                nickname,
                profileImageUrl: profileImageUrl || null
            },
            {
                auth: false
            }
        );

        alert("Sign up successful!");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Sign up error:", error);
        alert(error.message || "Server connection failed.");
    } finally {
        signupButton.disabled = false;
        signupButton.textContent = "Sign Up";
    }
});

loginBtn.addEventListener("click", function () {
    window.location.href = "login.html";
});