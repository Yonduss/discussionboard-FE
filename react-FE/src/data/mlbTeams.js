export const MLB_TEAMS = [
    { code: "ARI", name: "Arizona Diamondbacks" },
    { code: "ATH", name: "Athletics" },
    { code: "ATL", name: "Atlanta Braves" },
    { code: "BAL", name: "Baltimore Orioles" },
    { code: "BOS", name: "Boston Red Sox" },
    { code: "CHC", name: "Chicago Cubs" },
    { code: "CWS", name: "Chicago White Sox" },
    { code: "CIN", name: "Cincinnati Reds" },
    { code: "CLE", name: "Cleveland Guardians" },
    { code: "COL", name: "Colorado Rockies" },
    { code: "DET", name: "Detroit Tigers" },
    { code: "HOU", name: "Houston Astros" },
    { code: "KC", name: "Kansas City Royals" },
    { code: "LAA", name: "Los Angeles Angels" },
    { code: "LAD", name: "Los Angeles Dodgers" },
    { code: "MIA", name: "Miami Marlins" },
    { code: "MIL", name: "Milwaukee Brewers" },
    { code: "MIN", name: "Minnesota Twins" },
    { code: "NYM", name: "New York Mets" },
    { code: "NYY", name: "New York Yankees" },
    { code: "PHI", name: "Philadelphia Phillies" },
    { code: "PIT", name: "Pittsburgh Pirates" },
    { code: "SD", name: "San Diego Padres" },
    { code: "SEA", name: "Seattle Mariners" },
    { code: "SF", name: "San Francisco Giants" },
    { code: "STL", name: "St. Louis Cardinals" },
    { code: "TB", name: "Tampa Bay Rays" },
    { code: "TEX", name: "Texas Rangers" },
    { code: "TOR", name: "Toronto Blue Jays" },
    { code: "WSH", name: "Washington Nationals" }
].map((team) => ({
    ...team,
    logoPath: `/team-logos/${team.code}_logo.svg`
}));

export function findMlbTeam(teamCode) {
    return MLB_TEAMS.find((team) => team.code === teamCode) || null;
}
