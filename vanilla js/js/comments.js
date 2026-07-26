import api, { formatDate } from "./api.js";

const commentInput = document.getElementById("commentInput");
const addCommentButton = document.getElementById("addCommentButton");
const commentList = document.getElementById("commentList");

let postId = null;
let currentUser = null;
let commentsById = new Map();

export async function setupComments(options) {
    postId = options.postId;
    currentUser = options.currentUser;

    setupCommentEvents();

    await loadComments();
}

function setupCommentEvents() {
    addCommentButton.addEventListener("click", handleAddComment);
    commentList.addEventListener("click", handleCommentAction);
}

async function loadComments() {
    const result = await api.get(
        `/api/v1/posts/${postId}/comments`
    );

    const comments = result.data.comments || [];

    renderComments(comments, currentUser);

    const visibleCommentCount = comments.filter(
        comment => !comment.deleted
    ).length;

    document.getElementById("commentCount").textContent = `Comments: ${visibleCommentCount}`;
}

function renderComments(comments, currentUser) {
    commentList.innerHTML = "";
    commentsById = new Map();

    const parentComments = comments.filter(
        comment => comment.parentCommentId === null
    );

    parentComments.forEach(parentComment => {
        renderComment(parentComment, currentUser);

        const replies = comments.filter(
            comment => comment.parentCommentId === parentComment.id
        );

        replies.forEach(reply => {
            renderComment(reply, currentUser);
        });
    });
}

function renderComment(comment, currentUser) {
    commentsById.set(String(comment.id), comment);

    const commentItem = document.createElement("div");

    const isReply = comment.parentCommentId !== null;

    commentItem.className = isReply
        ? "comment-item reply"
        : "comment-item";

    const isAuthor = currentUser.id === comment.userId;

    const canEdit = isAuthor && !comment.deleted;

    const authorProfile = comment.profileImageUrl
        ? `<img src="${comment.profileImageUrl}" alt="profile">`
        : comment.nickname.charAt(0).toUpperCase();

    const editDeleteButtons = canEdit
        ? `
                                    <button
                                        class="edit-comment-button"
                                        data-comment-id="${comment.id}">
                                        Edit
                                    </button>
                            
                                    <button
                                        class="delete-comment-button"
                                        data-comment-id="${comment.id}">
                                        Delete
                                    </button>
                                  `
        : "";

    const replyButton = !comment.deleted
        ? `
                                <button
                                    class="reply-comment-button"
                                    data-comment-id="${comment.id}">
                                    Reply
                                </button>
                              `
        : "";

    const actions = editDeleteButtons || replyButton
        ? `
                            <div class="comment-actions">
                                ${replyButton}
                                ${editDeleteButtons}
                            </div>
                          `
        : "";

    const displayedTime = comment.edited && comment.updatedAt
        ? comment.updatedAt
        : comment.createdAt;

    const editedLabel = comment.edited
        ? `<span class="edited-label"> (edited)</span>`
        : "";

    commentItem.innerHTML = `
        <div class="comment-header">
            <div class="comment-author-circle">
                ${authorProfile}
            </div>

            <div class="comment-author-info">
                <div class="comment-author-name">
                    ${comment.nickname}
                </div>

                <div class="comment-time">
                    ${formatDate(displayedTime)}
                </div>
            </div>

            ${actions}
        </div>

        <div class="comment-body">
            <span class="comment-content">
                ${comment.content}
            </span>

            ${editedLabel}
        </div>
    `;

    commentList.appendChild(commentItem);
}

async function handleAddComment() {
    const content = commentInput.value.trim();

    if (!content) {
        alert("Please enter a comment.");
        return;
    }

    try {
        await api.post(
            `/api/v1/posts/${postId}/comments`,
            {
                content
            }
        );

        commentInput.value = "";

        await loadComments();
    } catch (error) {
        console.error("Adding comment error:", error);
        alert(error.message || "Failed to add a comment.");
    }
}

async function handleCommentAction(event) {
    const replyButton = event.target.closest(".reply-comment-button");
    const editButton = event.target.closest(".edit-comment-button");
    const deleteButton = event.target.closest(".delete-comment-button");

    const actionButton = replyButton || editButton || deleteButton;

    if (!actionButton) {
        return;
    }

    const commentId = actionButton.dataset.commentId;
    const comment = commentsById.get(String(commentId));

    if (!comment || comment.deleted) {
        alert("This comment is not available.");
        return;
    }

    if (replyButton) {
        const content = prompt(`Reply to ${comment.nickname}:`);

        if (!content || !content.trim()) {
            return;
        }

        const parentCommentId = comment.parentCommentId !== null
                            ? comment.parentCommentId
                            : comment.id;

        await createReply(content.trim(), parentCommentId);

        return;
    }

    const isAuthor = comment.userId === currentUser.id;

    if (!isAuthor) {
        alert("You are not allowed to modify this comment.");
        return;
    }

    if (editButton) {
        const commentItem = editButton.closest(".comment-item");

        const currentContent = commentItem
                                .querySelector(".comment-content")
                                .textContent
                                .trim();

        const newContent = prompt("Edit comment:", currentContent);

        if (!newContent || !newContent.trim()) {
            return;
        }

        await updateComment(
            commentId,
            newContent.trim()
        );

        return;
    }

    if (deleteButton) {
        if (!confirm("Delete this comment?")) {
            return;
        }

        await deleteComment(commentId);
    }
}

async function createReply(content, parentCommentId) {
    try {
        await api.post(
            `/api/v1/posts/${postId}/comments`,
            {
                content,
                parentCommentId
            }
        );

        await loadComments();
    } catch (error) {
        console.error("Adding reply error:", error);
        alert(error.message || "Failed to add a reply.");
    }
}

async function updateComment(commentId, content) {
    try {
        await api.patch(
            `/api/v1/posts/${postId}/comments/${commentId}`,
            {
                content
            }
        );

        await loadComments();
    } catch (error) {
        console.error("Update comment error:", error);
        alert(error.message || "Failed to update comment.");
    }
}

async function deleteComment(commentId) {
    try {
        await api.delete(
            `/api/v1/posts/${postId}/comments/${commentId}`
        );

        await loadComments();
    } catch (error) {
        console.error("Delete comment error:", error);
        alert(error.message || "Failed to delete comment.");
    }
}