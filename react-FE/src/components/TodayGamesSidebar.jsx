import { useEffect, useState } from "react";

import api from "../api/api.js";
import { findMlbTeam } from "../data/mlbTeams.js";
import { formatGameTime, formatShortMonthDay } from "../utils/dateTime.js";

function TodayGameTeam({ teamCode }) {
    const team = findMlbTeam(teamCode);

    return (
        <span className="today-game-team">
            {team && (
                <img
                    src={team.logoPath}
                    alt=""
                    aria-hidden="true"
                />
            )}
            <strong>{teamCode}</strong>
        </span>
    );
}

function TodayGamesSidebar() {
    const [games, setGames] = useState([]);
    const [scheduleDate, setScheduleDate] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadTodayGames() {
            try {
                const result = await api.get("/api/v1/mlb/games/today");

                if (!cancelled) {
                    setGames(result.data?.games ?? []);
                    setScheduleDate(result.data?.date ?? "");
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
                <div className="today-games-title-row">
                    <h2 id="today-games-title">Today&apos;s Games</h2>
                    {scheduleDate && (
                        <time dateTime={scheduleDate}>
                            {formatShortMonthDay(scheduleDate)}
                        </time>
                    )}
                </div>
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
                                    <TodayGameTeam teamCode={game.awayTeam} />
                                    <span>vs</span>
                                    <TodayGameTeam teamCode={game.homeTeam} />
                                </div>
                                <div className="today-game-meta">
                                    <time dateTime={game.gameDate}>
                                        {formatGameTime(game.gameDate)}
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
