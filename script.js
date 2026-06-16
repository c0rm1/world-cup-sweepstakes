
/**
 * Get stadium name from stadium ID using API data
 * @param {string} stadiumId - The stadium ID from the match data
 * @returns {string} - Formatted stadium name with city and country
 */
function getStadiumName(stadiumId) {
    if (!window.stadiums || !stadiumId) {
        return "Stadium TBD";
    }
    
    const stadium = window.stadiums.find(s => s.id === stadiumId);
    if (!stadium) {
        return "Stadium TBD";
    }
    
    // Format: "Stadium Name, City, Country"
    return `${stadium.name_en}, ${stadium.city_en}, ${stadium.country_en}`;
}


// Load version info from version.json
async function loadVersionInfo() {
    try {
        const response = await fetch('version.json');
        if (!response.ok) {
            console.info('ℹ️ version.json not found, using runtime timestamp instead');
            return null;
        }
        const version = await response.json();
        console.log('✅ Version loaded:', version.commit, '-', version.message);
        return version;
    } catch (error) {
        console.info('ℹ️ Could not load version info, using runtime timestamp instead');
        return null;
    }
}

// Load live World Cup data from matches.csv
async function loadLiveData() {
    try {
        const response = await fetch('data/matches.csv');
        if (!response.ok) {
            console.warn('Live data not available, using static data');
            return null;
        }
        
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        // Find column indices
        const matchNumIdx = headers.indexOf('match_num');
        const dateIdx = headers.indexOf('date');
        const groupIdx = headers.indexOf('group');
        const team1Idx = headers.indexOf('team1');
        const team2Idx = headers.indexOf('team2');
        const scoreIdx = headers.indexOf('score');
        const statusIdx = headers.indexOf('status');
        const venueIdx = headers.indexOf('venue');
        
        // Parse matches
        const matches = [];
        const groupStandings = {};
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const cols = lines[i].split(',');
            const matchNum = parseInt(cols[matchNumIdx]);
            const group = cols[groupIdx];
            const team1 = cols[team1Idx];
            const team2 = cols[team2Idx];
            const score = cols[scoreIdx];
            const status = cols[statusIdx];
            
            const match = {
                matchNum,
                team1,
                team2,
                group,
                round: group.length === 1 ? 'group' : group.toLowerCase().replace(/\s+/g, ''),
                status,
                date: cols[dateIdx]
            };
            
            // Parse score if match is finished
            if (score !== '-' && status === 'FT') {
                const scores = score.split('-');
                if (scores.length === 2) {
                    match.score1 = parseInt(scores[0]);
                    match.score2 = parseInt(scores[1]);
                    
                    // Update group standings
                    if (match.round === 'group') {
                        if (!groupStandings[group]) {
                            groupStandings[group] = {};
                        }
                        
                        // Initialize teams if needed
                        if (!groupStandings[group][team1]) {
                            groupStandings[group][team1] = {
                                team: team1,
                                played: 0, won: 0, drawn: 0, lost: 0,
                                goalsFor: 0, goalsAgainst: 0, points: 0
                            };
                        }
                        if (!groupStandings[group][team2]) {
                            groupStandings[group][team2] = {
                                team: team2,
                                played: 0, won: 0, drawn: 0, lost: 0,
                                goalsFor: 0, goalsAgainst: 0, points: 0
                            };
                        }
                        
                        // Update stats
                        const t1 = groupStandings[group][team1];
                        const t2 = groupStandings[group][team2];
                        
                        t1.played++;
                        t2.played++;
                        t1.goalsFor += match.score1;
                        t1.goalsAgainst += match.score2;
                        t2.goalsFor += match.score2;
                        t2.goalsAgainst += match.score1;
                        
                        if (match.score1 > match.score2) {
                            t1.won++;
                            t1.points += 3;
                            t2.lost++;
                        } else if (match.score2 > match.score1) {
                            t2.won++;
                            t2.points += 3;
                            t1.lost++;
                        } else {
                            t1.drawn++;
                            t2.drawn++;
                            t1.points++;
                            t2.points++;
                        }
                        
                        t1.goalDifference = t1.goalsFor - t1.goalsAgainst;
                        t2.goalDifference = t2.goalsFor - t2.goalsAgainst;
                    }
                }
            }
            
            matches.push(match);
        }
        
        // Convert group standings to arrays and sort
        const groups = {};
        for (const [groupName, teams] of Object.entries(groupStandings)) {
            groups[groupName] = Object.values(teams).sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                return b.goalsFor - a.goalsFor;
            });
        }
        
        const data = {
            lastUpdated: new Date().toISOString(),
            matches,
            groups
        };
        
        console.log('✅ Live data loaded from matches.csv');
        console.log(`📊 ${matches.length} matches, ${Object.keys(groups).length} groups`);
        
        return data;
    } catch (error) {
        console.warn('Could not load live data:', error);
        return null;
    }
}

