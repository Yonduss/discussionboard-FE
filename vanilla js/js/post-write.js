import api, { requireLogin } from "./api.js";
import { setupProfileDropdown, setupLogout, loadProfileCircle } from "./common.js";

requireLogin();

setupProfileDropdown();
setupLogout();

await loadProfileCircle();

document.getElementById("addImageButton").addEventListener("click", function () {
    const imageInputs = document.getElementById("imageInputs");

    const row = document.createElement("div");
    row.className = "image-input-row";

    const input = document.createElement("input");
    input.type = "url";
    input.name = "images[]";
    input.placeholder = "Enter Image URL";

    row.appendChild(input);
    imageInputs.appendChild(row);
});

document.getElementById("postForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("postTitle").value.trim();
    const content = document.getElementById("postContent").value.trim();

    const postImageUrls = Array.from(document.querySelectorAll('input[name="images[]"]'))
        .map(input => input.value.trim())
        .filter(url => url.length > 0);

    if (!title || !content) {
        alert("Title and content are required.");
        return;
    }

    try {
        const result = await api.post(
            `/api/v1/posts`,
            {
                title,
                content,
                postImageUrls
            }
        );

        alert("Post created successfully.");
        window.location.href = `post-detail.html?postId=${result.data.id}`;
    } catch (error) {
        console.error(error);
        alert(error.message || "Failed to create post.");
    }
});