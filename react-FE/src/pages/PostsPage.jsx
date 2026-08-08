import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api.js";
import Header from "../components/Header.jsx";
import PostCard from "../components/PostCard.jsx";
import TodayGamesSidebar from "../components/TodayGamesSidebar.jsx";

import "../styles/post.css";

const PAGE_SIZE = 10;

function PostsPage() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [hasNext, setHasNext] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const [searchInput, setSearchInput] = useState("");
    const [activeKeyword, setActiveKeyword] = useState("");

    const currentPageRef = useRef(0);
    const hasNextRef = useRef(true);
    const isLoadingRef = useRef(false);

    const loadPosts = useCallback(
        async ({
                   reset = false,
                   keywordOverride
               } = {}) => {
            if (isLoadingRef.current) {
                return;
            }

            if (!reset && !hasNextRef.current) {
                return;
            }

            const keyword = keywordOverride !== undefined
                    ? keywordOverride
                    : activeKeyword;

            const requestedPage = reset ? 0 : currentPageRef.current;

            if (reset) {
                currentPageRef.current = 0;
                hasNextRef.current = true;
            }

            isLoadingRef.current = true;
            setIsLoading(true);

            try {
                const query = new URLSearchParams({
                    page: String(requestedPage),
                    size: String(PAGE_SIZE)
                });

                if (keyword) {
                    query.set("keyword", keyword);
                }

                const result = await api.get(
                    `/api/v1/posts?${query.toString()}`
                );

                const pageData = result.data;

                setPosts((previousPosts) => {
                    const sourcePosts = reset
                        ? pageData.posts || []
                        : [
                            ...previousPosts,
                            ...(pageData.posts || [])
                        ];

                    const postMap = new Map();

                    sourcePosts.forEach((post) => {
                        postMap.set(post.id, post);
                    });

                    return [...postMap.values()];
                });

                hasNextRef.current = pageData.hasNext;
                setHasNext(pageData.hasNext);

                currentPageRef.current = requestedPage + 1;
            } catch (error) {
                console.error("Posts fetch error:", error);
                alert(error.message || "Failed to load posts.");
            } finally {
                isLoadingRef.current = false;
                setIsLoading(false);
            }
        },
        [activeKeyword]
    );

    useEffect(() => {
        void loadPosts({
            reset: true,
            keywordOverride: activeKeyword
        });
    }, [activeKeyword, loadPosts]);

    useEffect(() => {
        function handleScroll() {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight =
                document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - 100) {
                void loadPosts();
            }
        }

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [loadPosts]);

    function handleSearch(event) {
        event.preventDefault();

        const trimmedKeyword = searchInput.trim();

        if (trimmedKeyword === activeKeyword) {
            void loadPosts({
                reset: true,
                keywordOverride: trimmedKeyword
            });
            return;
        }

        setActiveKeyword(trimmedKeyword);
    }

    function handleResetSearch() {
        setSearchInput("");

        if (activeKeyword === "") {
            void loadPosts({
                reset: true,
                keywordOverride: ""
            });
            return;
        }

        setActiveKeyword("");
    }

    return (
        <>
            <Header />

            <main className="main-container posts-page-container">
                <div className="posts-page-content">
                    <div className="header-section">
                        <button
                            type="button"
                            className="create-post-btn"
                            onClick={() =>
                                navigate("/posts/new")
                            }
                        >
                            + Create Post
                        </button>

                        <form
                            className="post-search-form"
                            onSubmit={handleSearch}
                        >
                            <input
                                type="search"
                                maxLength={100}
                                className="post-search-input"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by title or content"
                                aria-label="Search posts"
                            />

                            <div className="post-search-actions">
                                <button
                                    type="submit"
                                    className="search-post-btn"
                                    disabled={isLoading}
                                >
                                    🔎 Search
                                </button>

                                <button
                                    type="button"
                                    className="reset-search-btn"
                                    onClick={
                                        handleResetSearch
                                    }
                                    disabled={isLoading}
                                >
                                    🔄 Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {activeKeyword && (
                        <div className="search-result-info">
                            Search results for:{" "}
                            <strong>
                                {activeKeyword}
                            </strong>
                        </div>
                    )}

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

                        {!isLoading &&
                            !hasNext &&
                            posts.length > 0 && (
                                <div className="posts-end">
                                    No more posts.
                                </div>
                            )}

                        {!isLoading &&
                            posts.length === 0 && (
                                <div className="posts-empty">
                                    {activeKeyword
                                        ? "No matching posts found."
                                        : "No posts available."}
                                </div>
                            )}
                    </section>
                </div>

                <TodayGamesSidebar />
            </main>
        </>
    );
}

export default PostsPage;
