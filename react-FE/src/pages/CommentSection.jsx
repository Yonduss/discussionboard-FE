import { useCallback, useEffect, useMemo, useState } from "react";

import api from "../api/api.js";
import CommentForm from "../components/CommentForm.jsx";
import CommentItem from "./CommentItem.jsx";

function CommentSection({postId, onCommentCountChange}) {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const applyComments = useCallback((result) => {
        const loadedComments = result.data.comments || [];

        setComments(loadedComments);

        onCommentCountChange(loadedComments.filter(
                (comment) => !comment.deleted
            ).length
        );
    }, [onCommentCountChange]);

    const loadComments = useCallback(async () => {
        try {
            setIsLoading(true);

            const result = await api.get(
                `/api/v1/posts/${postId}/comments`
            );

            applyComments(result);
        } catch (error) {
            console.error("Comments fetch error:", error);

            alert(error.message || "Failed to load comments.");
        } finally {
            setIsLoading(false);
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
                    setIsLoading(false);
                }
            }
        }

        void initializeComments();

        return () => {
            cancelled = true;
        };
    }, [postId, applyComments]);

    const {parentComments, repliesByParent} =
        useMemo(() => {
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
        try {
            setIsSubmitting(true);

            await api.post(
                `/api/v1/posts/${postId}/comments`,
                {
                    content
                }
            );

            await loadComments();

            return true;
        } catch (error) {
            console.error("Adding comment error:", error);
            alert(error.message || "Failed to add a comment.");

            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleReply(comment) {
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
            await api.post(
                `/api/v1/posts/${postId}/comments`,
                {
                    content: content.trim(),
                    parentCommentId
                }
            );

            await loadComments();
        } catch (error) {
            console.error("Adding reply error:", error);
            alert(error.message || "Failed to add a reply.");
        }
    }

    async function handleEdit(comment) {
        const newContent = window.prompt(
            "Edit comment:", comment.content);

        if (!newContent?.trim()) {
            return;
        }

        try {
            await api.patch(
                `/api/v1/posts/${postId}/comments/${comment.id}`,
                {
                    content: newContent.trim()
                }
            );

            await loadComments();

        } catch (error) {
            console.error("Update comment error:", error);
            alert(error.message || "Failed to update comment.");
        }
    }

    async function handleDelete(comment) {
        if (!window.confirm("Delete this comment?")) {
            return;
        }

        try {
            await api.delete(
                `/api/v1/posts/${postId}/comments/${comment.id}`
            );

            await loadComments();

        } catch (error) {
            console.error("Delete comment error:", error);
            alert(error.message || "Failed to delete comment.");
        }
    }

    return (
        <section className="comment-section">
            <CommentForm
                onSubmit={handleCreateComment}
                isSubmitting={isSubmitting}
            />

            <div className="comment-list">
                {isLoading && (
                    <div className="comments-notice">
                        Loading comments...
                    </div>
                )}

                {!isLoading &&
                    parentComments.length === 0 && (
                        <div className="comments-notice">
                            No comments yet.
                        </div>
                    )}

                {!isLoading &&
                    parentComments.map((parentComment) => (
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
                                />
                            ))}
                        </div>
                    ))}
            </div>
        </section>
    );
}

export default CommentSection;