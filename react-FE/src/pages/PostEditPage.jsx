import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api, { requireLogin } from "../api/api.js";
import Header from "../components/Header.jsx";
import ImageUrlInputs from "../components/ImageUrlInputs.jsx";
import { useAuth } from "../contexts/AuthContext.js";

import "../styles/post-write.css";

function PostEditPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { currentUser, loading: authLoading } = useAuth();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    alert("You are not allowed to edit this post.");

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
                            id: crypto.randomUUID(),
                            url
                        }))
                        : [{
                                id: crypto.randomUUID(),
                                url: ""
                            }
                        ];

                setImages(loadedImages);
            } catch (error) {
                console.error("Initialize post edit page error:", error);
                alert(error.message || "Failed to load post.");

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
        authLoading
    ]);

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) {
            alert("Title is required.");
            return;
        }

        if (!trimmedContent) {
            alert("Content is required.");
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

            alert("Post updated successfully.");

            navigate(`/posts/${postId}`, {
                replace: true
            });
        } catch (error) {
            console.error("Update post error:", error);
            alert(error.message || "Failed to update post.");
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