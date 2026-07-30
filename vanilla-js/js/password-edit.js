import api, { requireLogin } from "./api.js";
import { setupProfileDropdown, setupLogout, loadProfileCircle } from "./common.js";

const passwordEditForm = document.getElementById("passwordEditForm");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const passwordMatchIndicator = document.getElementById("passwordMatch");

requireLogin();

setupProfileDropdown();
setupLogout();

await loadProfileCircle();

function checkPasswordMatch() {
    if (confirmPasswordInput.value === "") {
        passwordMatchIndicator.classList.remove("match", "nomatch");
        passwordMatchIndicator.textContent = "";
        return;
    }

    if (newPasswordInput.value === confirmPasswordInput.value) {
        passwordMatchIndicator.classList.remove("nomatch");
        passwordMatchIndicator.classList.add("match");
        passwordMatchIndicator.textContent = "✓ Passwords match";
    } else {
        passwordMatchIndicator.classList.remove("match");
        passwordMatchIndicator.classList.add("nomatch");
        passwordMatchIndicator.textContent = "✗ Passwords do not match";
    }
}

newPasswordInput.addEventListener("input", checkPasswordMatch);
confirmPasswordInput.addEventListener("input", checkPasswordMatch);

passwordEditForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const newPasswordConfirm = confirmPasswordInput.value;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
        alert("All fields are required to change your password.");
        return;
    }

    if (newPassword !== newPasswordConfirm) {
        alert("New passwords do not match.");
        return;
    }

    try {
        await api.patch(
            `/api/v1/users/password`,
            {
                currentPassword,
                newPassword,
                newPasswordConfirm
            }
        );

        alert("Password changed successfully.");
        window.location.href = "posts.html";
    } catch (error) {
        console.error("Password change error:", error);
        alert(error.message || "Failed to change password.");
    }
});