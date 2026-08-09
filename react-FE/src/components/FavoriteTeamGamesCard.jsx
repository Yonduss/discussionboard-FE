import { useEffect, useState } from "react";

import api from "../api/api.js";
import { findMlbTeam } from "../data/mlbTeams.js";
import { formatGameDateTime } from "../utils/dateTime.js";

function GameTeam({ teamCode, teamName, score }) {
    const team = findMlbTeam(teamCode);

    return (
        <span className="favorite-game-team">
            {team && (
                <img
                    src={team.logoPath}
                    alt=""
                    aria-hidden="true"
                />
            )}
            <strong>{teamCode || teamName}</strong>
            <span>{score ?? "-"}</span>
        </span>
    );
}

function GameList({ games, emptyMessage, showResult }) {
    if (!games.length) {
        return <p className="profile-empty-message">{emptyMessage}</p>;
    }

    return (
        <>
            <div className="favorite-games-team-labels" aria-hidden="true">
                <span>Away</span>
                <span>Home</span>
            </div>
            <div className="favorite-games-list">
                {games.map((game) => (
                    <article className="favorite-game-row" key={game.gamePk}>
                        <div className="favorite-game-matchup">
                            <GameTeam
                                teamCode={game.awayTeam}
                                teamName={game.awayTeamName}
                                score={game.awayScore}
                            />
                            <span className="favorite-game-at">@</span>
                            <GameTeam
                                teamCode={game.homeTeam}
                                teamName={game.homeTeamName}
                                score={game.homeScore}
                            />
                        </div>

                        <div className="favorite-game-meta">
                            <time dateTime={game.gameDate}>
                                {formatGameDateTime(game.gameDate)}
                            </time>
                            <span
                                className={`favorite-game-status ${
                                    showResult
                                        ? game.result.toLowerCase()
                                        : game.status.toLowerCase()
                                }`}
                            >
                                {showResult
                                    ? game.result
                                    : game.status === "LIVE"
                                        ? "LIVE"
                                        : game.detailedState || game.status}
                            </span>
                        </div>

                        {game.venue && (
                            <p className="favorite-game-venue">{game.venue}</p>
                        )}
                    </article>
                ))}
            </div>
        </>
    );
}

function GamesFace({
    eyebrow,
    title,
    games,
    emptyMessage,
    showResult,
    toggleLabel,
    onToggle,
    isHidden,
    className
}) {
    return (
        <div
            className={`favorite-games-face ${className}`}
            aria-hidden={isHidden}
        >
            <div className="profile-card-heading">
                <div>
                    <span className="profile-card-eyebrow">{eyebrow}</span>
                    <h2>{title}</h2>
                </div>
                <button
                    type="button"
                    className="favorite-games-toggle"
                    onClick={onToggle}
                    tabIndex={isHidden ? -1 : 0}
                >
                    {toggleLabel}
                </button>
            </div>

            <GameList
                games={games}
                emptyMessage={emptyMessage}
                showResult={showResult}
            />
        </div>
    );
}

function FavoriteTeamGamesCard({ favoriteTeamCode }) {
    const [games, setGames] = useState(null);
    const [isLoading, setIsLoading] = useState(Boolean(favoriteTeamCode));
    const [error, setError] = useState("");
    const [isFlipped, setIsFlipped] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        if (!favoriteTeamCode) {
            return () => {
                cancelled = true;
            };
        }

        async function loadGames() {
            try {
                const result = await api.get(
                    "/api/v1/users/me/favorite-team/games"
                );

                if (!cancelled) {
                    setGames(result.data);
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.message
                        || "Failed to load favorite team games."
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadGames();

        return () => {
            cancelled = true;
        };
    }, [favoriteTeamCode, reloadKey]);

    function retryLoad() {
        setGames(null);
        setError("");
        setIsLoading(true);
        setReloadKey((current) => current + 1);
    }

    if (!favoriteTeamCode) {
        return (
            <section className="profile-dashboard-card favorite-games-card">
                <div className="profile-card-heading">
                    <div>
                        <span className="profile-card-eyebrow">TEAM SCHEDULE</span>
                        <h2>Recent Games</h2>
                    </div>
                </div>
                <p className="profile-empty-message">
                    Select a favorite team to view its games.
                </p>
            </section>
        );
    }

    if (isLoading) {
        return (
            <section className="profile-dashboard-card favorite-games-card">
                <div className="profile-card-heading">
                    <div>
                        <span className="profile-card-eyebrow">TEAM SCHEDULE</span>
                        <h2>Recent Games</h2>
                    </div>
                </div>
                <p className="profile-empty-message">Loading games...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="profile-dashboard-card favorite-games-card">
                <div className="profile-card-heading">
                    <div>
                        <span className="profile-card-eyebrow">TEAM SCHEDULE</span>
                        <h2>Recent Games</h2>
                    </div>
                </div>
                <p className="profile-inline-error" role="alert">{error}</p>
                <button
                    type="button"
                    className="favorite-games-retry"
                    onClick={retryLoad}
                >
                    Try again
                </button>
            </section>
        );
    }

    const recentGames = games?.recentGames ?? [];
    const upcomingGames = games?.upcomingGames ?? [];

    return (
        <section className="profile-dashboard-card favorite-games-card">
            <div
                className={`favorite-games-flipper ${isFlipped ? "is-flipped" : ""}`}
            >
                <GamesFace
                    eyebrow="LAST 5"
                    title="Recent Games"
                    games={recentGames}
                    emptyMessage="No recent games were found."
                    showResult
                    toggleLabel="Upcoming"
                    onToggle={() => setIsFlipped(true)}
                    isHidden={isFlipped}
                    className="front"
                />
                <GamesFace
                    eyebrow="NEXT 5"
                    title="Upcoming Games"
                    games={upcomingGames}
                    emptyMessage="No upcoming games were found."
                    showResult={false}
                    toggleLabel="Recent"
                    onToggle={() => setIsFlipped(false)}
                    isHidden={!isFlipped}
                    className="back"
                />
            </div>
        </section>
    );
}

export default FavoriteTeamGamesCard;
