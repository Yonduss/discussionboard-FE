import api, { requireLogin, formatDate } from "./api.js";
import { setupProfileDropdown, setupLogout, loadProfileCircle } from "./common.js";

requireLogin();

setupProfileDropdown();
setupLogout();

await loadProfileCircle();

const createPostButton = document.getElementById("createPostButton");

createPostButton.addEventListener("click", function () {
    window.location.href = "post-write.html";
});

let currentPage = 0;
const pageSize = 10;
let hasNext = true;
let isLoading = false;

const postsList = document.getElementById("postsList");

postsList.innerHTML = "";

loadPosts();

async function loadPosts() {
    if (!hasNext || isLoading) {
        return;
    }

    isLoading = true;

    try {
        const result = await api.get(
            `/api/v1/posts?page=${currentPage}&size=${pageSize}`
        );

        const pageData = result.data;
        renderPosts(pageData.posts);

        hasNext = pageData.hasNext;
        currentPage += 1;

    } catch (error) {
        console.error("Posts fetch error:", error);
        alert(error.message || "Failed to load posts.");
    } finally {
        isLoading = false;
    }
}

function renderPosts(posts) {
    posts.forEach(post => {
        const postItem = document.createElement("div");
        const editedLabel = post.edited
            ? `<span class="edited-label"> (edited)</span>`
            : "";

        postItem.className = "post-item";

        postItem.innerHTML = `
            <div class="post-header">
                <div class="post-title" data-post-id="${post.id}">
                    ${post.title}${editedLabel}
                </div>
            </div>

            <div class="post-author">
                <div class="author-circle">
                    ${post.profileImageUrl
                        ? `<img src="${post.profileImageUrl}" alt="profile">`
                        : post.nickname.charAt(0).toUpperCase()}
                </div>
                <div class="author-info">
                    ${post.nickname} • ${formatDate(post.createdAt)}
                </div>
            </div>

            <div class="post-stats">
                <div class="stat">👍 <span>${post.likeCount}</span></div>
                <div class="stat">👁️ <span>${post.viewCount}</span></div>
                <div class="stat">💬 <span>${post.commentCount}</span></div>
            </div>
        `;

        postsList.appendChild(postItem);
    });
}

postsList.addEventListener("click", function (event) {
    const postTitle = event.target.closest(".post-title");

    if (!postTitle) {
        return;
    }

    const postId = postTitle.dataset.postId;

    window.location.href = `post-detail.html?postId=${postId}`;
});

window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadPosts();
    }
});