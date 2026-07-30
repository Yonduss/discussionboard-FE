import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../api/api.js";
import CommentForm from "../components/CommentForm.jsx";
import CommentItem from "./CommentItem.jsx";

function CommentSection({
                            postId,
                            onCommentCountChange
                        }) {
    const [comments, setComments] = useState([]);

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isMutating, setIsMutating] = useState(false);

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

            alert(error.message || "Failed to refresh comments.");
        } finally {
            setIsRefreshing(false);
        }
    }, [postId, applyComments]);

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
                    alert(error.message || "Failed to load comments.");
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
    }, [postId, applyComments]);

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
            alert(error.message || "Failed to add a comment.");

            return false;
        } finally {
            setIsMutating(false);
        }
    }

    async function handleReply(comment) {
        if (isMutating) {
            return;
        }

        const content = window.prompt(
            `Reply to ${comment.nickname}:`
        );

        if (!content?.trim()) {
            return;
        }

        const parentCommentId = comment.parentCommentId != null
                ? comment.parentCommentId
                : comment.id;

        try {
            setIsMutating(true);

            await api.post(
                `/api/v1/posts/${postId}/comments`,
                {
                    content: content.trim(),
                    parentCommentId
                }
            );

            await refreshComments();
        } catch (error) {
            console.error("Adding reply error:", error);
            alert(error.message || "Failed to add a reply.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleEdit(comment) {
        if (isMutating) {
            return;
        }

        const newContent = window.prompt("Edit comment:", comment.content);

        if (!newContent?.trim()) {
            return;
        }

        try {
            setIsMutating(true);

            await api.patch(
                `/api/v1/posts/${postId}/comments/${comment.id}`,
                {
                    content: newContent.trim()
                }
            );

            await refreshComments();
        } catch (error) {
            console.error("Update comment error:", error);
            alert(error.message || "Failed to update comment.");
        } finally {
            setIsMutating(false);
        }
    }

    async function handleDelete(comment) {
        if (isMutating) {
            return;
        }

        if (!window.confirm("Delete this comment?")) {
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
            alert(error.message || "Failed to delete comment.");
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
        </section>
    );
}

export default CommentSection;