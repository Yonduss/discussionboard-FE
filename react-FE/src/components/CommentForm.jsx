import { useState } from "react";

function CommentForm({ onSubmit, isSubmitting }) {
    const [content, setContent] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            alert("Please enter a comment.");
            return;
        }

        const isSuccess = await onSubmit(trimmedContent);

        if (isSuccess) {
            setContent("");
        }
    }

    return (
        <form
            className="comment-input-row"
            onSubmit={handleSubmit}
        >
            <label
                htmlFor="commentInput"
                className="visually-hidden"
            >
                Comment
            </label>

            <input
                type="text"
                id="commentInput"
                placeholder="Enter comment here"
                value={content}
                onChange={(event) =>
                    setContent(event.target.value)
                }
                disabled={isSubmitting}
            />

            <button
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Adding..." : "Add Comment"}
            </button>
        </form>
    );
}

export default CommentForm;