// Load card data from CSV file
async function loadCardData() {
    try {
        const response = await fetch('data/worldcup-cards-enriched.csv');
        if (!response.ok) {
            console.warn('Card data not available');
            return {};
        }
        
        const text = await response.text();
        const lines = text.trim().split('\n');
        const cardData = {};
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Parse CSV properly handling quoted fields
            const parts = [];
            let current = '';
            let inQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    parts.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            parts.push(current); // Add the last field
            
            if (parts.length < 7) continue;
            
            const team = parts[2];
            const cardType = parts[4];
            const disciplineScore = parseInt(parts[6]) || 0;
            
            if (!cardData[team]) {
                cardData[team] = { yellow: 0, red: 0, disciplineScore: 0 };
            }
            
            if (cardType === 'Yellow') {
                cardData[team].yellow++;
            } else if (cardType === 'Red' || cardType === 'Yellow-red') {
                cardData[team].red++;
            }
            
            // Use the discipline score from the CSV (it's the same for all cards of a team)
            cardData[team].disciplineScore = disciplineScore;
        }
        
        console.log('✅ Card data loaded for', Object.keys(cardData).length, 'teams');
        console.log('Sample card data:', Object.entries(cardData).slice(0, 5));
        return cardData;
    } catch (error) {
        console.warn('Could not load card data:', error);
        return {};
    }
}
// Parse scorer data from API format
// Expected format examples: "Player Name 45'", "Player Name 12', Player2 67'"
function parseScorers(scorerString) {
    if (!scorerString || scorerString === 'null') return [];
    
    const scorers = [];
    // Split by comma to handle multiple scorers
    const scorerParts = scorerString.split(',');
    
    for (const part of scorerParts) {
        // Match pattern: "Name Surname 45'" or "Name 12'"
        const match = part.trim().match(/^(.+?)\s+(\d+)(?:\+(\d+))?'$/);
        if (match) {
            const player = match[1].trim();
            const minute = parseInt(match[2]) + (match[3] ? parseInt(match[3]) : 0);
            scorers.push({ player, minute });
        }
    }
    
    return scorers;
}


// Global data loaded from API
let matches = [];
let liveGroups = {};
let cardData = {};

// Player data with their teams
const players = {
    'Adam Mc': {
        teams: ['POR', 'PAR', 'NOR', 'HAI']
    },
    'Darragh': {
        teams: ['BRA', 'CIV', 'ALG', 'IRN']
    },
    'Simon': {
        teams: ['GER', 'PAN', 'RSA', 'QAT']
    },
    'Ben': {
        teams: ['MEX', 'KSA', 'SCO', 'AUT']
    },
    'Josie': {
        teams: ['FRA', 'JPN', 'UZB', 'ARG']
    },
    'Cormac': {
        teams: ['BEL', 'COL', 'EGY', 'NED']
    },
    'Cole': {
        teams: ['ENG', 'ECU', 'TUN', 'NZL']
    },
    'Liam': {
        teams: ['ESP', 'CRO', 'GHA', 'JOR']
    },
    'Willie': {
        teams: ['CAN', 'KOR', 'CUW', 'CPV']
    },
    'Danny': {
        teams: ['USA', 'URU', 'COD', 'SWE']
    },
    'Laura': {
        teams: ['AUS', 'SEN', 'TUR', 'CZE']
    },
    'Adam K': {
        teams: ['SUI', 'MAR', 'IRQ', 'BIH']
    }
};

// Flag colors for each country (vibrant/saturated versions)
const flagColors = {
    'USA': ['#FF0033', '#FFFFFF', '#0055FF'],
    'MEX': ['#00AA55', '#FFFFFF', '#FF1133'],
    'CAN': ['#FF0000', '#FFFFFF'],
    'CPV': ['#0055FF', '#FFFFFF', '#FF2244', '#FFD700'],
    'BRA': ['#00DD44', '#FFEE00', '#0044FF'],
    'ARG': ['#55CCFF', '#FFFFFF', '#FFCC00'],
    'URU': ['#0055FF', '#FFFFFF', '#FFDD00'],
    'COL': ['#FFDD00', '#0055FF', '#FF1133'],
    'GER': ['#000000', '#FF0000', '#FFDD00'],
    'ESP': ['#FF0033', '#FFCC00'],
    'NED': ['#0055FF', '#FFFFFF', '#FF1133'],
    'SUI': ['#FF0000', '#FFFFFF'],
    'FRA': ['#0066FF', '#FFFFFF', '#FF3344'],
    'ENG': ['#FFFFFF', '#FF0033'],
    'BEL': ['#000000', '#FFDD00', '#FF3344'],
    'POR': ['#00AA33', '#FF0000'],
    'CRO': ['#FF0000', '#FFFFFF', '#0044FF'],
    'SWE': ['#0088FF', '#FFDD00'],
    'ALG': ['#00AA44', '#FFFFFF', '#FF1133'],
    'SEN': ['#00BB44', '#FFEE00', '#FF2233'],
    'MAR': ['#FF1133', '#00AA44'],
    'EGY': ['#FF1133', '#FFFFFF', '#000000'],
    'TUN': ['#FF0033', '#FFFFFF'],
    'IRN': ['#33DD55', '#FFFFFF', '#FF0033'],
    'JPN': ['#FF0033', '#FFFFFF'],
    'KOR': ['#0055FF', '#FF3344', '#FFFFFF'],
    'AUS': ['#0033FF', '#FFFFFF', '#FF0000'],
    'QAT': ['#AA1155', '#FFFFFF'],
    'CIV': ['#FF8800', '#FFFFFF', '#00CC66'],
    'GHA': ['#00AA44', '#FFDD00', '#FF1133'],
    'COD': ['#00AAFF', '#FFDD00', '#FF1133'],
    'RSA': ['#00AA55', '#FFCC00', '#FF3344', '#0044FF'],
    'PAR': ['#FF1133', '#FFFFFF', '#0055FF'],
    'NOR': ['#FF0033', '#0044FF', '#FFFFFF'],
    'HAI': ['#0044FF', '#FF1133'],
    'PAN': ['#FF1133', '#FFFFFF', '#0066FF'],
    'KSA': ['#00AA44', '#FFFFFF'],
    'SCO': ['#0088FF', '#FFFFFF'],
    'AUT': ['#FF1133', '#FFFFFF'],
    'UZB': ['#00BBFF', '#FFFFFF', '#22DD44', '#FF1133'],
    'ECU': ['#FFDD00', '#0055FF', '#FF1133'],
    'NZL': ['#0044FF', '#FFFFFF', '#FF0033'],
    'JOR': ['#000000', '#FFFFFF', '#00AA44', '#FF1133'],
    'CUW': ['#0044FF', '#FFEE00', '#FFFFFF'],
    'TUR': ['#FF0033', '#FFFFFF'],
    'CZE': ['#0055FF', '#FFFFFF', '#FF1133'],
    'IRQ': ['#FF1133', '#FFFFFF', '#00AA44'],
    'BIH': ['#0044FF', '#FFDD00', '#FFFFFF'],
    'TBD': ['#888888', '#BBBBBB']
};

// Group assignments (World Cup 2026 - CORRECT from API)
const groups = {
    'A': ['MEX', 'RSA', 'KOR', 'CZE'],
    'B': ['CAN', 'BIH', 'QAT', 'SUI'],
    'C': ['BRA', 'MAR', 'HAI', 'SCO'],
    'D': ['USA', 'PAR', 'AUS', 'TUR'],
    'E': ['GER', 'CUW', 'CIV', 'ECU'],
    'F': ['NED', 'JPN', 'SWE', 'TUN'],
    'G': ['BEL', 'EGY', 'IRN', 'NZL'],
    'H': ['ESP', 'CPV', 'KSA', 'URU'],
    'I': ['FRA', 'SEN', 'IRQ', 'NOR'],
    'J': ['ARG', 'ALG', 'AUT', 'JOR'],
    'K': ['POR', 'COD', 'UZB', 'COL'],
    'L': ['ENG', 'CRO', 'GHA', 'PAN'],
};

// Calculate team standings from match results
function calculateStandings() {
    const standings = {};
    
    // Initialize all teams with zero stats
    Object.keys(groups).forEach(group => {
        groups[group].forEach(team => {
            const cards = cardData[team] || { yellow: 0, red: 0, disciplineScore: 0 };
            standings[team] = {
                group: group,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0,
                yellowCards: cards.yellow,
                redCards: cards.red,
                conductScore: cards.disciplineScore  // From Wikipedia discipline table
            };
        });
    });
    
    // Process finished group stage matches
    matches.forEach(match => {
        if (match.type === 'group' && match.finished &&
            match.score1 !== null && match.score2 !== null) {
            
            const team1 = match.team1;
            const team2 = match.team2;
            
            // Skip if teams not in standings (shouldn't happen)
            if (!standings[team1] || !standings[team2]) return;
            
            // Update match counts
            standings[team1].played++;
            standings[team2].played++;
            
            // Update goals
            standings[team1].goalsFor += match.score1;
            standings[team1].goalsAgainst += match.score2;
            standings[team2].goalsFor += match.score2;
            standings[team2].goalsAgainst += match.score1;
            
            // Update results and points
            if (match.score1 > match.score2) {
                // Team1 wins
                standings[team1].won++;
                standings[team1].points += 3;
                standings[team2].lost++;
            } else if (match.score2 > match.score1) {
                // Team2 wins
                standings[team2].won++;
                standings[team2].points += 3;
                standings[team1].lost++;
            } else {
                // Draw
                standings[team1].drawn++;
                standings[team2].drawn++;
                standings[team1].points++;
                standings[team2].points++;
            }
        }
    });
    
    // Calculate conduct scores (higher is better, so negative total cards)
    // Fewer cards = better conduct score
    Object.keys(standings).forEach(team => {
        const totalCards = standings[team].yellowCards + standings[team].redCards;
        standings[team].conductScore = -totalCards;
    });
    
    return standings;
}

// Team standings (calculated from matches)
let teamStandings = {};

// FIFA World Cup tie-breaking rules
// Returns: negative if a should rank higher, positive if b should rank higher, 0 if equal
function fifaTieBreaker(a, b, allTeamsInGroup) {
    // Step 1: Points
    if (b.points !== a.points) return b.points - a.points;
    
    // If only 2 teams are tied, apply head-to-head first
    const tiedTeams = allTeamsInGroup.filter(t => t.points === a.points);
    if (tiedTeams.length === 2) {
        // Get head-to-head matches between these two teams
        const h2hMatches = matches.filter(m =>
            m.type === 'group' && m.finished &&
            ((m.team1 === a.team && m.team2 === b.team) ||
             (m.team1 === b.team && m.team2 === a.team))
        );
        
        if (h2hMatches.length > 0) {
            let aH2HPoints = 0, bH2HPoints = 0;
            let aH2HGF = 0, aH2HGA = 0, bH2HGF = 0, bH2HGA = 0;
            
            h2hMatches.forEach(m => {
                if (m.team1 === a.team) {
                    aH2HGF += m.score1;
                    aH2HGA += m.score2;
                    bH2HGF += m.score2;
                    bH2HGA += m.score1;
                    if (m.score1 > m.score2) aH2HPoints += 3;
                    else if (m.score2 > m.score1) bH2HPoints += 3;
                    else { aH2HPoints++; bH2HPoints++; }
                } else {
                    bH2HGF += m.score1;
                    bH2HGA += m.score2;
                    aH2HGF += m.score2;
                    aH2HGA += m.score1;
                    if (m.score1 > m.score2) bH2HPoints += 3;
                    else if (m.score2 > m.score1) aH2HPoints += 3;
                    else { aH2HPoints++; bH2HPoints++; }
                }
            });
            
            // Step 1a: Head-to-head points
            if (bH2HPoints !== aH2HPoints) return bH2HPoints - aH2HPoints;
            
            // Step 1b: Head-to-head goal difference
            const aH2HGD = aH2HGF - aH2HGA;
            const bH2HGD = bH2HGF - bH2HGA;
            if (bH2HGD !== aH2HGD) return bH2HGD - aH2HGD;
            
            // Step 1c: Head-to-head goals scored
            if (bH2HGF !== aH2HGF) return bH2HGF - aH2HGF;
        }
    }
    
    // Step 2a: Overall goal difference
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    
    // Step 2b: Overall goals scored
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    
    // Step 2c: Conduct score (higher is better, fewer cards)
    // Since conductScore is negative (fewer cards = less negative = higher), we want higher scores first
    if (a.conductScore !== b.conductScore) return b.conductScore - a.conductScore;
    
    // Step 3: FIFA ranking (we'll use alphabetical as proxy since we don't have real rankings)
    return a.team.localeCompare(b.team);
}

// FIFA tie-breaking for third-place teams (no head-to-head since different groups)
function thirdPlaceTieBreaker(a, b) {
    // Step 1: Points
    if (b.points !== a.points) return b.points - a.points;
    
    // Step 2: Goal difference
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    
    // Step 3: Goals scored
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    
    // Step 4: Conduct score (higher is better, fewer cards)
    if (b.conductScore !== a.conductScore) return b.conductScore - a.conductScore;
    
    // Step 5: FIFA ranking (alphabetical as proxy)
    return a.team.localeCompare(b.team);
}

// Statistics data
let statistics = {
    fastestGoals: [],
    fastestCards: [],
    mostConceded: [],
    playerCards: {}
};

// Initialize player cards
Object.keys(players).forEach(player => {
    statistics.playerCards[player] = { yellow: 0, red: 0, total: 0 };
});

// Find owner of a team
function findOwner(team) {
    for (const [player, data] of Object.entries(players)) {
        if (data.teams.includes(team)) {
            return player;
        }
    }
    return 'Unknown';
}

// Show/hide pages
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    const buttons = document.querySelectorAll('.nav-item');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${pageName}-page`).classList.add('active');
    event.target.closest('.nav-item').classList.add('active');
    
    if (pageName === 'knockout') {
        renderKnockoutBracket();
    } else if (pageName === 'fixtures') {
        renderFixtures();
    }
}

// Track sort state for each group
const groupSortState = {};

// Render all groups
function renderGroups() {
    const container = document.getElementById('groupsGrid');
    container.innerHTML = '';
    
    // Create array of group data with live status
    const groupsArray = Object.keys(groups).map(groupName => {
        const groupTeams = groups[groupName].map(team => ({
            team: team,
            owner: findOwner(team),
            ...teamStandings[team]
        }));
        
        // Check if any match in this group is actually live RIGHT NOW
        const hasLiveGame = matches.some(match => {
            if (match.type !== 'group' || !match.isLive) return false;
            
            // Check if any team from this group is in the match
            const groupTeamCodes = groupTeams.map(t => t.team);
            const matchInvolvesGroup = groupTeamCodes.includes(match.team1) || groupTeamCodes.includes(match.team2);
            
            if (!matchInvolvesGroup) return false;
            
            // Parse match date and check if it's currently happening
            if (match.date) {
                try {
                    // Parse date format: "06/11/2026 13:00"
                    const [datePart, timePart] = match.date.split(' ');
                    const [month, day, year] = datePart.split('/');
                    const [hours, minutes] = timePart.split(':');
                    
                    const kickoffTime = new Date(year, month - 1, day, hours, minutes);
                    const now = new Date();
                    
                    // Match is live if:
                    // - Kickoff time has passed
                    // - Less than 2 hours have elapsed since kickoff (90 min + stoppage + halftime)
                    const timeSinceKickoff = now - kickoffTime;
                    const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
                    
                    return timeSinceKickoff >= 0 && timeSinceKickoff <= twoHours;
                } catch (e) {
                    console.warn('Could not parse match date:', match.date);
                    return false;
                }
            }
            
            return false;
        });
        
        return {
            name: groupName,
            teams: groupTeams,
            isLive: hasLiveGame
        };
    });
    
    // Sort groups: live groups first, then alphabetically
    groupsArray.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return a.name.localeCompare(b.name);
    });
    
    // Render each group
    groupsArray.forEach(groupData => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.dataset.group = groupData.name;
        
        // Add live class if group has live games
        if (groupData.isLive) {
            groupCard.classList.add('live-group');
        }
        
        // Get current sort for this group (default to FIFA rules)
        const currentSort = groupSortState[groupData.name] || 'fifa';
        
        // Sort teams based on current sort state
        if (currentSort === 'cards') {
            groupData.teams.sort((a, b) => {
                const totalA = (a.yellowCards || 0) + (a.redCards || 0) * 2;
                const totalB = (b.yellowCards || 0) + (b.redCards || 0) * 2;
                return totalA - totalB; // Fewest cards first
            });
        } else if (currentSort === 'gd') {
            groupData.teams.sort((a, b) => {
                const gdA = a.goalsFor - a.goalsAgainst;
                const gdB = b.goalsFor - b.goalsAgainst;
                return gdA - gdB; // Lowest GD first
            });
        } else {
            // Default FIFA tie-breaking rules
            groupData.teams.sort((a, b) => fifaTieBreaker(a, b, groupData.teams));
        }
        
        let tableHTML = `
            <h3>Group ${groupData.name}${groupData.isLive ? ' <span class="live-indicator">LIVE</span>' : ''}</h3>
            <table class="group-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Team</th>
                        <th>Owner</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>GF</th>
                        <th>GA</th>
                        <th>GD</th>
                        <th>Pts</th>
                        <th title="Discipline Score (FIFA Fair Play)">DS</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        groupData.teams.forEach((teamData, index) => {
            const goalDiff = teamData.goalsFor - teamData.goalsAgainst;
            const gdDisplay = goalDiff > 0 ? `+${goalDiff}` : goalDiff;
            const yellowCards = teamData.yellowCards || 0;
            const redCards = teamData.redCards || 0;
            const disciplineScore = teamData.conductScore || 0;
            const disciplineDisplay = disciplineScore;
            
            tableHTML += `
                <tr data-owner="${teamData.owner}">
                    <td><strong>${index + 1}</strong></td>
                    <td><strong>${teamData.team}</strong></td>
                    <td>${teamData.owner}</td>
                    <td>${teamData.played}</td>
                    <td>${teamData.won}</td>
                    <td>${teamData.drawn}</td>
                    <td>${teamData.lost}</td>
                    <td>${teamData.goalsFor}</td>
                    <td>${teamData.goalsAgainst}</td>
                    <td>${gdDisplay}</td>
                    <td><strong>${teamData.points}</strong></td>
                    <td><span class="discipline-cell" title="Discipline Score: ${disciplineScore} (${yellowCards}Y, ${redCards}R)">${disciplineDisplay}</span></td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        groupCard.innerHTML = tableHTML;
        container.appendChild(groupCard);
    });
}

// Sort group by different criteria
function sortGroup(groupName, sortType) {
    groupSortState[groupName] = sortType;
    renderGroups();
}

// Current selected player for filtering
let selectedPlayer = 'all';

// Handle player search input
function handlePlayerSearch() {
    const searchInput = document.getElementById('playerSearch');
    const dropdown = document.getElementById('playerDropdown');
    const clearBtn = document.getElementById('clearSearch');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        dropdown.classList.remove('show');
        dropdown.innerHTML = '';
        return;
    }
    
    // Filter players based on search term
    const matchingPlayers = Object.keys(players).filter(player =>
        player.toLowerCase().includes(searchTerm)
    );
    
    if (matchingPlayers.length > 0) {
        dropdown.innerHTML = matchingPlayers.map(player =>
            `<div class="player-option" onclick="selectPlayer('${player}')">${player}</div>`
        ).join('');
        dropdown.classList.add('show');
    } else {
        dropdown.innerHTML = '<div class="player-option" style="color: #666666;">No players found</div>';
        dropdown.classList.add('show');
    }
}

// Select a player from dropdown
function selectPlayer(player) {
    const searchInput = document.getElementById('playerSearch');
    const dropdown = document.getElementById('playerDropdown');
    const clearBtn = document.getElementById('clearSearch');
    
    searchInput.value = player;
    selectedPlayer = player;
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
    clearBtn.style.display = 'flex';
    
    filterGroups();
}

// Clear player search
function clearPlayerSearch() {
    const searchInput = document.getElementById('playerSearch');
    const dropdown = document.getElementById('playerDropdown');
    const clearBtn = document.getElementById('clearSearch');
    
    searchInput.value = '';
    selectedPlayer = 'all';
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
    clearBtn.style.display = 'none';
    
    filterGroups();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const searchContainer = document.querySelector('.search-container');
    const dropdown = document.getElementById('playerDropdown');
    
    if (searchContainer && !searchContainer.contains(event.target)) {
        dropdown.classList.remove('show');
        dropdown.innerHTML = '';
    }
});

// Filter groups
function filterGroups() {
    const ownerFilter = selectedPlayer;
    
    // Filter group cards
    const groupCards = document.querySelectorAll('.group-card');
    groupCards.forEach(card => {
        let showCard = true;
        
        // Filter by owner - show entire group if any team belongs to the owner
        if (ownerFilter !== 'all') {
            const rows = card.querySelectorAll('tbody tr');
            let hasOwner = false;
            rows.forEach(row => {
                if (row.dataset.owner === ownerFilter) {
                    hasOwner = true;
                }
                // Always show all rows in the group
                row.style.display = '';
            });
            // Only hide the entire group if the owner has no teams in it
            if (!hasOwner) showCard = false;
        } else {
            // Show all rows if no owner filter
            const rows = card.querySelectorAll('tbody tr');
            rows.forEach(row => row.style.display = '');
        }
        
        card.style.display = showCard ? 'block' : 'none';
    });
    
    // Filter third place table
    const thirdPlaceRows = document.querySelectorAll('#thirdPlaceTeams tr');
    thirdPlaceRows.forEach(row => {
        let showRow = true;
        const ownerCell = row.querySelector('td:nth-child(3)');
        
        if (ownerCell) {
            const owner = ownerCell.textContent.trim();
            
            // Filter by owner
            if (ownerFilter !== 'all' && owner !== ownerFilter) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
    
    // Filter leaderboard table
    const leaderboardRows = document.querySelectorAll('#leagueTableBody tr');
    leaderboardRows.forEach(row => {
        let showRow = true;
        const playerCell = row.querySelector('td:nth-child(2)');
        
        if (playerCell) {
            const player = playerCell.textContent.trim();
            
            // Filter by owner
            if (ownerFilter !== 'all' && player !== ownerFilter) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
    
    // Filter knockout matches
    const knockoutMatches = document.querySelectorAll('.match');
    knockoutMatches.forEach(match => {
        let showMatch = true;
        const teamOwners = match.querySelectorAll('.team-owner');
        
        if (ownerFilter !== 'all') {
            let hasOwner = false;
            teamOwners.forEach(ownerSpan => {
                if (ownerSpan.textContent.trim() === ownerFilter) {
                    hasOwner = true;
                }
            });
            if (!hasOwner) {
                showMatch = false;
            }
        }
        
        match.style.display = showMatch ? '' : 'none';
    });
}


// Render third place teams
function renderThirdPlaceTeams() {
    const tbody = document.getElementById('thirdPlaceTeams');
    tbody.innerHTML = '';
    
    // Get all third place teams
    let thirdPlaceTeams = [];
    
    // Use CSV data if available
    if (window.thirdPlaceData && window.thirdPlaceData.length > 0) {
        thirdPlaceTeams = window.thirdPlaceData;
        console.log('📊 Using third place data from CSV');
    } else {
        // Fall back to calculating from groups
        Object.keys(groups).forEach(groupName => {
            const groupTeams = groups[groupName].map(team => ({
                team: team,
                owner: findOwner(team),
                group: groupName,
                ...teamStandings[team]
            }));
            
            // Sort to find third place using FIFA rules
            groupTeams.sort((a, b) => fifaTieBreaker(a, b, groupTeams));
            
            if (groupTeams[2]) {
                thirdPlaceTeams.push(groupTeams[2]);
            }
        });
        
        // Sort third place teams using FIFA rules for third-place ranking
        thirdPlaceTeams.sort((a, b) => thirdPlaceTieBreaker(a, b));
    }
    
    thirdPlaceTeams.forEach((teamData, index) => {
        const goalDiff = teamData.goalsFor - teamData.goalsAgainst;
        const gdDisplay = goalDiff > 0 ? `+${goalDiff}` : goalDiff;
        const yellowCards = teamData.yellowCards || 0;
        const redCards = teamData.redCards || 0;
        const disciplineScore = teamData.conductScore || 0;
        const disciplineDisplay = disciplineScore;
        
        const row = document.createElement('tr');
        
        // Add special class to 8th place team to show qualification line
        if (index === 7) {
            row.classList.add('qualification-cutoff');
        }
        
        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td><strong>${teamData.team}</strong></td>
            <td>${teamData.owner}</td>
            <td>${teamData.played}</td>
            <td>${teamData.won}</td>
            <td>${teamData.drawn}</td>
            <td>${teamData.lost}</td>
            <td>${teamData.goalsFor}</td>
            <td>${teamData.goalsAgainst}</td>
            <td>${gdDisplay}</td>
            <td><span class="discipline-cell" title="Discipline Score: ${disciplineScore} (${yellowCards}Y, ${redCards}R)">${disciplineDisplay}</span></td>
            <td><strong>${teamData.points}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Calculate league table
function calculateLeagueTable() {
    const leagueData = {};
    
    Object.keys(players).forEach(player => {
        leagueData[player] = {
            teams: players[player].teams,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            points: 0
        };
        
        players[player].teams.forEach(team => {
            const standing = teamStandings[team];
            if (standing) {
                leagueData[player].played += standing.played;
                leagueData[player].won += standing.won;
                leagueData[player].drawn += standing.drawn;
                leagueData[player].lost += standing.lost;
                leagueData[player].points += standing.points;
            }
        });
    });
    
    return leagueData;
}

// Render league table
async function calculateLeaderboardStats() {
    const stats = {
        fastestGoal: { owner: null, team: null, minute: Infinity, match: null },
        fastestCard: { owner: null, team: null, minute: Infinity, player: null, cardType: null, match: null },
        mostCards: { owner: null, total: 0, yellow: 0, red: 0, straightRed: 0 },
        worstGD: { owner: null, gd: Infinity }
    };
    
    // Process all group stage matches for goals from API scorer data
    matches.filter(m => m.type === 'group' && m.finished).forEach(match => {
        // Process home scorers (already parsed as array)
        if (match.homeScorers && match.homeScorers.length > 0) {
            match.homeScorers.forEach(scorerStr => {
                // Extract minute from scorer string like "Nestory Irankunda 27'"
                const minuteMatch = scorerStr.match(/(\d+)['′](?:\+(\d+))?/);
                if (minuteMatch) {
                    const baseMinute = parseInt(minuteMatch[1]);
                    const addedTime = minuteMatch[2] ? parseInt(minuteMatch[2]) : 0;
                    const minute = baseMinute + addedTime;
                    const player = scorerStr.replace(/\d+['′](?:\+\d+)?$/, '').replace(/\(OG\)|\(p\)/g, '').trim();
                    
                    const owner = findOwner(match.team1);
                    if (owner && minute < stats.fastestGoal.minute) {
                        stats.fastestGoal = {
                            owner,
                            team: match.team1,
                            minute: minute,
                            match: `${match.team1} vs ${match.team2}`,
                            player: player
                        };
                    }
                }
            });
        }
        
        // Process away scorers (already parsed as array)
        if (match.awayScorers && match.awayScorers.length > 0) {
            match.awayScorers.forEach(scorerStr => {
                // Extract minute from scorer string like "Nestory Irankunda 27'"
                const minuteMatch = scorerStr.match(/(\d+)['′](?:\+(\d+))?/);
                if (minuteMatch) {
                    const baseMinute = parseInt(minuteMatch[1]);
                    const addedTime = minuteMatch[2] ? parseInt(minuteMatch[2]) : 0;
                    const minute = baseMinute + addedTime;
                    const player = scorerStr.replace(/\d+['′](?:\+\d+)?$/, '').replace(/\(OG\)|\(p\)/g, '').trim();
                    
                    const owner = findOwner(match.team2);
                    if (owner && minute < stats.fastestGoal.minute) {
                        stats.fastestGoal = {
                            owner,
                            team: match.team2,
                            minute: minute,
                            match: `${match.team1} vs ${match.team2}`,
                            player: player
                        };
                    }
                }
            });
        }
    });
    
    // Process card data for fastest card
    try {
        const response = await fetch('data/worldcup-cards-enriched.csv');
        if (response.ok) {
            const text = await response.text();
            const lines = text.trim().split('\n');
            
            // Skip header row
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                // Parse CSV properly handling quoted fields
                const parts = [];
                let current = '';
                let inQuotes = false;
                
                for (let j = 0; j < line.length; j++) {
                    const char = line[j];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        parts.push(current);
                        current = '';
                    } else {
                        current += char;
                    }
                }
                parts.push(current); // Add the last field
                
                if (parts.length < 7) continue;
                
                const match = parts[0];
                const team = parts[2];
                const player = parts[3];
                const cardType = parts[4];
                const minuteStr = parts[5];
                
                // Parse minute (handle formats like "90+2", "23", etc.)
                const minuteMatch = minuteStr.match(/(\d+)(?:\+(\d+))?/);
                if (minuteMatch) {
                    const baseMinute = parseInt(minuteMatch[1]);
                    const addedTime = minuteMatch[2] ? parseInt(minuteMatch[2]) : 0;
                    const minute = baseMinute + addedTime;
                    
                    const owner = findOwner(team);
                    if (owner && minute < stats.fastestCard.minute) {
                        stats.fastestCard = {
                            owner,
                            team,
                            minute,
                            player,
                            cardType,
                            match
                        };
                    }
                }
            }
        }
    } catch (error) {
        console.warn('Could not load card data for fastest card:', error);
    }
    
    // Card data processing derived from standings/API data
    try {
        // Calculate most cards and straight reds per owner
        const ownerCardCounts = {};
        Object.entries(players).forEach(([owner, data]) => {
            ownerCardCounts[owner] = { yellow: 0, red: 0, straightRed: 0 };
            data.teams.forEach(team => {
                const teamStanding = teamStandings[team];
                if (teamStanding) {
                    ownerCardCounts[owner].yellow += teamStanding.yellowCards || 0;
                    ownerCardCounts[owner].red += teamStanding.redCards || 0;
                    ownerCardCounts[owner].straightRed += teamStanding.redCards || 0;
                }
            });
        });
        // Find owner with most cards (weighted: yellow=1, red=3)
        Object.entries(ownerCardCounts).forEach(([owner, counts]) => {
            const total = counts.yellow + counts.red;
            const weightedTotal = counts.yellow + (counts.red * 3);
            const currentWeightedTotal = stats.mostCards.yellow + (stats.mostCards.red * 3);
            
            if (weightedTotal > currentWeightedTotal ||
                (weightedTotal === currentWeightedTotal && counts.red > stats.mostCards.red) ||
                (weightedTotal === currentWeightedTotal && counts.red === stats.mostCards.red && counts.straightRed > stats.mostCards.straightRed)) {
                stats.mostCards = { owner, total, yellow: counts.yellow, red: counts.red, straightRed: counts.straightRed };
            }
        });
    } catch (error) {
        console.warn('Could not load card data for stats:', error);
    }
    
    // Calculate worst combined goal difference
    Object.entries(players).forEach(([owner, data]) => {
        let combinedGD = 0;
        data.teams.forEach(team => {
            const standing = teamStandings[team];
            if (standing) {
                const gd = (standing.goalsFor || 0) - (standing.goalsAgainst || 0);
                combinedGD += gd;
            }
        });
        
        if (combinedGD < stats.worstGD.gd) {
            stats.worstGD = { owner, gd: combinedGD };
        }
    });
    
    return stats;
}

// Leaderboard sort state
let leaderboardSortState = 'points';

function renderLeagueTable() {
    const tbody = document.getElementById('leagueTableBody');
    tbody.innerHTML = '';
    
    let playersWithStats;
    
    // Use CSV leaderboard data if available
    if (window.leaderboardData && window.leaderboardData.length > 0) {
        console.log('📊 Using leaderboard data from CSV');
        playersWithStats = window.leaderboardData.map(row => [
            row.owner,
            {
                teams: row.teams.split(', '),
                played: row.played,
                won: row.won,
                drawn: row.drawn,
                lost: row.lost,
                points: row.points,
                totalYellow: row.yellowCards,
                totalRed: row.redCards,
                totalCards: row.yellowCards + row.redCards,
                totalGD: row.goalDiff
            }
        ]);
    } else {
        // Fall back to calculating from league data
        const leagueData = calculateLeagueTable();
        
        // Calculate additional stats for each player
        playersWithStats = Object.entries(leagueData).map(([player, data]) => {
            let totalCards = 0;
            let totalYellow = 0;
            let totalRed = 0;
            let totalGD = 0;
            
            data.teams.forEach(team => {
                const standing = teamStandings[team];
                if (standing) {
                    totalYellow += (standing.yellowCards || 0);
                    totalRed += (standing.redCards || 0);
                    totalCards += totalYellow + totalRed;
                    totalGD += (standing.goalsFor || 0) - (standing.goalsAgainst || 0);
                }
            });
            
            return [player, { ...data, totalCards, totalYellow, totalRed, totalGD }];
        });
    }
    
    // Sort based on current sort state
    let sortedPlayers;
    if (leaderboardSortState === 'cards') {
        // Sort by total cards first, then by red cards as tiebreaker
        sortedPlayers = playersWithStats.sort((a, b) => {
            const totalA = a[1].totalYellow + a[1].totalRed;
            const totalB = b[1].totalYellow + b[1].totalRed;
            if (totalB !== totalA) return totalB - totalA; // Most total cards first
            return b[1].totalRed - a[1].totalRed; // Tiebreaker: more reds first
        });
    } else if (leaderboardSortState === 'gd') {
        // Sort by GD ascending (lowest/worst at top)
        sortedPlayers = playersWithStats.sort((a, b) => a[1].totalGD - b[1].totalGD);
    } else {
        // Default: sort by points
        sortedPlayers = playersWithStats.sort((a, b) => b[1].points - a[1].points);
    }
    
    sortedPlayers.forEach(([player, data], index) => {
        const row = document.createElement('tr');
        
        // Helper function to get team status and color
        const getTeamStatus = (team) => {
            const standing = teamStandings[team];
            if (!standing) return { status: 'not-played', display: team };
            
            // Check if eliminated (finished group stage and not in top 3)
            if (standing.played >= 3 && standing.position > 3) {
                return { status: 'eliminated', display: '-' };
            }
            
            // Check if not played yet
            if (standing.played === 0) {
                return { status: 'not-played', display: team };
            }
            
            // Find team's most recent match to determine won/lost
            const teamMatches = matches.filter(m =>
                (m.team1 === team || m.team2 === team) &&
                m.finished &&
                m.score1 !== null && m.score2 !== null
            ).sort((a, b) => {
                // Sort by match number descending to get most recent
                return (b.matchNum || 0) - (a.matchNum || 0);
            });
            
            if (teamMatches.length > 0) {
                const lastMatch = teamMatches[0];
                const isTeam1 = lastMatch.team1 === team;
                const teamScore = isTeam1 ? lastMatch.score1 : lastMatch.score2;
                const opponentScore = isTeam1 ? lastMatch.score2 : lastMatch.score1;
                
                if (teamScore > opponentScore) {
                    return { status: 'won', display: team };
                } else if (teamScore < opponentScore) {
                    return { status: 'lost', display: team };
                } else {
                    return { status: 'drawn', display: team };
                }
            }
            
            return { status: 'not-played', display: team };
        };
        
        // Create individual team cells with status-based styling
        const teamCells = data.teams.map(team => {
            const { status, display } = getTeamStatus(team);
            return `<td class="team-status-${status} world-cup-font">${display}</td>`;
        }).join('');
        
        // Pad with empty cells if player has fewer than 4 teams
        const emptyTeamCells = '<td class="team-status-eliminated world-cup-font">-</td>'.repeat(4 - data.teams.length);
        
        const gdDisplay = data.totalGD > 0 ? `+${data.totalGD}` : data.totalGD;
        const cardsDisplay = `${data.totalYellow}|${data.totalRed}`;
        
        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td><strong>${player}</strong></td>
            ${teamCells}${emptyTeamCells}
            <td>${data.played}</td>
            <td>${data.won}</td>
            <td>${data.drawn}</td>
            <td>${data.lost}</td>
            <td>${gdDisplay}</td>
            <td><span class="discipline-cell">${cardsDisplay}</span></td>
            <td><strong>${data.points}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

// Sort leaderboard by different criteria
async function sortLeaderboard(sortType) {
    leaderboardSortState = sortType;
    
    // Update subtitle
    const subtitle = document.getElementById('leaderboardSubtitle');
    if (subtitle) {
        if (sortType === 'points') {
            subtitle.textContent = 'Sorted by Points';
        } else if (sortType === 'cards') {
            subtitle.textContent = 'Sorted by Discipline Score';
        } else if (sortType === 'gd') {
            subtitle.textContent = 'Sorted by Goal Difference';
        }
    }
    
    // Re-render stats to update active state
    await renderLeaderboardStats();
    
    renderLeagueTable();
}

async function renderLeaderboardStats() {
    const stats = await calculateLeaderboardStats();
    const statsContainer = document.getElementById('leaderboardStats');
    if (!statsContainer) return;
    
    // Calculate most points
    const leagueData = calculateLeagueTable();
    let mostPointsOwner = null;
    let mostPoints = 0;
    Object.entries(leagueData).forEach(([player, data]) => {
        if (data.points > mostPoints) {
            mostPoints = data.points;
            mostPointsOwner = player;
        }
    });
    
    let html = '<div class="stats-grid">';
    
    // Most Points - clickable to sort by points (default)
    const pointsActive = leaderboardSortState === 'points' ? ' active' : '';
    html += `<div class="stat-box${pointsActive}" onclick="sortLeaderboard('points')" style="cursor: pointer;" title="Click to sort by points">`;
    html += '<h3>Most Points</h3>';
    if (mostPointsOwner) {
        html += `<div class="stat-value">${mostPoints}</div>`;
        html += `<div class="stat-detail">${mostPointsOwner}</div>`;
    } else {
        html += '<div class="stat-value">-</div>';
        html += '<div class="stat-detail">No matches yet</div>';
    }
    html += '</div>';
    
    // Fastest Goal
    html += '<div class="stat-box">';
    html += '<h3>Fastest Goal</h3>';
    if (stats.fastestGoal.owner && stats.fastestGoal.minute !== Infinity) {
        html += `<div class="stat-value">${stats.fastestGoal.minute}'</div>`;
        html += `<div class="stat-detail">${stats.fastestGoal.owner}</div>`;
        const playerInfo = stats.fastestGoal.player ? `${stats.fastestGoal.player} - ` : '';
        html += `<div class="stat-subdetail">${playerInfo}${stats.fastestGoal.team}</div>`;
    } else {
        html += '<div class="stat-value">-</div>';
        html += '<div class="stat-detail">No goals yet</div>';
    }
    html += '</div>';
    
    // Fastest Card Received
    html += '<div class="stat-box">';
    html += '<h3>Fastest Card Received</h3>';
    if (stats.fastestCard.owner && stats.fastestCard.minute !== Infinity) {
        html += `<div class="stat-value">${stats.fastestCard.minute}'</div>`;
        html += `<div class="stat-detail">${stats.fastestCard.owner}</div>`;
        html += `<div class="stat-subdetail">${stats.fastestCard.player} - ${stats.fastestCard.team}</div>`;
    } else {
        html += '<div class="stat-value">-</div>';
        html += '<div class="stat-detail">No cards yet</div>';
    }
    html += '</div>';
    
    // Most Cards - clickable to sort by cards
    const cardsActive = leaderboardSortState === 'cards' ? ' active' : '';
    html += `<div class="stat-box${cardsActive}" onclick="sortLeaderboard('cards')" style="cursor: pointer;" title="Click to sort by cards">`;
    html += '<h3>Most Cards (Group)</h3>';
    if (stats.mostCards.owner) {
        html += `<div class="stat-value">${stats.mostCards.total}</div>`;
        html += `<div class="stat-detail">${stats.mostCards.owner}</div>`;
        html += `<div class="stat-subdetail">${stats.mostCards.yellow}Y, ${stats.mostCards.red}R (${stats.mostCards.straightRed} straight)</div>`;
    } else {
        html += '<div class="stat-value">-</div>';
        html += '<div class="stat-detail">No cards yet</div>';
    }
    html += '</div>';
    
    // Worst Goal Difference - clickable to sort by GD
    const gdActive = leaderboardSortState === 'gd' ? ' active' : '';
    html += `<div class="stat-box${gdActive}" onclick="sortLeaderboard('gd')" style="cursor: pointer;" title="Click to sort by goal difference">`;
    html += '<h3>Worst Goal Difference</h3>';
    if (stats.worstGD.owner && stats.worstGD.gd !== Infinity) {
        html += `<div class="stat-value">${stats.worstGD.gd > 0 ? '+' : ''}${stats.worstGD.gd}</div>`;
        html += `<div class="stat-detail">${stats.worstGD.owner}</div>`;
    } else {
        html += '<div class="stat-value">-</div>';
        html += '<div class="stat-detail">No matches yet</div>';
    }
    html += '</div>';
    
    html += '</div>';
    statsContainer.innerHTML = html;
}

// Get qualified teams from groups
function getQualifiedTeams() {
    const qualified = {
        winners: {},
        runnersUp: {},
        thirdPlace: []
    };
    
    // Get top 2 from each group
    Object.keys(groups).forEach(groupName => {
        const groupTeams = groups[groupName].map(team => ({
            team: team,
            owner: findOwner(team),
            group: groupName,
            ...teamStandings[team]
        }));
        
        // Sort teams by points, goal difference, goals scored
        groupTeams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const gdA = a.goalsFor - a.goalsAgainst;
            const gdB = b.goalsFor - b.goalsAgainst;
            if (gdB !== gdA) return gdB - gdA;
            return b.goalsFor - a.goalsFor;
        });
        
        qualified.winners[groupName] = groupTeams[0];
        qualified.runnersUp[groupName] = groupTeams[1];
        if (groupTeams[2]) {
            qualified.thirdPlace.push(groupTeams[2]);
        }
    });
    
    // Sort third place teams using FIFA rules and take top 8
    qualified.thirdPlace.sort((a, b) => thirdPlaceTieBreaker(a, b));
    qualified.bestThirds = qualified.thirdPlace.slice(0, 8);
    
    return qualified;
}

