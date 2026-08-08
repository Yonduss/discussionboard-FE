import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/api.js";
import Header from "../components/Header.jsx";
import ImageUrlInputs from "../components/ImageUrlInputs.jsx";
import { useAuth } from "../contexts/AuthContext.js";
import { useModal } from "../contexts/ModalContext.js";
import { createClientId } from "../utils/createClientId.js";

import "../styles/post-write.css";

function PostEditPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { showMessage } = useModal();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function initializePage() {
            if (!postId) {
                await showMessage("Post id is missing.", {
                    variant: "error"
                });
                navigate("/posts", { replace: true });
                return;
            }

            try {
                const postResult = await api.get(
                    `/api/v1/posts/${postId}`
                );

                const post = postResult.data;

                const isAuthor = Number(post.userId) === Number(currentUser.id);

                if (!isAuthor) {
                    await showMessage(
                        "You are not allowed to edit this post.",
                        { variant: "error" }
                    );

                    navigate(`/posts/${postId}`, {
                        replace: true
                    });

                    return;
                }

                setTitle(post.title);
                setContent(post.content);

                const loadedImages =
                    post.postImageUrls?.length > 0
                        ? post.postImageUrls.map((url) => ({
                            id: createClientId("image"),
                            url
                        }))
                        : [{
                                id: createClientId("image"),
                                url: ""
                            }
                        ];

                setImages(loadedImages);
            } catch (error) {
                console.error("Initialize post edit page error:", error);
                await showMessage(error.message || "Failed to load post.", {
                    variant: "error"
                });

                navigate(`/posts/${postId}`, {
                    replace: true
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
        showMessage
    ]);

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) {
            await showMessage("Title is required.");
            return;
        }

        if (!trimmedContent) {
            await showMessage("Content is required.");
            return;
        }

        const postImageUrls = images
            .map((image) => image.url.trim())
            .filter(Boolean);
        try {
            setIsSubmitting(true);

            await api.patch(
                `/api/v1/posts/${postId}`,
                {
                    title: trimmedTitle,
                    content: trimmedContent,
                    postImageUrls
                }
            );

            await showMessage("Post updated successfully.", {
                variant: "success"
            });

            navigate(`/posts/${postId}`, {
                replace: true
            });
        } catch (error) {
            console.error("Update post error:", error);
            await showMessage(error.message || "Failed to update post.", {
                variant: "error"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <>
                <Header />

                <main className="post-write-container">
                    Loading post...
                </main>
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="post-write-container">
                <h3>Edit Post</h3>

                <form id="postForm" onSubmit={handleSubmit}>
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
                        id="saveChangesButton"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </main>
        </>
    );
}

export default PostEditPage;
