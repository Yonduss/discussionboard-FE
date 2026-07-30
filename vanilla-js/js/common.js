import api from "./api.js";

export async function loadProfileCircle() {
    try {
        const result = await api.get("/api/v1/users");
        const user = result.data;
        const profileCircle = document.getElementById("profileCircle");

        if (user.profileImageUrl) {
            profileCircle.innerHTML =
                `<img src="${user.profileImageUrl}" alt="profile">`;
        } else {
            profileCircle.textContent =
                user.nickname.charAt(0).toUpperCase();
        }
    } catch (error) {
        console.error("Failed to load profile image:", error);
    }
}

export function setupProfileDropdown() {
    const profileCircle = document.getElementById("profileCircle");
    const profileDropdown = document.getElementById("profileDropdown");

    profileCircle.addEventListener("click", function () {
        profileDropdown.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".profile-container")) {
            profileDropdown.classList.remove("active");
        }
    });
}

export function setupLogout() {
    const logoutButton = document.getElementById("logoutButton");

    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.clear();
        window.location.href = "login.html";
    });
}