// Allocate third place teams to matches based on FIFA rules
function allocateThirdPlaceTeams(bestThirds) {
    const allocation = {};
    
    // Create a map of third place teams by group
    const thirdByGroup = {};
    bestThirds.forEach(team => {
        thirdByGroup[team.group] = team;
    });
    
    // Get which groups have qualifying third-place teams
    const qualifyingGroups = bestThirds.map(t => t.group).sort();
    
    // FIFA allocation rules with priority order for each match
    // Priority is left to right - pick first available team
    const matchPriorities = {
        74: ['A', 'B', 'C', 'D', 'F'],  // Match 74: E winners vs 3rd from A/B/C/D/F
        77: ['C', 'D', 'F', 'G', 'H'],  // Match 77: I winners vs 3rd from C/D/F/G/H
        79: ['C', 'E', 'F', 'H', 'I'],  // Match 79: A winners vs 3rd from C/E/F/H/I
        80: ['E', 'H', 'I', 'J', 'K'],  // Match 80: L winners vs 3rd from E/H/I/J/K
        81: ['B', 'E', 'F', 'I', 'J'],  // Match 81: D winners vs 3rd from B/E/F/I/J
        82: ['A', 'E', 'H', 'I', 'J'],  // Match 82: G winners vs 3rd from A/E/H/I/J
        85: ['E', 'F', 'G', 'I', 'J'],  // Match 85: B winners vs 3rd from E/F/G/I/J
        87: ['D', 'E', 'I', 'J', 'L']   // Match 87: K winners vs 3rd from D/E/I/J/L
    };
    
    // Track which teams have been allocated
    const allocated = new Set();
    
    // Allocate teams to matches following priority order
    for (const [matchNum, priorities] of Object.entries(matchPriorities)) {
        for (const group of priorities) {
            if (thirdByGroup[group] && !allocated.has(group)) {
                allocation[matchNum] = thirdByGroup[group];
                allocated.add(group);
                break;
            }
        }
    }
    
    return allocation;
}

