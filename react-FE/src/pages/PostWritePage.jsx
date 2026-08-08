import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api.js";
import Header from "../components/Header.jsx";
import ImageUrlInputs from "../components/ImageUrlInputs.jsx";
import { useModal } from "../contexts/ModalContext.js";
import { createClientId } from "../utils/createClientId.js";

import "../styles/post-write.css";

function PostWritePage() {
    const navigate = useNavigate();
    const { showMessage } = useModal();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [images, setImages] = useState(() => [{
            id: createClientId("image"),
            url: ""
        }]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle || !trimmedContent) {
            await showMessage("Title and content are required.");
            return;
        }

        const postImageUrls = images
            .map((image) => image.url.trim())
            .filter(Boolean);

        try {
            setIsSubmitting(true);

            const result = await api.post(
                "/api/v1/posts",
                {
                    title: trimmedTitle,
                    content: trimmedContent,
                    postImageUrls
                }
            );

            await showMessage("Post created successfully.", {
                variant: "success"
            });

            navigate(`/posts/${result.data.id}`, {
                replace: true
            });

        } catch (error) {
            console.error("Create post error:", error);
            await showMessage(error.message || "Failed to create post.", {
                variant: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Header />

            <main className="post-write-container">
                <h3>Create New Post</h3>

                <form
                    id="postForm"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="postTitle">
                            Title
                        </label>

                        <input
                            type="text"
                            maxLength={255}
                            id="postTitle"
                            name="title"
                            placeholder="Enter title"
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="postContent">
                            Contents
                        </label>

                        <textarea
                            maxLength={10000}
                            id="postContent"
                            name="content"
                            rows="8"
                            placeholder="Enter contents"
                            value={content}
                            onChange={(event) =>
                                setContent(event.target.value)
                            }
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <ImageUrlInputs
                        images={images}
                        setImages={setImages}
                        isSubmitting={isSubmitting}
                    />

                    <button
                        type="submit"
                        id="createPostButton"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating post..." : "Create post"}
                    </button>
                </form>
            </main>
        </>
    );
}

export default PostWritePage;
