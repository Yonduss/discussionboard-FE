import api, { requireLogin } from "./api.js";
import { setupProfileDropdown, setupLogout, loadProfileCircle } from "./common.js";

const profileImageContainer = document.getElementById("profileImageContainer");
const profileUrlBox = document.getElementById("profileUrlBox");
const profileImageUrlInput = document.getElementById("profileImageUrl");
const editProfileCircle = document.getElementById("editProfileCircle");

const emailInput = document.getElementById("email");
const nicknameInput = document.getElementById("nickname");
const userEditForm = document.getElementById("userEditForm");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

requireLogin();

setupProfileDropdown();
setupLogout();

await loadProfileCircle();

profileImageContainer.addEventListener("click", function () {
    profileUrlBox.classList.toggle("show");
    profileImageUrlInput.focus();
});

profileImageUrlInput.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();
    renderProfileImage(profileImageUrlInput.value.trim());
    profileUrlBox.classList.remove("show");
});

loadUser();

async function loadUser() {
    try {
        const result = await api.get(
            `/api/v1/users`
        );

        const user = result.data;

        emailInput.value = user.email;
        nicknameInput.value = user.nickname;
        profileImageUrlInput.value = user.profileImageUrl || "";

        renderProfileImage(user.profileImageUrl);

    } catch (error) {
        console.error(error);
        alert(error.message || "Failed to load user.");
    }
}

function renderProfileImage(imageUrl) {
    if (!imageUrl) {
        editProfileCircle.classList.add("empty");
        editProfileCircle.innerHTML = "";
        return;
    }

    editProfileCircle.classList.remove("empty");
    editProfileCircle.innerHTML = `<img src="${imageUrl}" alt="Profile">`;
}

userEditForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nickname = nicknameInput.value.trim();
    const profileImageUrl = profileImageUrlInput.value.trim();

    if (!nickname) {
        alert("Nickname is required.");
        return;
    }

    try {
        const result = await api.patch(
            `/api/v1/users`,
            {
                nickname,
                profileImageUrl: profileImageUrl || null
            }
        );

        localStorage.setItem("loginUserNickname", result.data.nickname);
        localStorage.setItem("loginUserProfileImageUrl", result.data.profileImageUrl || "");

        alert("Profile updated successfully.");
        window.location.href = "posts.html";
    } catch (error) {
        console.error(error);
        alert(error.message || "Failed to update Profile.");
    }
});

deleteAccountBtn.addEventListener("click", async function () {
        if (!confirm("Are you sure you want to delete your account?")) {
            return;
        }

        try {
            await api.delete(
                `/api/v1/users`
            );

            localStorage.clear();
            alert("Account deleted successfully.");
            window.location.href = "login.html";
        } catch (error) {
            console.error(error);
            alert(error.message || "Failed to delete account.");
        }
    }
);