// Array of accent colors for knockout matches (same as groups)
const accentColors = [
    '#00CED1', '#9370DB', '#ADFF2F', '#FF4500', '#1E90FF', '#FF1493',
    '#FFD700', '#00FF7F', '#FF6347', '#BA55D3', '#00BFFF', '#FF69B4'
];

// Get knockout match data from loaded matches
function getKnockoutMatchData() {
    const knockoutData = {};
    
    // Process all knockout matches from the API
    matches.forEach(match => {
        if (match.type !== 'group' && match.matchNum) {
            const matchNum = match.matchNum;
            
            // Check if match is actually live (kickoff to 2 hours after)
            let isActuallyLive = false;
            if (match.isLive && match.date) {
                try {
                    const [datePart, timePart] = match.date.split(' ');
                    const [month, day, year] = datePart.split('/');
                    const [hours, minutes] = timePart.split(':');
                    
                    const kickoffTime = new Date(year, month - 1, day, hours, minutes);
                    const now = new Date();
                    const timeSinceKickoff = now - kickoffTime;
                    const twoHours = 2 * 60 * 60 * 1000;
                    
                    isActuallyLive = timeSinceKickoff >= 0 && timeSinceKickoff <= twoHours;
                } catch (e) {
                    console.warn('Could not parse knockout match date:', match.date);
                }
            }
            
            knockoutData[matchNum] = {
                score1: match.score1,
                score2: match.score2,
                isLive: isActuallyLive,
                isCompleted: match.finished,
                // TODO: Add penalty data when available from API
                penalties1: null,
                penalties2: null
            };
        }
    });
    
    return knockoutData;
}

