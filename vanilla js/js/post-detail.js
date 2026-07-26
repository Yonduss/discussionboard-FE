import api, { requireLogin, formatDate } from "./api.js";
import { setupProfileDropdown, setupLogout, loadProfileCircle } from "./common.js";
import { setupComments } from "./comments.js";

const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");

const editPostButton = document.getElementById("editPostButton");
const deletePostButton = document.getElementById("deletePostButton");
const likeButton = document.getElementById("likeButton");
const reportButton = document.getElementById("reportButton");

let currentUser = null;

async function initializePage() {
    if (!postId) {
        alert("Post id is missing.");
        window.location.href = "posts.html";
        return;
    }

    requireLogin();

    setupProfileDropdown();
    setupLogout();

    try {
        const currentUserResult = await api.get("/api/v1/users");
        currentUser = currentUserResult.data;

        await loadProfileCircle();

        await Promise.all([
            loadPostDetail(),
            setupComments({
                postId,
                currentUser
            })
        ]);
    } catch (error) {
        console.error("Page loading error:", error);
        alert(error.message || "Failed to load the page.");
        window.location.href = "posts.html";
    }
}

initializePage();

async function loadPostDetail() {
    const result = await api.get(`/api/v1/posts/${postId}`);
    const post = result.data;

    const isAuthor = currentUser.id === post.userId;
    const postActions = document.getElementById("postActions");
    const authorCircle = document.getElementById("authorCircle");
    const postTitle = document.getElementById("postTitle");

    postActions.hidden = !isAuthor;
    postTitle.textContent = post.title;

    document.getElementById("postContent").textContent = post.content;
    document.getElementById("authorName").textContent = post.nickname;

    if (post.edited) {
        const editedLabel = document.createElement("span");

        editedLabel.className = "edited-label";
        editedLabel.textContent = " (edited)";

        postTitle.appendChild(editedLabel);
    }

    authorCircle.replaceChildren();

    if (post.profileImageUrl) {
        authorCircle.innerHTML =
            `<img src="${post.profileImageUrl}" alt="profile">`;
    } else {
        authorCircle.textContent =
            post.nickname.charAt(0).toUpperCase();
    }

    const displayedTime = post.edited && post.updatedAt
                        ? post.updatedAt
                        : post.createdAt;

    document.getElementById("postTime").textContent = formatDate(displayedTime);
    document.getElementById("likeCount").textContent = post.likeCount;
    document.getElementById("viewCount").textContent = `Views: ${post.viewCount}`;

    renderPostImages(post.postImageUrls || []);
}

function renderPostImages(imageUrls) {
    const postImages = document.getElementById("postImages");
    postImages.innerHTML = "";

    imageUrls.forEach(url => {
        const img = document.createElement("img");

        img.src = url;
        img.alt = "Post image";
        img.className = "post-image";
        postImages.appendChild(img);
    });
}

editPostButton.addEventListener("click", function () {
    window.location.href = `post-edit.html?postId=${postId}`;
});

deletePostButton.addEventListener("click", async function () {
    if (!confirm("Are you sure you want to delete this post?")) {
        return;
    }

    try {
        await api.delete(
            `/api/v1/posts/${postId}`
        );

        alert("Post deleted successfully.");
        window.location.href = "posts.html";
    } catch (error) {
        console.error("Delete post error:", error);
        alert(error.message || "Failed to delete post.");
    }
});

likeButton.addEventListener("click", async function () {
    try {
        await api.post(
            `/api/v1/posts/${postId}/likes`
        );

        await loadPostDetail();
    } catch (error) {
        console.error("Like error:", error);
        alert(error.message || "Failed to like post.");
    }
});

reportButton.addEventListener("click", async function () {
    const reason = prompt(
        "Please enter the reason for reporting this post."
    );

    if (!reason || !reason.trim()) {
        return;
    }

    try {
        await api.post(
            `/api/v1/posts/${postId}/reports`,
            {
                reason: reason.trim()
            }
        );

        alert("Post reported successfully.");
        window.location.href = "posts.html";
    } catch (error) {
        console.error("Report post error:", error);
        alert(error.message || "Failed to report post.");
    }
});