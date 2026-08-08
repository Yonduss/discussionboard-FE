import { useEffect, useState } from "react";

import api from "../api/api.js";

const gameTimeFormatter = new Intl.DateTimeFormat(navigator.language, {
    hour: "2-digit",
    minute: "2-digit"
});

function TodayGamesSidebar() {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadTodayGames() {
            try {
                const result = await api.get("/api/v1/mlb/games/today");

                if (!cancelled) {
                    setGames(result.data?.games ?? []);
                }
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.message
                        || "Failed to load today's games."
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadTodayGames();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <aside className="today-games-sidebar" aria-labelledby="today-games-title">
            <div className="today-games-heading">
                <span>MLB SCHEDULE</span>
                <h2 id="today-games-title">Today&apos;s Games</h2>
            </div>

            {isLoading && (
                <p className="today-games-message">Loading games...</p>
            )}

            {!isLoading && error && (
                <p className="today-games-message error" role="alert">
                    {error}
                </p>
            )}

            {!isLoading && !error && games.length === 0 && (
                <p className="today-games-message">No matches today.</p>
            )}

            {!isLoading && !error && games.length > 0 && (
                <div className="today-games-list">
                    {games.map((game) => {
                        const isLive = game.status === "LIVE";

                        return (
                            <article className="today-game-row" key={game.gamePk}>
                                <div className="today-game-matchup">
                                    <strong>{game.awayTeam}</strong>
                                    <span>vs</span>
                                    <strong>{game.homeTeam}</strong>
                                </div>
                                <div className="today-game-meta">
                                    <time dateTime={game.gameDate}>
                                        {gameTimeFormatter.format(
                                            new Date(game.gameDate)
                                        )}
                                    </time>
                                    {isLive ? (
                                        <span className="today-game-live">
                                            LIVE {game.awayScore ?? 0}-{game.homeScore ?? 0}
                                        </span>
                                    ) : (
                                        <span>{game.status}</span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </aside>
    );
}

export default TodayGamesSidebar;