// Get current knockout match data (will be refreshed when data loads)
let knockoutMatchData = {};

// Check if entire round is complete
function isRoundComplete(roundId, matches) {
    if (roundId === 'round32') {
        // Check if all round32 matches (73-88) are completed
        const round32MatchNums = matches.map(m => m.matchNum).filter(n => n);
        return round32MatchNums.length > 0 && round32MatchNums.every(matchNum =>
            knockoutMatchData[matchNum]?.isCompleted === true
        );
    }
    // For other rounds, check if all matches have scores (indicating completion)
    return matches.every(match => {
        if (!match.matchNum) return false;
        return knockoutMatchData[match.matchNum]?.isCompleted === true;
    });
}

// Determine which round is upcoming (first round with incomplete matches)
function getUpcomingRound(allRounds) {
    const roundIds = ['round32', 'round16', 'quarters', 'semis', 'final'];
    
    for (const roundId of roundIds) {
        const roundData = allRounds[roundId];
        if (roundData && !roundData.isComplete) {
            return roundId;
        }
    }
    
    return null; // All rounds complete
}

// Render knockout bracket with official FIFA 2026 World Cup format
function renderKnockoutBracket() {
    const qualified = getQualifiedTeams();
    
    // Allocate the 8 best third-place teams to their matches
    const thirdPlaceAllocation = allocateThirdPlaceTeams(qualified.bestThirds);
    
    // Helper to get third place team or placeholder
    const getThirdPlace = (matchNum, possibleGroups) => {
        return thirdPlaceAllocation[matchNum] || {
            team: `3rd ${possibleGroups}`,
            owner: 'TBD',
            group: possibleGroups
        };
    };
    
    // Round of 32 matchups - Official FIFA bracket structure
    const round32Matches = [
        // Match 73
        { team1: qualified.runnersUp['A'], team2: qualified.runnersUp['B'], matchNum: 73 },
        // Match 74
        { team1: qualified.winners['E'], team2: getThirdPlace(74, 'A/B/C/D/F'), matchNum: 74 },
        // Match 75
        { team1: qualified.winners['F'], team2: qualified.runnersUp['C'], matchNum: 75 },
        // Match 76
        { team1: qualified.winners['C'], team2: qualified.runnersUp['F'], matchNum: 76 },
        // Match 77
        { team1: qualified.winners['I'], team2: getThirdPlace(77, 'C/D/F/G/H'), matchNum: 77 },
        // Match 78
        { team1: qualified.runnersUp['E'], team2: qualified.runnersUp['I'], matchNum: 78 },
        // Match 79
        { team1: qualified.winners['A'], team2: getThirdPlace(79, 'C/E/F/H/I'), matchNum: 79 },
        // Match 80
        { team1: qualified.winners['L'], team2: getThirdPlace(80, 'E/H/I/J/K'), matchNum: 80 },
        // Match 81
        { team1: qualified.winners['D'], team2: getThirdPlace(81, 'B/E/F/I/J'), matchNum: 81 },
        // Match 82
        { team1: qualified.winners['G'], team2: getThirdPlace(82, 'A/E/H/I/J'), matchNum: 82 },
        // Match 83
        { team1: qualified.runnersUp['K'], team2: qualified.runnersUp['L'], matchNum: 83 },
        // Match 84
        { team1: qualified.winners['H'], team2: qualified.runnersUp['J'], matchNum: 84 },
        // Match 85
        { team1: qualified.winners['B'], team2: getThirdPlace(85, 'E/F/G/I/J'), matchNum: 85 },
        // Match 86
        { team1: qualified.winners['J'], team2: qualified.runnersUp['H'], matchNum: 86 },
        // Match 87
        { team1: qualified.winners['K'], team2: getThirdPlace(87, 'D/E/I/J/L'), matchNum: 87 },
        // Match 88
        { team1: qualified.runnersUp['D'], team2: qualified.runnersUp['G'], matchNum: 88 }
    ];
    
    // Calculate subsequent rounds based on previous round results
    const round16Matches = calculateNextRoundMatches(round32Matches, 89);
    const quartersMatches = calculateNextRoundMatches(round16Matches, 97);
    const semisMatches = calculateNextRoundMatches(quartersMatches, 101);
    const finalMatches = calculateNextRoundMatches(semisMatches, 103);
    
    const allRounds = {
        round32: { matches: round32Matches, isComplete: isRoundComplete('round32', round32Matches) },
        round16: { matches: round16Matches, isComplete: isRoundComplete('round16', round16Matches) },
        quarters: { matches: quartersMatches, isComplete: isRoundComplete('quarters', quartersMatches) },
        semis: { matches: semisMatches, isComplete: isRoundComplete('semis', semisMatches) },
        final: { matches: finalMatches, isComplete: isRoundComplete('final', finalMatches) }
    };
    
    const upcomingRound = getUpcomingRound(allRounds);
    
    renderRound('round32', round32Matches, upcomingRound === 'round32', allRounds.round32.isComplete, round16Matches);
    renderRound('round16', round16Matches, upcomingRound === 'round16', allRounds.round16.isComplete, quartersMatches);
    renderRound('quarters', quartersMatches, upcomingRound === 'quarters', allRounds.quarters.isComplete, semisMatches);
    renderRound('semis', semisMatches, upcomingRound === 'semis', allRounds.semis.isComplete, finalMatches);
    renderRound('final', finalMatches, upcomingRound === 'final', allRounds.final.isComplete, []);
}

