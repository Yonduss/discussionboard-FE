import { formatDate } from "../api/api.js";
import { useAuth } from "../contexts/AuthContext.js";
import emptyProfileImage from "../images/empty-profile-image.png";

function CommentItem({
                         comment,
                         isReply,
                         onReply,
                         onEdit,
                         onDelete,
                         disabled = false
                     }) {
    const { currentUser } = useAuth();

    const isAuthor = currentUser != null &&
        Number(comment.userId) === Number(currentUser.id);

    const canModify = isAuthor && !comment.deleted;

    const displayedTime =
        comment.edited && comment.updatedAt
            ? comment.updatedAt
            : comment.createdAt;

    return (
        <article
            className={`comment-item ${
                isReply ? "reply" : ""
            }`}
        >
            <div className="comment-header">
                <div className="comment-author-circle">
                    <img
                        src={comment.profileImageUrl || emptyProfileImage}
                        alt={`${comment.nickname} profile`}
                    />
                </div>

                <div className="comment-author-info">
                    <div className="comment-author-name">
                        {comment.nickname}
                    </div>

                    <div className="comment-time">
                        {formatDate(displayedTime)}
                    </div>
                </div>

                {!comment.deleted && (
                    <div className="comment-actions">
                        <button
                            type="button"
                            onClick={() => onReply(comment)}
                            disabled={disabled}
                        >
                            Reply
                        </button>

                        {canModify && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onEdit(comment)}
                                    disabled={disabled}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="delete-comment-button"
                                    onClick={() => onDelete(comment)}
                                    disabled={disabled}
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="comment-body">
                <span className="comment-content">
                    {comment.content}
                </span>

                {comment.edited && !comment.deleted && (
                    <span className="edited-label">
                        {" "}
                        (edited)
                    </span>
                )}
            </div>
        </article>
    );
}

export default CommentItem;
