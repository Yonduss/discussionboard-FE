import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api, { formatDate, requireLogin } from "../api/api.js";
import { useAuth } from "../contexts/AuthContext.js";

import Header from "../components/Header.jsx";
import CommentSection from "../pages/CommentSection.jsx";

import "../styles/post-detail.css";

function PostDetailPage() {
    const { postId } = useParams();
    const navigate = useNavigate();

    const { currentUser, loading: authLoading } = useAuth();
    const [post, setPost] = useState(null);
    const [commentCount,setCommentCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        requireLogin();

        if (authLoading) {
            return;
        }

        if (!currentUser) {
            navigate("/login", {
                replace: true
            });
            return;
        }


        async function initializePage() {
            if (!postId) {
                alert("Post id is missing.");
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
                alert(error.message || "Failed to load post.");
                navigate("/posts", {
                    replace:true
                });
            } finally {
                setIsLoading(false);
            }
        }

        initializePage();

    }, [
        postId,
        navigate,
        currentUser,
        authLoading
    ]);

    async function reloadPost() {
        const result = await api.get(
            `/api/v1/posts/${postId}`
        );

        setPost(result.data);
    }

    function handleEditPost() {
        navigate(`/posts/${postId}/edit`);
    }

    async function handleDeletePost() {
        if (!window.confirm("Are you sure you want to delete this post?")) {
            return;
        }

        try {
            await api.delete(`/api/v1/posts/${postId}`);

            alert("Post deleted successfully.");
            navigate("/posts", { replace: true });
        } catch (error) {
            console.error("Delete post error:", error);
            alert(error.message || "Failed to delete post.");
        }
    }

    async function handleLikePost() {
        try {
            await api.post(`/api/v1/posts/${postId}/likes`);
            await reloadPost();
        } catch (error) {
            console.error("Like error:", error);
            alert(error.message || "Failed to like post.");
        }
    }

    async function handleUnlikePost() {
        try {
            await api.delete(`/api/v1/posts/${postId}/likes`);
            await reloadPost();
        } catch (error) {
            console.error("Unlike error:", error);
            alert(error.message || "Failed to unlike post.");
        }
    }

    async function handleReportPost() {
        const reason = window.prompt(
            "Please enter the reason for reporting this post."
        );

        if (!reason?.trim()) {
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
            navigate("/posts", { replace: true });
        } catch (error) {
            console.error("Report post error:", error);
            alert(error.message || "Failed to report post.");
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

    if (isLoading || authLoading) {
        return (
            <>
                <Header />
                <main className="post-detail">
                    Loading post...
                </main>
            </>
        );
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
                                {post.profileImageUrl ? (
                                    <img
                                        src={post.profileImageUrl}
                                        alt={`${post.nickname} profile`}
                                    />
                                ) : (
                                    post.nickname
                                        ?.charAt(0)
                                        .toUpperCase()
                                )}
                            </div>

                            <div className="author-details">
                                <div className="author-name">
                                    {post.nickname}
                                </div>

                                <div className="post-time">
                                    {formatDate(displayedTime)}
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
                        onClick={handleReportPost}
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
        </>
    );
}

export default PostDetailPage;