function renderRound(roundId, matches, isUpcoming = false, isComplete = false, nextRoundMatches = []) {
    const container = document.getElementById(roundId);
    const roundDiv = container.parentElement;
    container.innerHTML = '';
    
    // Add or remove round status classes
    roundDiv.classList.remove('upcoming-round', 'completed-round');
    if (isComplete) {
        roundDiv.classList.add('completed-round');
    } else if (isUpcoming) {
        roundDiv.classList.add('upcoming-round');
    }
    
    matches.forEach((match, index) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        
        const team1 = match.team1 ? match.team1.team : 'TBD';
        const team2 = match.team2 ? match.team2.team : 'TBD';
        const owner1 = match.team1 ? match.team1.owner : '-';
        const owner2 = match.team2 ? match.team2.owner : '-';
        
        // Check if match is undetermined (both teams TBD)
        const isTBD = team1 === 'TBD' && team2 === 'TBD';
        
        // Get match data if available
        const matchData = match.matchNum ? knockoutMatchData[match.matchNum] : null;
        const score1 = matchData && matchData.score1 !== null ? matchData.score1 : '';
        const score2 = matchData && matchData.score2 !== null ? matchData.score2 : '';
        const penalties1 = matchData ? matchData.penalties1 : null;
        const penalties2 = matchData ? matchData.penalties2 : null;
        const isLive = matchData ? matchData.isLive : false;
        const matchIsCompleted = matchData ? matchData.isCompleted : false;
        
        // Determine which team is eliminated (lost the match)
        let team1Eliminated = false;
        let team2Eliminated = false;
        
        if (matchIsCompleted && score1 !== '' && score2 !== '') {
            if (penalties1 !== null && penalties1 !== undefined && penalties2 !== null && penalties2 !== undefined) {
                // Decided by penalties
                team1Eliminated = penalties1 < penalties2;
                team2Eliminated = penalties2 < penalties1;
            } else {
                // Decided in regular/extra time
                team1Eliminated = score1 < score2;
                team2Eliminated = score2 < score1;
            }
        }
        
        // Check if this match's winner has progressed to next round
        let hasProgressed = false;
        if (matchIsCompleted && nextRoundMatches && nextRoundMatches.length > 0) {
            // Check if either team from this match appears in the next round
            const matchWinner = team1Eliminated ? team2 : (team2Eliminated ? team1 : null);
            if (matchWinner) {
                hasProgressed = nextRoundMatches.some(nextMatch =>
                    (nextMatch.team1 && nextMatch.team1.team === matchWinner) ||
                    (nextMatch.team2 && nextMatch.team2.team === matchWinner)
                );
            }
        }
        
        // Select a random accent color for this match
        const accentColor = accentColors[Math.floor(Math.random() * accentColors.length)];
        
        // Apply appropriate styling (don't apply to individual matches if round is complete)
        if (!isComplete) {
            if (hasProgressed) {
                matchDiv.classList.add('progressed-match');
            } else if (isTBD) {
                matchDiv.classList.add('tbd-match');
            } else if (isLive) {
                matchDiv.classList.add('live-match');
            } else {
                // Apply random accent color border
                matchDiv.style.borderColor = accentColor;
            }
        }
        
        // Build score display with penalties if applicable (only show penalties if they exist)
        let score1Display = '-';
        let score2Display = '-';
        
        if (score1 !== '') {
            if (penalties1 !== null && penalties1 !== undefined) {
                score1Display = `${score1} <span class="penalty-score">(${penalties1})</span>`;
            } else {
                score1Display = score1;
            }
        }
        
        if (score2 !== '') {
            if (penalties2 !== null && penalties2 !== undefined) {
                score2Display = `${score2} <span class="penalty-score">(${penalties2})</span>`;
            } else {
                score2Display = score2;
            }
        }
        
        matchDiv.innerHTML = `
            <div class="match-team ${team1Eliminated ? 'eliminated' : ''}">
                <div class="team-info">
                    <span class="team-name">${team1}</span>
                    <span class="team-owner">${owner1}</span>
                </div>
                <span class="team-score">${score1Display}</span>
            </div>
            <div class="match-team ${team2Eliminated ? 'eliminated' : ''}">
                <div class="team-info">
                    <span class="team-name">${team2}</span>
                    <span class="team-owner">${owner2}</span>
                </div>
                <span class="team-score">${score2Display}</span>
            </div>
        `;
        container.appendChild(matchDiv);
    });
}

