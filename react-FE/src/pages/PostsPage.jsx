import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api, { requireLogin } from "../api/api.js";
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx";

import "../styles/post.css";

const PAGE_SIZE = 10;

function PostsPage() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [hasNext, setHasNext] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const currentPageRef = useRef(0);
    const hasNextRef = useRef(true);
    const isLoadingRef = useRef(false);

    useEffect(() => {
        requireLogin();
    }, []);

    const loadPosts = useCallback(async () => {
        if (!hasNextRef.current || isLoadingRef.current) {
            return;
        }

        isLoadingRef.current = true;
        setIsLoading(true);

        try {
            const result = await api.get(
                `/api/v1/posts?page=${
                    currentPageRef.current
                }&size=${PAGE_SIZE}`
            );

            const pageData = result.data;

            setPosts((previousPosts) => {
                const postMap = new Map();

                [...previousPosts, ...(pageData.posts || [])].forEach((post) => {
                    postMap.set(post.id, post);
                });

                return [...postMap.values()];
            });

            hasNextRef.current = pageData.hasNext;
            setHasNext(pageData.hasNext);

            currentPageRef.current += 1;
        } catch (error) {
            console.error("Posts fetch error:", error);
            alert(
                error.message ||
                "Failed to load posts."
            );

        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadPosts();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [loadPosts]);

    useEffect(() => {
        function handleScroll() {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - 100) {
                loadPosts();
            }
        }

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [loadPosts]);

    return (
        <>
            <Header />

            <main className="main-container">
                <div className="header-section">
                    <button
                        type="button"
                        className="create-post-btn"
                        onClick={() => navigate("/posts/new")}
                    >
                        + Create Post
                    </button>
                </div>

                <section className="posts-list">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                        />
                    ))}

                    {isLoading && (
                        <div className="posts-loading">
                            Loading posts...
                        </div>
                    )}

                    {!hasNext && posts.length > 0 && (
                        <div className="posts-end">
                            No more posts.
                        </div>
                    )}

                    {!isLoading && posts.length === 0 && (
                        <div className="posts-empty">
                            No posts available.
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

export default PostsPage;