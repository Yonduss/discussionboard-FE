import { Link } from "react-router-dom";
import { formatDate } from "../api/api.js";

function PostCard({ post }) {
    const displayedTime = post.edited && post.updatedAt
            ? post.updatedAt
            : post.createdAt;

    return (
        <article className="post-item">
            <div className="post-header">
                <Link
                    to={`/posts/${post.id}`}
                    className="post-title"
                >
                    {post.title}

                    {post.edited && (
                        <span className="edited-label">
                            {" "}
                            (edited)
                        </span>
                    )}
                </Link>
            </div>

            <div className="post-author">
                <div className="author-circle">
                    {post.profileImageUrl ? (
                        <img
                            src={post.profileImageUrl}
                            alt={`${post.nickname || "User"} profile`}
                        />
                    ) : (
                        post.nickname
                            ?.charAt(0)
                            .toUpperCase() || "👤"
                    )}
                </div>

                <div className="author-info">
                    {post.nickname} · {formatDate(displayedTime)}
                </div>
            </div>

            <div className="post-stats">
                <div className="stat">
                    {post.liked ? "❤️ " : "👍 "}
                    <span>{post.likeCount}</span>
                </div>

                <div className="stat">
                    👁️ <span>{post.viewCount}</span>
                </div>

                <div className="stat">
                    💬 <span>{post.commentCount}</span>
                </div>
            </div>
        </article>
    );
}

export default PostCard;