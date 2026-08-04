import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api, { formatDate } from "../api/api.js";
import Header from "../components/Header.jsx";
import ProfileImageChoiceModal from "../components/ProfileImageChoiceModal.jsx";
import { useAuth } from "../contexts/AuthContext.js";
import { findMlbTeam, MLB_TEAMS } from "../data/mlbTeams.js";
import emptyProfileImage from "../images/empty-profile-image.png";

import "../styles/my-profile.css";

const ACTIVITY_PAGE_SIZE = 5;

function ActivityPagination({ pageData, onPageChange }) {
    if (!pageData || pageData.totalPages <= 1) {
        return null;
    }

    return (
        <div className="profile-pagination">
            <button
                type="button"
                disabled={pageData.page === 0}
                onClick={() => onPageChange(pageData.page - 1)}
            >
                Previous
            </button>

            <span>
                {pageData.page + 1} / {pageData.totalPages}
            </span>

            <button
                type="button"
                disabled={!pageData.hasNext}
                onClick={() => onPageChange(pageData.page + 1)}
            >
                Next
            </button>
        </div>
    );
}

function MyProfilePage() {
    const { currentUser, setCurrentUser } = useAuth();

    const [postsPage, setPostsPage] = useState(null);
    const [commentsPage, setCommentsPage] = useState(null);
    const [postPageNumber, setPostPageNumber] = useState(0);
    const [commentPageNumber, setCommentPageNumber] = useState(0);
    const [postsError, setPostsError] = useState("");
    const [commentsError, setCommentsError] = useState("");
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [isCommentsLoading, setIsCommentsLoading] = useState(true);

    const [selectedTeamCode, setSelectedTeamCode] = useState(
        currentUser.favoriteTeam || ""
    );
    const [pendingTeam, setPendingTeam] = useState(null);
    const [isPreferenceChange, setIsPreferenceChange] = useState(false);
    const [isSavingTeam, setIsSavingTeam] = useState(false);
    const [teamError, setTeamError] = useState("");

    const favoriteTeam = findMlbTeam(currentUser.favoriteTeam);

    useEffect(() => {
        let cancelled = false;

        async function loadPosts() {
            try {
                setIsPostsLoading(true);
                setPostsError("");

                const result = await api.get(
                    `/api/v1/users/me/posts?page=${postPageNumber}&size=${ACTIVITY_PAGE_SIZE}`
                );

                if (!cancelled) {
                    setPostsPage(result.data);
                }
            } catch (error) {
                if (!cancelled) {
                    setPostsError(error.message || "Failed to load your posts.");
                }
            } finally {
                if (!cancelled) {
                    setIsPostsLoading(false);
                }
            }
        }

        void loadPosts();

        return () => {
            cancelled = true;
        };
    }, [postPageNumber]);

    useEffect(() => {
        let cancelled = false;

        async function loadComments() {
            try {
                setIsCommentsLoading(true);
                setCommentsError("");

                const result = await api.get(
                    `/api/v1/users/me/comments?page=${commentPageNumber}&size=${ACTIVITY_PAGE_SIZE}`
                );

                if (!cancelled) {
                    setCommentsPage(result.data);
                }
            } catch (error) {
                if (!cancelled) {
                    setCommentsError(error.message || "Failed to load your comments.");
                }
            } finally {
                if (!cancelled) {
                    setIsCommentsLoading(false);
                }
            }
        }

        void loadComments();

        return () => {
            cancelled = true;
        };
    }, [commentPageNumber]);

    function handleTeamChange(event) {
        const teamCode = event.target.value;

        setSelectedTeamCode(teamCode);
        setTeamError("");

        if (teamCode) {
            setIsPreferenceChange(false);
            setPendingTeam(findMlbTeam(teamCode));
        } else {
            setPendingTeam(null);
            setIsPreferenceChange(false);
            void saveFavoriteTeam(false, null);
        }
    }

    function handleModalCancel() {
        setPendingTeam(null);
        setIsPreferenceChange(false);
        setSelectedTeamCode(currentUser.favoriteTeam || "");
    }

    async function saveFavoriteTeam(
        useTeamLogoAsProfileImage,
        team = pendingTeam
    ) {
        if (isSavingTeam) {
            return;
        }

        try {
            setIsSavingTeam(true);
            setTeamError("");

            const result = await api.patch(
                "/api/v1/users/me/favorite-team",
                {
                    favoriteTeam: team?.code ?? null,
                    useTeamLogoAsProfileImage
                }
            );

            setCurrentUser(result.data);
            setSelectedTeamCode(result.data.favoriteTeam || "");
            setPendingTeam(null);
            setIsPreferenceChange(false);
        } catch (error) {
            console.error("Favorite team update error:", error);
            setTeamError(error.message || "Failed to update favorite team.");

            if (!team) {
                setSelectedTeamCode(currentUser.favoriteTeam || "");
            }
        } finally {
            setIsSavingTeam(false);
        }
    }

    function openPreferenceModal() {
        if (!favoriteTeam) {
            return;
        }

        setIsPreferenceChange(true);
        setPendingTeam(favoriteTeam);
        setTeamError("");
    }

    const isSwitchingToPersonalImage =
        isPreferenceChange
        && currentUser.profileImageSource === "FAVORITE_TEAM";

    const modalTargetImageUrl = isSwitchingToPersonalImage
        ? currentUser.personalProfileImageUrl
        : pendingTeam?.logoPath;

    const modalTargetLabel = isSwitchingToPersonalImage
        ? "Personal image"
        : `${pendingTeam?.code || "Team"} logo`;

    return (
        <>
            <Header />

            <main className="my-profile-page">
                <aside className="profile-summary-card">
                    <div className="profile-page-avatar">
                        <img
                            src={currentUser.profileImageUrl || emptyProfileImage}
                            alt={`${currentUser.nickname} profile`}
                        />
                    </div>

                    <div className="profile-summary-text">
                        <h1>{currentUser.nickname}</h1>
                        <p>{currentUser.email}</p>
                    </div>

                    {favoriteTeam && (
                        <div className="favorite-team-badge">
                            <img
                                src={favoriteTeam.logoPath}
                                alt={`${favoriteTeam.name} logo`}
                            />
                            <div>
                                <span>Favorite team</span>
                                <strong>{favoriteTeam.name}</strong>
                            </div>
                        </div>
                    )}

                    <nav className="profile-account-actions" aria-label="Account actions">
                        <Link to="/users/edit">Edit Profile</Link>
                        <Link to="/users/password-edit">Change Password</Link>
                    </nav>
                </aside>

                <div className="profile-dashboard">
                    <section className="profile-dashboard-card favorite-team-card">
                        <div className="profile-card-heading">
                            <div>
                                <span className="profile-card-eyebrow">TEAM PREFERENCE</span>
                                <h2>Favorite Team</h2>
                            </div>

                            {currentUser.profileImageSource && (
                                <span className="profile-image-source-label">
                                    Profile: {currentUser.profileImageSource === "FAVORITE_TEAM"
                                    ? "Team logo"
                                    : "Personal image"}
                                </span>
                            )}
                        </div>

                        <div className="favorite-team-controls">
                            <label htmlFor="favoriteTeam">Choose your favorite team</label>
                            <div className="favorite-team-select-row">
                                <select
                                    id="favoriteTeam"
                                    value={selectedTeamCode}
                                    disabled={isSavingTeam}
                                    onChange={handleTeamChange}
                                >
                                    <option value="">None</option>
                                    {MLB_TEAMS.map((team) => (
                                        <option key={team.code} value={team.code}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>

                                {favoriteTeam && (
                                    <button
                                        type="button"
                                        className="profile-preference-button"
                                        disabled={isSavingTeam}
                                        onClick={openPreferenceModal}
                                    >
                                        Change image preference
                                    </button>
                                )}
                            </div>
                        </div>

                        {favoriteTeam ? (
                            <div className="selected-team-panel">
                                <img
                                    src={favoriteTeam.logoPath}
                                    alt={`${favoriteTeam.name} logo`}
                                />
                                <div>
                                    <span>Selected</span>
                                    <strong>{favoriteTeam.name}</strong>
                                    <p>{favoriteTeam.code}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="profile-empty-message">
                                Select a team to personalize your profile.
                            </p>
                        )}

                        {teamError && (
                            <p className="profile-inline-error" role="alert">
                                {teamError}
                            </p>
                        )}
                    </section>

                    <div className="profile-activity-grid">
                        <section className="profile-dashboard-card activity-card">
                            <div className="profile-card-heading">
                                <div>
                                    <span className="profile-card-eyebrow">ACTIVITY</span>
                                    <h2>My Posts</h2>
                                </div>
                                <span className="activity-total">
                                    {postsPage?.totalElements ?? 0}
                                </span>
                            </div>

                            {isPostsLoading ? (
                                <p className="profile-empty-message">Loading posts...</p>
                            ) : postsError ? (
                                <p className="profile-inline-error" role="alert">{postsError}</p>
                            ) : postsPage?.content.length ? (
                                <div className="profile-activity-list">
                                    {postsPage.content.map((post) => (
                                        <Link
                                            key={post.id}
                                            to={`/posts/${post.id}`}
                                            className="profile-activity-item"
                                        >
                                            <div>
                                                <strong>{post.title}</strong>
                                                <span>{formatDate(post.createdAt)}</span>
                                            </div>
                                            <div className="profile-activity-stats">
                                                <span>♥ {post.likeCount}</span>
                                                <span>◆ {post.viewCount}</span>
                                                <span>● {post.commentCount}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="profile-empty-message">You have not written any posts yet.</p>
                            )}

                            <ActivityPagination
                                pageData={postsPage}
                                onPageChange={setPostPageNumber}
                            />
                        </section>

                        <section className="profile-dashboard-card activity-card">
                            <div className="profile-card-heading">
                                <div>
                                    <span className="profile-card-eyebrow">ACTIVITY</span>
                                    <h2>My Comments</h2>
                                </div>
                                <span className="activity-total">
                                    {commentsPage?.totalElements ?? 0}
                                </span>
                            </div>

                            {isCommentsLoading ? (
                                <p className="profile-empty-message">Loading comments...</p>
                            ) : commentsError ? (
                                <p className="profile-inline-error" role="alert">{commentsError}</p>
                            ) : commentsPage?.content.length ? (
                                <div className="profile-activity-list">
                                    {commentsPage.content.map((comment) => (
                                        <Link
                                            key={comment.id}
                                            to={`/posts/${comment.postId}`}
                                            className="profile-activity-item comment"
                                        >
                                            <div>
                                                <strong>{comment.postTitle}</strong>
                                                <p>{comment.content}</p>
                                                <span>{formatDate(comment.createdAt)}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="profile-empty-message">You have not written any comments yet.</p>
                            )}

                            <ActivityPagination
                                pageData={commentsPage}
                                onPageChange={setCommentPageNumber}
                            />
                        </section>
                    </div>
                </div>
            </main>

            <ProfileImageChoiceModal
                isOpen={Boolean(pendingTeam)}
                currentImageUrl={currentUser.profileImageUrl}
                personalImageUrl={currentUser.personalProfileImageUrl}
                team={pendingTeam}
                targetImageUrl={modalTargetImageUrl}
                targetLabel={modalTargetLabel}
                targetIsTeamLogo={!isSwitchingToPersonalImage}
                isSubmitting={isSavingTeam}
                onUseTeamLogo={() => saveFavoriteTeam(true)}
                onKeepPersonalImage={() => saveFavoriteTeam(false)}
                onCancel={handleModalCancel}
            />
        </>
    );
}

export default MyProfilePage;