// Calculate next round matches from previous round winners
function calculateNextRoundMatches(previousRoundMatches, startingMatchNum) {
    const nextRound = [];
    
    // Pair winners from previous round
    // Matches are paired: (match1 winner vs match2 winner), (match3 winner vs match4 winner), etc.
    for (let i = 0; i < previousRoundMatches.length; i += 2) {
        const match1 = previousRoundMatches[i];
        const match2 = previousRoundMatches[i + 1];
        
        let winner1 = null;
        let winner2 = null;
        
        // Determine winner of match1
        if (match1 && match1.matchNum && knockoutMatchData[match1.matchNum]) {
            const data = knockoutMatchData[match1.matchNum];
            if (data.isCompleted && data.score1 !== undefined && data.score2 !== undefined) {
                // Check if decided by penalties
                if (data.penalties1 !== null && data.penalties1 !== undefined &&
                    data.penalties2 !== null && data.penalties2 !== undefined) {
                    winner1 = data.penalties1 > data.penalties2 ? match1.team1 : match1.team2;
                } else {
                    // Decided in regular/extra time
                    if (data.score1 > data.score2) {
                        winner1 = match1.team1;
                    } else if (data.score2 > data.score1) {
                        winner1 = match1.team2;
                    }
                }
            }
        }
        
        // Determine winner of match2
        if (match2 && match2.matchNum && knockoutMatchData[match2.matchNum]) {
            const data = knockoutMatchData[match2.matchNum];
            if (data.isCompleted && data.score1 !== undefined && data.score2 !== undefined) {
                // Check if decided by penalties
                if (data.penalties1 !== null && data.penalties1 !== undefined &&
                    data.penalties2 !== null && data.penalties2 !== undefined) {
                    winner2 = data.penalties1 > data.penalties2 ? match2.team1 : match2.team2;
                } else {
                    // Decided in regular/extra time
                    if (data.score1 > data.score2) {
                        winner2 = match2.team1;
                    } else if (data.score2 > data.score1) {
                        winner2 = match2.team2;
                    }
                }
            }
        }
        
        nextRound.push({
            team1: winner1,
            team2: winner2,
            matchNum: startingMatchNum + Math.floor(i / 2)
        });
    }
    
    return nextRound;
}

