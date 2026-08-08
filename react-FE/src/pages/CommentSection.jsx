import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../api/api.js";
import CommentForm from "../components/CommentForm.jsx";
import TextInputModal from "../components/TextInputModal.jsx";
import { useModal } from "../contexts/ModalContext.js";
import CommentItem from "./CommentItem.jsx";

function CommentSection({
                            postId,
                            onCommentCountChange
                        }) {
    const { showMessage, showConfirm } = useModal();
    const [comments, setComments] = useState([]);

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isMutating, setIsMutating] = useState(false);

    const [commentModal, setCommentModal] = useState(null);

    const applyComments = useCallback(
        (result) => {
            const loadedComments = result.data.comments || [];

            setComments(loadedComments);

            onCommentCountChange(
                loadedComments.filter(
                    (comment) => !comment.deleted
                ).length
            );
        },
        [onCommentCountChange]
    );

    const refreshComments = useCallback(async () => {
        try {
            setIsRefreshing(true);

            const result = await api.get(
                `/api/v1/posts/${postId}/comments`
            );

            applyComments(result);
        } catch (error) {
            console.error("Comments refresh error:", error);

            await showMessage(
                error.message || "Failed to refresh comments.",
                { variant: "error" }
            );
        } finally {
            setIsRefreshing(false);
        }
    }, [postId, applyComments, showMessage]);

    useEffect(() => {
        let cancelled = false;

        async function initializeComments() {
            try {
                const result = await api.get(
                    `/api/v1/posts/${postId}/comments`
                );

                if (!cancelled) {
                    applyComments(result);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Comments fetch error:", error);
                    await showMessage(
                        error.message || "Failed to load comments.",
                        { variant: "error" }
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsInitialLoading(false);
                }
            }
        }

        void initializeComments();

        return () => {
            cancelled = true;
        };
    }, [postId, applyComments, showMessage]);

    const {parentComments, repliesByParent}
        = useMemo(() => {
        const parents = [];
        const repliesMap = {};

        comments.forEach((comment) => {
            if (comment.parentCommentId == null) {
                parents.push(comment);
                return;
            }

            const parentId = String(comment.parentCommentId);

            if (!repliesMap[parentId]) {
                repliesMap[parentId] = [];
            }

            repliesMap[parentId].push(comment);
        });

        return {
            parentComments: parents,
            repliesByParent: repliesMap
        };
    }, [comments]);

    async function handleCreateComment(content) {
        if (isMutating) {
            return false;
        }

        try {
            setIsMutating(true);

            await api.post(
                `/api/v1/posts/${postId}/comments`,
                {
                    content
                }
            );

            await refreshComments();

            return true;
        } catch (error) {
            console.error("Adding comment error:", error);
            await showMessage(
                error.message || "Failed to add a comment.",
                { variant: "error" }
            );

            return false;
        } finally {
            setIsMutating(false);
        }
    }

    function handleReply(comment) {
        if (isMutating) {
            return;
        }

        setCommentModal({
            type: "reply",
            comment
        });
    }

    function handleEdit(comment) {
        if (isMutating) {
            return;
        }

        setCommentModal({
            type: "edit",
            comment
        });
    }

    function handleCloseCommentModal() {
        if (!isMutating) {
            setCommentModal(null);
        }
    }

    async function handleConfirmCommentModal(content) {
        if (isMutating || !commentModal) {
            return;
        }

        const { type, comment } = commentModal;

        try {
            setIsMutating(true);

            if (type === "reply") {
                const parentCommentId = comment.parentCommentId != null
                    ? comment.parentCommentId
                    : comment.id;

                await api.post(
                    `/api/v1/posts/${postId}/comments`,
                    {
                        content,
                        parentCommentId
                    }
                );
            } else {
                await api.patch(
                    `/api/v1/posts/${postId}/comments/${comment.id}`,
                    {
                        content
                    }
                );
            }

            await refreshComments();
            setCommentModal(null);
        } catch (error) {
            const isReply = type === "reply";

            console.error(
                isReply ? "Adding reply error:" : "Update comment error:",
                error
            );
            await showMessage(
                error.message || (
                    isReply
                        ? "Failed to add a reply."
                        : "Failed to update comment."
                ),
                { variant: "error" }
            );
        } finally {
            setIsMutating(false);
        }
    }

    async function handleDelete(comment) {
        if (isMutating) {
            return;
        }

        const confirmed = await showConfirm(
            "Are you sure you want to delete this comment?",
            {
                title: "Delete comment",
                confirmText: "Delete",
                confirmVariant: "danger"
            }
        );

        if (!confirmed) {
            return;
        }

        try {
            setIsMutating(true);

            await api.delete(
                `/api/v1/posts/${postId}/comments/${comment.id}`
            );

            await refreshComments();
        } catch (error) {
            console.error("Delete comment error:", error);
            await showMessage(
                error.message || "Failed to delete comment.",
                { variant: "error" }
            );
        } finally {
            setIsMutating(false);
        }
    }

    const isCommentActionDisabled = isMutating || isRefreshing;

    return (
        <section className="comment-section">
            <CommentForm
                onSubmit={handleCreateComment}
                isSubmitting={isCommentActionDisabled}
            />

            <div className="comment-list">
                {isInitialLoading && (
                    <div className="comments-notice">
                        Loading comments...
                    </div>
                )}

                {!isInitialLoading && parentComments.length === 0 && (
                        <div className="comments-notice">
                            No comments yet.
                        </div>
                    )}

                {!isInitialLoading && parentComments.map(
                        (parentComment) => (
                            <div
                                className="comment-thread"
                                key={parentComment.id}
                            >
                                <CommentItem
                                    comment={parentComment}
                                    isReply={false}
                                    onReply={handleReply}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    disabled={
                                        isCommentActionDisabled
                                    }
                                />

                                {(repliesByParent[
                                        String(parentComment.id)
                                        ] || []
                                ).map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        isReply
                                        onReply={handleReply}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        disabled={isCommentActionDisabled}
                                    />
                                ))}
                            </div>
                        )
                    )}

                {!isInitialLoading && isRefreshing && (
                        <div
                            className="comments-refreshing"
                            aria-live="polite"
                        >
                            Updating comments...
                        </div>
                    )}
            </div>

            <TextInputModal
                isOpen={commentModal != null}
                title={
                    commentModal?.type === "reply"
                        ? "Reply to comment"
                        : "Edit comment"
                }
                description={
                    commentModal?.type === "reply"
                        ? `Reply to ${commentModal.comment.nickname}.`
                        : "Edit your comment."
                }
                initialValue={
                    commentModal?.type === "edit"
                        ? commentModal.comment.content
                        : ""
                }
                placeholder="Enter comment"
                confirmText={
                    commentModal?.type === "reply" ? "Reply" : "Save"
                }
                maxLength={255}
                isSubmitting={isMutating}
                emptyMessage="Comment is required."
                onConfirm={handleConfirmCommentModal}
                onCancel={handleCloseCommentModal}
            />
        </section>
    );
}

export default CommentSection;
