// Load version info from version.json
async function loadVersionInfo() {
    try {
        const response = await fetch('version.json');
        if (!response.ok) {
            return null;
        }
        const version = await response.json();
        console.log('✅ Version loaded:', version.commit, '-', version.message);
        return version;
    } catch (error) {
        console.warn('Could not load version info:', error);
        return null;
    }
}

// Load live World Cup data from JSON file
async function loadLiveData() {
    try {
        const response = await fetch('data/worldcup-data.json');
        if (!response.ok) {
            console.warn('Live data not available, using static data');
            return null;
        }
        
        const data = await response.json();
        console.log('✅ Live data loaded:', data.lastUpdated);
        console.log(`📊 ${data.matches.length} matches, ${Object.keys(data.groups).length} groups`);
        
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
            
            const parts = line.split(',');
            if (parts.length < 5) continue;
            
            const team = parts[2];
            const cardType = parts[4];
            
            if (!cardData[team]) {
                cardData[team] = { yellow: 0, red: 0 };
            }
            
            if (cardType === 'Yellow') {
                cardData[team].yellow++;
            } else if (cardType === 'Red' || cardType === 'Yellow-red') {
                cardData[team].red++;
            }
        }
        
        console.log('✅ Card data loaded for', Object.keys(cardData).length, 'teams');
        return cardData;
    } catch (error) {
        console.warn('Could not load card data:', error);
        return {};
    }
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
            const cards = cardData[team] || { yellow: 0, red: 0 };
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
                conductScore: 0  // Will be calculated: higher is better
            };
        });
    });
    
    // Process finished group stage matches
    matches.forEach(match => {
        if (match.round === 'group' && match.status === 'FT' &&
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
    
    // Calculate conduct scores (higher is better, so negative points for cards)
    // Yellow card = -1 point, Red card = -3 points
    Object.keys(standings).forEach(team => {
        standings[team].conductScore = -(standings[team].yellowCards + (standings[team].redCards * 3));
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
            m.round === 'group' && m.status === 'FT' &&
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
    if (b.conductScore !== a.conductScore) return b.conductScore - a.conductScore;
    
    // Step 3: FIFA ranking (we'll use alphabetical as proxy since we don't have real rankings)
    return a.team.localeCompare(b.team);
}

// Statistics data
let statistics = {
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
    }
}

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
            if (match.round !== 'group' || match.status !== 'LIVE') return false;
            
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
        
        // Sort teams using FIFA tie-breaking rules
        groupData.teams.sort((a, b) => fifaTieBreaker(a, b, groupData.teams));
        
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
                        <th title="Yellow Cards">YC</th>
                        <th title="Red Cards">RC</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        groupData.teams.forEach((teamData, index) => {
            const goalDiff = teamData.goalsFor - teamData.goalsAgainst;
            const gdDisplay = goalDiff > 0 ? `+${goalDiff}` : goalDiff;
            
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
                    <td>${teamData.yellowCards || 0}</td>
                    <td>${teamData.redCards || 0}</td>
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
    const thirdPlaceTeams = [];
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
    
    thirdPlaceTeams.forEach((teamData, index) => {
        const goalDiff = teamData.goalsFor - teamData.goalsAgainst;
        const gdDisplay = goalDiff > 0 ? `+${goalDiff}` : goalDiff;
        
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
            <td>${teamData.yellowCards}</td>
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
function renderLeagueTable() {
    const leagueData = calculateLeagueTable();
    const tbody = document.getElementById('leagueTableBody');
    tbody.innerHTML = '';
    
    // Sort by points
    const sortedPlayers = Object.entries(leagueData).sort((a, b) => b[1].points - a[1].points);
    
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
                m.status === 'FT' &&
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
        
        row.innerHTML = `
            <td><strong>${index + 1}</strong></td>
            <td><strong>${player}</strong></td>
            ${teamCells}${emptyTeamCells}
            <td>${data.played}</td>
            <td>${data.won}</td>
            <td>${data.drawn}</td>
            <td>${data.lost}</td>
            <td><strong>${data.points}</strong></td>
        `;
        tbody.appendChild(row);
    });
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
        if (match.round !== 'group' && match.matchNum) {
            const matchNum = match.matchNum;
            
            // Check if match is actually live (kickoff to 2 hours after)
            let isActuallyLive = false;
            if (match.status === 'LIVE' && match.date) {
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
                isCompleted: match.status === 'FT',
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
        const score1 = matchData ? matchData.score1 : '';
        const score2 = matchData ? matchData.score2 : '';
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
    // Fixtures will be populated when match data is available
    const fixturesContainer = document.getElementById('fixturesContainer');
    if (fixturesContainer) {
        fixturesContainer.innerHTML = '<p>Fixtures will be displayed here when available.</p>';
    }
}

// Manual refresh function
function manualRefresh() {
    renderGroups();
    renderLeagueTable();
    renderThirdPlaceTeams();
    alert('Data refreshed!');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Load version info, card data and live data in parallel
    const [versionInfo, liveData, cards] = await Promise.all([
        loadVersionInfo(),
        loadLiveData(),
        loadCardData()
    ]);
    
    // Store card data globally
    cardData = cards;
    
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
    }
    
    // Use live data if available
    if (liveData) {
        matches = liveData.matches || [];
        liveGroups = liveData.groups || {};
        console.log('✅ Loaded data:', matches.length, 'matches');
        
        // Calculate standings from match results (now includes card data)
        teamStandings = calculateStandings();
        console.log('📊 Calculated standings for', Object.keys(teamStandings).length, 'teams');
    }
    
    // Refresh knockout match data from loaded matches
    knockoutMatchData = getKnockoutMatchData();
    
    // Render all components
    renderGroups();
    renderLeagueTable();
    renderThirdPlaceTeams();
    renderKnockoutBracket();
    renderFixtures();
    
    // Auto-refresh every 5 minutes
    setInterval(async () => {
        const [newData, newCards] = await Promise.all([
            loadLiveData(),
            loadCardData()
        ]);
        if (newData) {
            matches = newData.matches || [];
            liveGroups = newData.groups || {};
            cardData = newCards;
            teamStandings = calculateStandings();
            knockoutMatchData = getKnockoutMatchData(); // Refresh knockout data
            renderGroups();
            renderLeagueTable();
            renderThirdPlaceTeams();
            renderKnockoutBracket();
            console.log('🔄 Auto-refreshed at', new Date().toLocaleTimeString());
        }
    }, 5 * 60 * 1000); // 5 minutes
});

// Made with Bob
