import api, { requireLogin } from "./api.js";
import { setupProfileDropdown, setupLogout, loadProfileCircle } from "./common.js";

const params = new URLSearchParams(window.location.search);
const postId = params.get("postId");

const postTitleInput = document.getElementById("postTitle");
const postContentInput = document.getElementById("postContent");
const imageInputs = document.getElementById("imageInputs");
const addImageButton = document.getElementById("addImageButton");
const postForm = document.getElementById("postForm");

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
        await loadProfileCircle();

        const [postResult, userResult] = await Promise.all([
            api.get(`/api/v1/posts/${postId}`),
            api.get("/api/v1/users")
        ]);

        const post = postResult.data;
        const currentUser = userResult.data;

        if (String(post.userId) !== String(currentUser.id)) {
            alert("You are not allowed to edit this post.");
            window.location.href = `post-detail.html?postId=${postId}`;
            return;
        }

        renderPost(post);
    } catch (error) {
        console.error("Initialize post edit page error:", error);
        alert(error.message || "Failed to load post.");

        window.location.href = `post-detail.html?postId=${postId}`;
    }
}

initializePage();

function renderPost(post) {
    postTitleInput.value = post.title;
    postContentInput.value = post.content;

    renderImageInputs(post.postImageUrls || []);
}

function renderImageInputs(imageUrls) {
    imageInputs.innerHTML = "";

    if (imageUrls.length === 0) {
        addImageInput("");
        return;
    }

    imageUrls.forEach(url => {
        addImageInput(url);
    });
}

function addImageInput(value) {
    const row = document.createElement("div");
    row.className = "image-input-row";

    const input = document.createElement("input");
    input.type = "url";
    input.name = "images[]";
    input.placeholder = "Image URL";
    input.value = value;

    row.appendChild(input);
    imageInputs.appendChild(row);
}

addImageButton.addEventListener("click", function () {
    addImageInput("");
});

postForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = postTitleInput.value.trim();
    const content = postContentInput.value.trim();
    const postImageUrls = Array.from(document.querySelectorAll('input[name="images[]"]'))
        .map(input => input.value.trim())
        .filter(url => url.length > 0);

    if (!title) {
        alert("Title is required.");
        return;
    }

    if (!content) {
        alert("Content is required.");
        return;
    }

    try {
        await api.patch(
            `/api/v1/posts/${postId}`,
            {
                title,
                content,
                postImageUrls
            }
        );

        alert("Post updated successfully.");
        window.location.href = `post-detail.html?postId=${postId}`;
    } catch (error) {
        console.error(error);
        alert(error.message || "Failed to update post.");
    }
});