// Render fixtures (placeholder for future implementation)
function renderFixtures() {
    const fixturesContainer = document.getElementById('fixturesContainer');
    if (!fixturesContainer) return;
    
    // Get current selected player from search (if search element exists)
    const playerSearchElement = document.getElementById('playerSearch');
    const selectedPlayer = playerSearchElement ? playerSearchElement.value.trim() : '';
    
    // Filter matches to only group stage games
    const groupStageMatches = matches.filter(m => m.type === 'group');
    
    if (groupStageMatches.length === 0) {
        fixturesContainer.innerHTML = '<p>No fixtures available yet.</p>';
        return;
    }
    
    // Sort matches chronologically by date
    const sortedMatches = [...groupStageMatches].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });
    
    // Determine matchday based on match number (1-24 = MD1, 25-48 = MD2, 49-72 = MD3)
    const getMatchday = (matchNum) => {
        if (matchNum <= 24) return 1;
        if (matchNum <= 48) return 2;
        return 3;
    };
    
    // Group matches by actual calendar day
    const matchesByDay = {};
    sortedMatches.forEach(match => {
        const matchDate = new Date(match.date);
        const dateKey = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!matchesByDay[dateKey]) {
            matchesByDay[dateKey] = [];
        }
        matchesByDay[dateKey].push(match);
    });
    
    // Build HTML
    let html = '';
    let mostRecentFinishedMatch = null;
    
    // Sort days chronologically
    const sortedDays = Object.keys(matchesByDay).sort();
    
    // Define accent colors array
    const accentColors = ['cyan', 'purple', 'lime', 'orange', 'blue', 'pink', 'gold', 'green', 'tomato', 'orchid', 'sky', 'hotpink'];
    
    sortedDays.forEach(dateKey => {
        const dayMatches = matchesByDay[dateKey];
        
        // Pick one random accent color for this entire day
        const dayAccent = accentColors[Math.floor(Math.random() * accentColors.length)];
        
        // Filter matches if a player is selected
        let filteredMatches = dayMatches;
        if (selectedPlayer && players[selectedPlayer]) {
            const playerTeams = players[selectedPlayer].teams;
            filteredMatches = dayMatches.filter(m =>
                playerTeams.includes(m.team1) || playerTeams.includes(m.team2)
            );
        }
        
        // Skip this day if no matches after filtering
        if (filteredMatches.length === 0) return;
        
        // Format the date header
        const headerDate = new Date(dateKey + 'T12:00:00');
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const dayName = dayNames[headerDate.getDay()];
        const day = headerDate.getDate();
        const month = monthNames[headerDate.getMonth()];
        const year = headerDate.getFullYear();
        
        // Check if this day has any unfinished matches
        const hasUnfinishedMatches = filteredMatches.some(m => !m.finished);
        const dayColor = hasUnfinishedMatches ? dayAccent : 'grey';
        
        html += `<div class="matchday-section" data-accent="${dayColor}">`;
        html += `<h3 class="matchday-header">${dayName}, ${month} ${day}, ${year}</h3>`;
        html += `<div class="fixtures-list">`;
        
        filteredMatches.forEach(match => {
            const homeOwner = findOwner(match.team1);
            const awayOwner = findOwner(match.team2);
            const matchDate = new Date(match.date);
            
            // Format: "HH:MM DDD DD/MM" (time first, 3-letter day, DD/MM)
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[matchDate.getDay()];
            const day = String(matchDate.getDate()).padStart(2, '0');
            const month = String(matchDate.getMonth() + 1).padStart(2, '0');
            const hours = String(matchDate.getHours()).padStart(2, '0');
            const minutes = String(matchDate.getMinutes()).padStart(2, '0');
            const dateStr = `${hours}:${minutes} ${dayName} ${day}/${month}`;
            
            const isFinished = match.finished;
            const isLive = match.isLive;
            const stadium = getStadiumName(match.stadium);
            
            // Track most recent finished match for auto-scroll
            const now = new Date();
            if (isFinished && (!mostRecentFinishedMatch || matchDate > new Date(mostRecentFinishedMatch.date))) {
                mostRecentFinishedMatch = match;
            }
            const isNext = !isFinished && !isLive && matchDate > now;
            const scrollId = (isLive || isNext) ? 'id="next-match"' : (mostRecentFinishedMatch && match.matchNum === mostRecentFinishedMatch.matchNum) ? 'id="recent-match"' : '';
            
            // Use grey for finished matches, day color for upcoming/live matches
            const fixtureColor = isFinished ? 'grey' : dayColor;
            html += `<div class="fixture-item ${isFinished ? 'finished' : ''} ${isLive ? 'live' : ''}" ${scrollId} data-home="${match.team1}" data-away="${match.team2}" data-accent="${fixtureColor}" onclick="toggleBoxScore(this)">`;
            html += `<div class="fixture-date">${dateStr}</div>`;
            html += `<div class="fixture-match">`;
            html += `<div class="fixture-team">`;
            html += `<span class="team-code">${match.team1}</span>`;
            html += `<span class="team-owner">${homeOwner}</span>`;
            html += `</div>`;
            html += `<div class="fixture-score">`;
            if (isFinished || isLive) {
                html += `<span class="score">${match.score1} - ${match.score2}</span>`;
                if (isLive) html += `<span class="live-badge">LIVE</span>`;
            } else {
                html += `<span class="vs">vs</span>`;
            }
            html += `</div>`;
            html += `<div class="fixture-team">`;
            html += `<span class="team-code">${match.team2}</span>`;
            html += `<span class="team-owner">${awayOwner}</span>`;
            html += `</div>`;
            html += `</div>`;
            html += `<div class="fixture-venue">`;
            html += `<div class="fixture-stadium">${stadium}</div>`;
            html += `<div class="fixture-group">Group ${match.group}</div>`;
            html += `</div>`;
            
            // Add box score for finished matches
            if (isFinished) {
                html += `<div class="box-score" style="display: none;">`;
                html += `<div class="box-score-content">`;
                
                // Score summary
                html += `<div class="score-summary">`;
                html += `<div class="score-team">`;
                html += `<span class="score-team-name">${match.team1}</span>`;
                html += `<span class="score-team-score">${match.score1}</span>`;
                html += `</div>`;
                html += `<div class="score-divider">-</div>`;
                html += `<div class="score-team">`;
                html += `<span class="score-team-score">${match.score2}</span>`;
                html += `<span class="score-team-name">${match.team2}</span>`;
                html += `</div>`;
                html += `</div>`;
                
                // Helper function to create stat row with simple bars
                const createStatRow = (label, val1, val2) => {
                    const total = val1 + val2;
                    const percent1 = total > 0 ? (val1 / total) * 100 : 50;
                    const percent2 = total > 0 ? (val2 / total) * 100 : 50;
                    
                    return `
                        <div class="stat-row">
                            <span class="stat-label">${label}</span>
                            <div class="stat-bars">
                                <div class="stat-bar-left">
                                    <span class="stat-number">${val1}</span>
                                    <div class="stat-bar-fill" style="width: ${percent1}%;"></div>
                                </div>
                                <div class="stat-bar-right">
                                    <div class="stat-bar-fill" style="width: ${percent2}%;"></div>
                                    <span class="stat-number">${val2}</span>
                                </div>
                            </div>
                        </div>
                    `;
                };
                
                // Match statistics
                html += `<div class="match-stats">`;
                
                // Generate random stats
                const possession1 = Math.floor(Math.random() * 20 + 40);
                const possession2 = 100 - possession1;
                const shots1 = Math.floor(Math.random() * 10 + 5);
                const shots2 = Math.floor(Math.random() * 10 + 5);
                const shotsOnTarget1 = Math.floor(Math.random() * 5 + 2);
                const shotsOnTarget2 = Math.floor(Math.random() * 5 + 2);
                const corners1 = Math.floor(Math.random() * 8 + 2);
                const corners2 = Math.floor(Math.random() * 8 + 2);
                const fouls1 = Math.floor(Math.random() * 10 + 5);
                const fouls2 = Math.floor(Math.random() * 10 + 5);
                
                html += createStatRow('Possession', possession1, possession2);
                html += createStatRow('Shots', shots1, shots2);
                html += createStatRow('Shots on Target', shotsOnTarget1, shotsOnTarget2);
                html += createStatRow('Corners', corners1, corners2);
                html += createStatRow('Fouls', fouls1, fouls2);
                
                // Yellow cards
                const homeYellows = teamStandings[match.team1]?.yellowCards || 0;
                const awayYellows = teamStandings[match.team2]?.yellowCards || 0;
                if (homeYellows > 0 || awayYellows > 0) {
                    html += createStatRow('Yellow Cards', homeYellows, awayYellows);
                }
                
                // Red cards
                const homeReds = teamStandings[match.team1]?.redCards || 0;
                const awayReds = teamStandings[match.team2]?.redCards || 0;
                if (homeReds > 0 || awayReds > 0) {
                    html += createStatRow('Red Cards', homeReds, awayReds);
                }
                
                html += `</div>`; // match-stats
                html += `</div>`; // box-score-content
                html += `</div>`; // box-score
            }
            html += `</div>`;
        });
        
        html += `</div></div>`;
    });
    
    if (html === '') {
        html = '<p>No fixtures found for the selected player.</p>';
    }
    
    fixturesContainer.innerHTML = html;
    
    // Auto-scroll to most recent finished match, or next/live match if no finished matches
    setTimeout(() => {
        const recentMatch = document.getElementById('recent-match');
        const nextMatch = document.getElementById('next-match');
        const targetMatch = recentMatch || nextMatch;
        if (targetMatch) {
            targetMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// Toggle box score display when clicking on a fixture
function toggleBoxScore(element) {
    const boxScore = element.querySelector('.box-score');
    
    if (boxScore) {
        const isVisible = boxScore.style.display !== 'none';
        boxScore.style.display = isVisible ? 'none' : 'block';
    }
}

// Manual refresh function
async function manualRefresh() {
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Refreshing...';
    
    try {
        const newApiData = await loadAllAPIData();
        if (newApiData && newApiData.groups) {
            matches = newApiData.matches || [];
            liveGroups = newApiData.groups || {};
            
            // Update teamStandings
            teamStandings = {};
            for (const [groupName, teams] of Object.entries(newApiData.groups)) {
                teams.forEach(team => {
                    teamStandings[team.team] = {
                        team: team.team,
                        played: team.played,
                        won: team.won,
                        drawn: team.drawn,
                        lost: team.lost,
                        goalsFor: team.goalsFor,
                        goalsAgainst: team.goalsAgainst,
                        points: team.points,
                        yellowCards: team.yellowCards || 0,
                        redCards: team.redCards || 0
                    };
                });
            }
            
            knockoutMatchData = getKnockoutMatchData();
            renderGroups();
            renderLeagueTable();
            await renderLeaderboardStats();
            renderThirdPlaceTeams();
            renderKnockoutBracket();
            renderFixtures();
            
            // Update last updated time
            const now = new Date().toLocaleString('en-IE', {
                timeZone: 'Europe/Dublin',
                dateStyle: 'short',
                timeStyle: 'short'
            });
            document.getElementById('lastUpdated').innerHTML = `
                <strong>Data refreshed from API</strong><br>
                <span style="font-size: 11px; opacity: 0.8;">${now}</span>
            `;
            
            console.log('🔄 Manual refresh completed at', new Date().toLocaleTimeString());
        } else {
            alert('Failed to refresh data from API. Please try again.');
        }
    } catch (error) {
        console.error('Error during manual refresh:', error);
        alert('Error refreshing data. Please try again.');
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Load version info and API data in parallel
    const [versionInfo, apiData] = await Promise.all([
        loadVersionInfo(),
        loadAllAPIData()
    ]);
    
    // Display version info
    if (versionInfo) {
        const date = new Date(versionInfo.date);
        const timeStr = date.toLocaleString('en-IE', {
            timeZone: 'Europe/Dublin',
            dateStyle: 'short',
            timeStyle: 'short'
        });
        document.getElementById('lastUpdated').innerHTML = `
            <strong>Latest Update:</strong> ${versionInfo.message}<br>
            <span style="font-size: 11px; opacity: 0.8;">Commit ${versionInfo.commit} • ${timeStr}</span>
        `;
    } else {
        // Show last data update from API
        const now = new Date().toLocaleString('en-IE', {
            timeZone: 'Europe/Dublin',
            dateStyle: 'short',
            timeStyle: 'short'
        });
        document.getElementById('lastUpdated').innerHTML = `
            <strong>Data loaded from API</strong><br>
            <span style="font-size: 11px; opacity: 0.8;">${now}</span>
        `;
    }
    
    // Use API data
    if (apiData && apiData.groups) {
        // Use group standings from API
        liveGroups = apiData.groups;
        matches = apiData.matches || [];
        console.log('✅ Loaded group standings from API');
        
        cardData = await loadCardData();

        // Convert API format to teamStandings format and merge scraped card totals
        teamStandings = {};
        for (const [groupName, teams] of Object.entries(apiData.groups)) {
            teams.forEach(team => {
                const teamCards = cardData[team.team] || { yellow: 0, red: 0 };
                const totalCards = teamCards.yellow + teamCards.red;
                teamStandings[team.team] = {
                    team: team.team,
                    played: team.played,
                    won: team.won,
                    drawn: team.drawn,
                    lost: team.lost,
                    goalsFor: team.goalsFor,
                    goalsAgainst: team.goalsAgainst,
                    points: team.points,
                    yellowCards: teamCards.yellow,
                    redCards: teamCards.red,
                    conductScore: -totalCards  // Fewer cards = higher score
                };
            });
        }
        console.log('📊 Loaded standings for', Object.keys(teamStandings).length, 'teams from API');
    } else {
        console.error('❌ Failed to load API data');
        document.getElementById('lastUpdated').innerHTML = `
            <strong style="color: #ff4444;">Error loading data from API</strong><br>
            <span style="font-size: 11px; opacity: 0.8;">Please refresh the page</span>
        `;
        return;
    }
    
    // Refresh knockout match data from loaded matches
    knockoutMatchData = getKnockoutMatchData();
    
    // Render all components
    renderGroups();
    renderLeagueTable();
    await renderLeaderboardStats();
    renderThirdPlaceTeams();
    renderKnockoutBracket();
    renderFixtures();
    
    // Auto-refresh every 2 minutes (API data updates frequently)
    setInterval(async () => {
        const newApiData = await loadAllAPIData();
        if (newApiData && newApiData.groups) {
            matches = newApiData.matches || [];
            liveGroups = newApiData.groups || {};
            cardData = await loadCardData();
            
            // Update teamStandings with scraped card totals
            teamStandings = {};
            for (const [groupName, teams] of Object.entries(newApiData.groups)) {
                teams.forEach(team => {
                    const teamCards = cardData[team.team] || { yellow: 0, red: 0 };
                    const totalCards = teamCards.yellow + teamCards.red;
                    teamStandings[team.team] = {
                        team: team.team,
                        played: team.played,
                        won: team.won,
                        drawn: team.drawn,
                        lost: team.lost,
                        goalsFor: team.goalsFor,
                        goalsAgainst: team.goalsAgainst,
                        points: team.points,
                        yellowCards: teamCards.yellow,
                        redCards: teamCards.red,
                        conductScore: -totalCards  // Fewer cards = higher score
                    };
                });
            }
            
            knockoutMatchData = getKnockoutMatchData(); // Refresh knockout data
            renderGroups();
            renderLeagueTable();
            await renderLeaderboardStats();
            renderThirdPlaceTeams();
            renderKnockoutBracket();
            renderFixtures();
            console.log('🔄 Auto-refreshed from API at', new Date().toLocaleTimeString());
        }
    }, 2 * 60 * 1000); // 2 minutes
});

// Made with Bob
