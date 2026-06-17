// API Data Loading Functions for World Cup 2026
// Load from local JSON files instead of API

/**
 * Fetch data from local JSON files with error handling
 */
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`data/${endpoint}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

/**
 * Load all games/matches from API
 */
async function loadGames() {
    const data = await fetchFromAPI('games');
    return data ? data.games : [];
}

/**
 * Load all teams from API
 */
async function loadTeams() {
    const data = await fetchFromAPI('teams');
    return data ? data.teams : [];
}

/**
 * Load all groups from API
 */
async function loadGroups() {
    const data = await fetchFromAPI('groups');
    return data ? data.groups : [];
}

/**
 * Load all stadiums from API
 */
async function loadStadiums() {
    const data = await fetchFromAPI('stadiums');
    return data ? data.stadiums : [];
}

/**
 * Transform API group data to match the expected format
 */
function transformGroupData(apiGroups, teams, owners) {
    const groupStandings = {};
    
    apiGroups.forEach(group => {
        const groupLetter = group.name;
        groupStandings[groupLetter] = group.teams.map(teamData => {
            const teamId = teamData.team_id;
            const teamInfo = teams.find(t => t.id === teamId);
            const owner = owners[teamInfo?.name_en] || 'Unknown';
            
            return {
                team: teamInfo?.fifa_code || teamInfo?.name_en || `Team ${teamId}`,
                owner: owner,
                played: parseInt(teamData.mp) || 0,
                won: parseInt(teamData.w) || 0,
                drawn: parseInt(teamData.d) || 0,
                lost: parseInt(teamData.l) || 0,
                goalsFor: parseInt(teamData.gf) || 0,
                goalsAgainst: parseInt(teamData.ga) || 0,
                goalDiff: parseInt(teamData.gd) || 0,
                points: parseInt(teamData.pts) || 0,
                yellowCards: 0, // Not in API, will be calculated from matches
                redCards: 0     // Not in API, will be calculated from matches
            };
        });
    });
    
    return groupStandings;
}

/**
 * Transform API matches to the format expected by the app
 */
function transformMatchData(apiGames, teams) {
    return apiGames.map(game => {
        const homeTeam = teams.find(t => t.id === game.home_team_id);
        const awayTeam = teams.find(t => t.id === game.away_team_id);
        
        // Parse scorers
        let homeScorers = [];
        let awayScorers = [];
        
        if (game.home_scorers && game.home_scorers !== 'null') {
            try {
                // Handle both formats: {"name","name"} and {\"name\",\"name\"}
                let scorersStr = game.home_scorers;
                
                // If it starts with { and doesn't have escaped quotes, it's malformed
                if (scorersStr.startsWith('{') && !scorersStr.includes('\\"')) {
                    // Extract content between braces and split by comma
                    const content = scorersStr.slice(1, -1);
                    homeScorers = content.split('","').map(s => s.replace(/^"|"$/g, ''));
                } else {
                    // Try parsing as proper JSON
                    const scorersObj = JSON.parse(scorersStr.replace(/'/g, '"'));
                    homeScorers = Object.values(scorersObj);
                }
            } catch (e) {
                console.warn('Error parsing home scorers:', game.home_scorers, e);
            }
        }
        
        if (game.away_scorers && game.away_scorers !== 'null') {
            try {
                // Handle both formats: {"name","name"} and {\"name\",\"name\"}
                let scorersStr = game.away_scorers;
                
                // If it starts with { and doesn't have escaped quotes, it's malformed
                if (scorersStr.startsWith('{') && !scorersStr.includes('\\"')) {
                    // Extract content between braces and split by comma
                    const content = scorersStr.slice(1, -1);
                    awayScorers = content.split('","').map(s => s.replace(/^"|"$/g, ''));
                } else {
                    // Try parsing as proper JSON
                    const scorersObj = JSON.parse(scorersStr.replace(/'/g, '"'));
                    awayScorers = Object.values(scorersObj);
                }
            } catch (e) {
                console.warn('Error parsing away scorers:', game.away_scorers, e);
            }
        }
        
        return {
            matchNum: parseInt(game.id),
            date: game.local_date,
            persianDate: game.persian_date,
            team1: homeTeam?.fifa_code || game.home_team_name_en || game.home_team_label || 'TBD',
            team2: awayTeam?.fifa_code || game.away_team_name_en || game.away_team_label || 'TBD',
            score1: game.finished === 'TRUE' ? parseInt(game.home_score) : null,
            score2: game.finished === 'TRUE' ? parseInt(game.away_score) : null,
            group: game.group,
            stadium: game.stadium_id,
            finished: game.finished === 'TRUE',
            type: game.type, // 'group', 'r32', 'r16', 'qf', 'sf', 'final', 'third'
            homeScorers: homeScorers,
            awayScorers: awayScorers,
            isLive: game.time_elapsed !== 'notstarted' && game.time_elapsed !== 'finished',
            timeElapsed: game.time_elapsed
        };
    });
}

/**
 * Team ownership mapping - matches the playerTeams mapping in script.js
 */
const TEAM_OWNERS = {
    'Brazil': 'Darragh',
    'Ivory Coast': 'Darragh',
    'Algeria': 'Darragh',
    'Iran': 'Darragh',
    'Germany': 'Simon',
    'Panama': 'Simon',
    'South Africa': 'Simon',
    'Qatar': 'Simon',
    'Mexico': 'Ben',
    'Saudi Arabia': 'Ben',
    'Scotland': 'Ben',
    'Austria': 'Ben',
    'France': 'Josie',
    'Japan': 'Josie',
    'Uzbekistan': 'Josie',
    'Argentina': 'Josie',
    'Belgium': 'Cormac',
    'Colombia': 'Cormac',
    'Egypt': 'Cormac',
    'Netherlands': 'Cormac',
    'England': 'Cole',
    'Ecuador': 'Cole',
    'Tunisia': 'Cole',
    'New Zealand': 'Cole',
    'Spain': 'Liam',
    'Croatia': 'Liam',
    'Ghana': 'Liam',
    'Jordan': 'Liam',
    'Canada': 'Willie',
    'South Korea': 'Willie',
    'Curaçao': 'Willie',
    'Cape Verde': 'Willie',
    'United States': 'Danny',
    'Uruguay': 'Danny',
    'Democratic Republic of the Congo': 'Danny',
    'Sweden': 'Danny',
    'Australia': 'Laura',
    'Senegal': 'Laura',
    'Turkey': 'Laura',
    'Czech Republic': 'Laura',
    'Switzerland': 'Adam K',
    'Morocco': 'Adam K',
    'Iraq': 'Adam K',
    'Bosnia and Herzegovina': 'Adam K',
    'Norway': 'Unknown',
    'Portugal': 'Unknown',
    'Paraguay': 'Unknown',
    'Haiti': 'Unknown'
};

/**
 * Load all API data and update the application
 */
async function loadAllAPIData() {
    console.log('📊 Loading data from API...');
    
    try {
        // Load all data in parallel
        const [games, teams, groups, stadiums] = await Promise.all([
            loadGames(),
            loadTeams(),
            loadGroups(),
            loadStadiums()
        ]);
        
        if (!games || !teams || !groups) {
            console.error('Failed to load required API data');
            return null;
        }
        
        console.log(`✅ Loaded ${games.length} games`);
        console.log(`✅ Loaded ${teams.length} teams`);
        console.log(`✅ Loaded ${groups.length} groups`);
        console.log(`✅ Loaded ${stadiums.length} stadiums`);
        
        // Transform data to match expected format
        const groupStandings = transformGroupData(groups, teams, TEAM_OWNERS);
        const matches = transformMatchData(games, teams);
        
        // Store in global variables
        window.groupStandings = groupStandings;
        window.matches = matches;
        window.teams = teams;
        window.stadiums = stadiums;
        window.teamOwners = TEAM_OWNERS;
        
        // Calculate additional data from matches (cards, etc.)
        calculateCardsFromMatches(matches, groupStandings);
        
        console.log('✅ API data loaded and transformed successfully');
        
        return {
            groups: groupStandings,
            matches: matches,
            teams: teams,
            stadiums: stadiums
        };
    } catch (error) {
        console.error('Error loading API data:', error);
        return null;
    }
}

/**
 * Calculate yellow and red cards from match data
 * This is a placeholder - actual card data would need to be in the API
 */
function calculateCardsFromMatches(matches, groupStandings) {
    // For now, cards remain at 0 since the API doesn't provide card data
    // This function can be enhanced when card data becomes available
    console.log('ℹ️ Card data not available in API');
}

/**
 * Get the most recent finished match
 */
function getMostRecentMatch(matches) {
    const finished = matches.filter(m => m.finished);
    if (finished.length === 0) return null;
    
    finished.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    
    return finished[0];
}

/**
 * Get upcoming matches
 */
function getUpcomingMatches(matches, limit = 5) {
    const upcoming = matches.filter(m => !m.finished && !m.isLive);
    
    upcoming.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });
    
    return upcoming.slice(0, limit);
}

/**
 * Get live matches
 */
function getLiveMatches(matches) {
    return matches.filter(m => m.isLive);
}

/**
 * Get the fastest goal from all finished matches
 * Returns an object with goal details including player, team, minute, and match info
 */
function getFastestGoal(matches) {
    let fastestGoal = null;
    let fastestMinute = Infinity;
    
    // Filter only finished matches
    const finishedMatches = matches.filter(m => m.finished);
    
    finishedMatches.forEach(match => {
        // Process home team scorers
        if (match.homeScorers && match.homeScorers.length > 0) {
            match.homeScorers.forEach(scorer => {
                const minute = extractGoalMinute(scorer);
                if (minute !== null && minute < fastestMinute) {
                    fastestMinute = minute;
                    fastestGoal = {
                        player: extractPlayerName(scorer),
                        team: match.team1,
                        minute: minute,
                        minuteText: scorer.match(/\d+['′+]*$/)?.[0] || `${minute}'`,
                        match: `${match.team1} ${match.score1}-${match.score2} ${match.team2}`,
                        matchNum: match.matchNum,
                        date: match.date,
                        isOwnGoal: scorer.includes('(OG)'),
                        isPenalty: scorer.includes('(p)')
                    };
                }
            });
        }
        
        // Process away team scorers
        if (match.awayScorers && match.awayScorers.length > 0) {
            match.awayScorers.forEach(scorer => {
                const minute = extractGoalMinute(scorer);
                if (minute !== null && minute < fastestMinute) {
                    fastestMinute = minute;
                    fastestGoal = {
                        player: extractPlayerName(scorer),
                        team: match.team2,
                        minute: minute,
                        minuteText: scorer.match(/\d+['′+]*$/)?.[0] || `${minute}'`,
                        match: `${match.team1} ${match.score1}-${match.score2} ${match.team2}`,
                        matchNum: match.matchNum,
                        date: match.date,
                        isOwnGoal: scorer.includes('(OG)'),
                        isPenalty: scorer.includes('(p)')
                    };
                }
            });
        }
    });
    
    return fastestGoal;
}

/**
 * Extract the goal minute from a scorer string
 * Examples: "Nestory Irankunda 27'" -> 27, "B. Khoukhi 90'+5'" -> 95
 */
function extractGoalMinute(scorerString) {
    // Match patterns like "27'", "90'+5'", "45'+5'"
    const match = scorerString.match(/(\d+)['′](?:\+(\d+))?/);
    if (!match) return null;
    
    const baseMinute = parseInt(match[1]);
    const addedTime = match[2] ? parseInt(match[2]) : 0;
    
    return baseMinute + addedTime;
}

/**
 * Extract the player name from a scorer string
 * Examples: "Nestory Irankunda 27'" -> "Nestory Irankunda"
 */
function extractPlayerName(scorerString) {
    // Remove the minute notation and any special markers
    return scorerString
        .replace(/\d+['′](?:\+\d+)?$/, '') // Remove minute
        .replace(/\(OG\)|\(p\)/g, '')      // Remove (OG) or (p)
        .trim();
}

// Made with Bob