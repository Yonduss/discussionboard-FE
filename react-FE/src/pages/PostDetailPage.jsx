import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api.js";
import { formatPostDateTime } from "../utils/dateTime.js";
import { useAuth } from "../contexts/AuthContext.js";
import { useModal } from "../contexts/ModalContext.js";
import emptyProfileImage from "../images/empty-profile-image.png";
import Header from "../components/Header.jsx";
import TextInputModal from "../components/TextInputModal.jsx";
import CommentSection from "../pages/CommentSection.jsx";

import "../styles/post-detail.css";

function PostDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const { currentUser } = useAuth();
    const { showMessage, showConfirm } = useModal();
    const [post, setPost] = useState(null);
    const [commentCount,setCommentCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);

    useEffect(() => {
        async function initializePage() {
            if (!postId) {
                await showMessage("Post id is missing.", {
                    variant: "error"
                });
                navigate("/posts", {
                    replace: true
                });
                return;
            }

            try {
                const postResult = await api.get(
                    `/api/v1/posts/${postId}`
                );
                setPost(postResult.data);
                setCommentCount(postResult.data.commentCount);
            } catch(error) {
                console.error(error);
                await showMessage(error.message || "Failed to load post.", {
                    variant: "error"
                });
                navigate("/posts", {
                    replace:true
                });
            } finally {
                setIsLoading(false);
            }
        }

        initializePage();

    }, [postId, navigate, showMessage]);

    function handleEditPost() {
        navigate(`/posts/${postId}/edit`);
    }

    async function handleDeletePost() {
        const confirmed = await showConfirm(
            "Are you sure you want to delete this post? This cannot be undone.",
            {
                title: "Delete post",
                confirmText: "Delete",
                confirmVariant: "danger"
            }
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/api/v1/posts/${postId}`);

            await showMessage("Post deleted successfully.", {
                variant: "success"
            });
            navigate("/posts", { replace: true });
        } catch (error) {
            console.error("Delete post error:", error);
            await showMessage(error.message || "Failed to delete post.", {
                variant: "error"
            });
        }
    }

    async function handleLikePost() {
        if (isLikeSubmitting) {
            return;
        }

        try {
            setIsLikeSubmitting(true);

            const result = await api.post(
                `/api/v1/posts/${postId}/likes`
            );

            setPost((previous) => ({
                ...previous,
                likeCount: result.data.likeCount,
                liked: result.data.liked
            }));

        } catch(error) {
            console.error("Like error:", error);
            await showMessage(error.message || "Failed to like post.", {
                variant: "error"
            });
        } finally {
            setIsLikeSubmitting(false);
        }
    }

    async function handleUnlikePost() {
        if (isLikeSubmitting) {
            return;
        }

        try {
            setIsLikeSubmitting(true);

            const result = await api.delete(
                `/api/v1/posts/${postId}/likes`
            );

            setPost((previous) => ({
                ...previous,
                likeCount: result.data.likeCount,
                liked: result.data.liked
            }));

        } catch(error) {
            console.error("Unlike error:", error);
            await showMessage(error.message || "Failed to unlike post.", {
                variant: "error"
            });
        } finally {
            setIsLikeSubmitting(false);
        }
    }

    function handleOpenReportModal() {
        setIsReportModalOpen(true);
    }

    function handleCloseReportModal() {
        if (!isReporting) {
            setIsReportModalOpen(false);
        }
    }

    async function handleReportPost(reason) {
        if (isReporting) {
            return;
        }

        try {
            setIsReporting(true);

            await api.post(
                `/api/v1/posts/${postId}/reports`,
                {
                    reason
                }
            );

            setIsReportModalOpen(false);
            await showMessage("Post reported successfully.", {
                variant: "success"
            });
            navigate("/posts", { replace: true });
        } catch (error) {
            console.error("Report post error:", error);
            await showMessage(error.message || "Failed to report post.", {
                variant: "error"
            });
        } finally {
            setIsReporting(false);
        }
    }

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="post-detail">
                    Loading post...
                </main>
            </>
        );
    }

    if (!post) {
        return null;
    }

    const isAuthor = Number(currentUser.id) === Number(post.userId);

    const displayedTime = post.edited && post.updatedAt
            ? post.updatedAt
            : post.createdAt;

    return (
        <>
            <Header />

            <main className="post-detail">
                <section className="post-detail-header">
                    <div className="post-title-row">
                        <h1>
                            {post.title}

                            {post.edited && (
                                <span className="edited-label">
                                    {" "}
                                    (edited)
                                </span>
                            )}
                        </h1>

                        <div className="author-info">
                            <div className="author-circle">
                                <img
                                    src={post.profileImageUrl || emptyProfileImage}
                                    alt={`${post.nickname} profile`}
                                />
                            </div>

                            <div className="author-details">
                                <div className="author-name">
                                    {post.nickname}
                                </div>

                                <div className="post-time">
                                    {formatPostDateTime(displayedTime)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {isAuthor && (
                    <section className="post-meta">
                        <div className="post-actions">
                            <button
                                type="button"
                                onClick={handleEditPost}
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                className="delete-comment-button"
                                onClick={handleDeletePost}
                            >
                                Delete
                            </button>
                        </div>
                    </section>
                )}

                <section className="post-content">
                    <p id="postContent">
                        {post.content}
                    </p>

                    <div className="post-images">
                        {(post.postImageUrls || []).map(
                            (imageUrl, index) => (
                                <img
                                    key={`${imageUrl}-${index}`}
                                    src={imageUrl}
                                    alt={`Post image ${index + 1}`}
                                    className="post-image"
                                />
                            )
                        )}
                    </div>
                </section>

                <section className="post-stats">
                    <button
                        type="button"
                        className="like-button"
                        onClick={post.liked ? handleUnlikePost : handleLikePost}
                        disabled={isLikeSubmitting}
                        aria-busy={isLikeSubmitting}
                    >
                        {post.liked ? "❤️" : "👍"}
                        <span>{post.likeCount}</span>
                    </button>

                    <span className="view-count">
                        Views: {post.viewCount}
                    </span>

                    <span className="comment-count">
                        Comments: {commentCount}
                    </span>

                    <button
                        type="button"
                        className="report-button"
                        onClick={handleOpenReportModal}
                        disabled={isReporting}
                        aria-label="Report post"
                    >
                        🚨
                    </button>
                </section>

                <CommentSection
                    postId={postId}
                    onCommentCountChange={setCommentCount}
                />
            </main>

            <TextInputModal
                isOpen={isReportModalOpen}
                title="Report post"
                description="Please enter the reason for reporting this post."
                placeholder="Enter report reason"
                confirmText="Report"
                confirmVariant="danger"
                maxLength={255}
                isSubmitting={isReporting}
                emptyMessage="Report reason is required."
                onConfirm={handleReportPost}
                onCancel={handleCloseReportModal}
            />
        </>
    );
}

export default PostDetailPage;
