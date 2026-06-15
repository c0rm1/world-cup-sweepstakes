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

// Group assignments (World Cup 2026 format - 12 groups of 4)
const groups = {
    'A': ['USA', 'MEX', 'CAN', 'CPV'],
    'B': ['BRA', 'ARG', 'URU', 'COL'],
    'C': ['GER', 'ESP', 'NED', 'SUI'],
    'D': ['FRA', 'ENG', 'BEL', 'POR'],
    'E': ['CRO', 'SWE', 'ALG', 'SEN'],
    'F': ['MAR', 'EGY', 'TUN', 'IRN'],
    'G': ['JPN', 'KOR', 'AUS', 'QAT'],
    'H': ['CIV', 'GHA', 'COD', 'RSA'],
    'I': ['KSA', 'IRQ', 'UZB', 'JOR'],
    'J': ['TUR', 'SCO', 'NOR', 'AUT'],
    'K': ['ECU', 'PAR', 'PAN', 'BIH'],
    'L': ['NZL', 'CUW', 'HAI', 'CZE']
};

// Team standings (will be updated from API)
let teamStandings = {};
Object.keys(groups).forEach(group => {
    groups[group].forEach((team, index) => {
        teamStandings[team] = {
            group: group,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            points: 0,
            position: index + 1
        };
    });
});

// API Configuration
const API_CONFIG = {
    // Using FIFA World Cup API (you can replace with actual API when available)
    baseUrl: 'https://worldcupjson.net/matches',
    updateInterval: 60000 // Update every 60 seconds
};

// Fetch real-time standings
async function fetchRealTimeStandings() {
    try {
        const response = await fetch(API_CONFIG.baseUrl);
        if (!response.ok) {
            throw new Error('API request failed');
        }
        const data = await response.json();
        updateStandingsFromAPI(data);
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    } catch (error) {
        console.log('Using mock data - API not available:', error.message);
        document.getElementById('lastUpdate').textContent = 'Using mock data';
    }
}

// Update standings from API data
function updateStandingsFromAPI(matches) {
    // Reset standings
    Object.keys(teamStandings).forEach(team => {
        teamStandings[team].played = 0;
        teamStandings[team].won = 0;
        teamStandings[team].drawn = 0;
        teamStandings[team].lost = 0;
        teamStandings[team].goalsFor = 0;
        teamStandings[team].goalsAgainst = 0;
        teamStandings[team].points = 0;
    });

    // Process matches
    matches.forEach(match => {
        if (match.status === 'completed') {
            const homeTeam = getTeamCode(match.home_team.name);
            const awayTeam = getTeamCode(match.away_team.name);
            
            if (teamStandings[homeTeam] && teamStandings[awayTeam]) {
                const homeGoals = match.home_team.goals;
                const awayGoals = match.away_team.goals;
                
                // Update home team
                teamStandings[homeTeam].played++;
                teamStandings[homeTeam].goalsFor += homeGoals;
                teamStandings[homeTeam].goalsAgainst += awayGoals;
                
                // Update away team
                teamStandings[awayTeam].played++;
                teamStandings[awayTeam].goalsFor += awayGoals;
                teamStandings[awayTeam].goalsAgainst += homeGoals;
                
                // Determine result
                if (homeGoals > awayGoals) {
                    teamStandings[homeTeam].won++;
                    teamStandings[homeTeam].points += 3;
                    teamStandings[awayTeam].lost++;
                } else if (awayGoals > homeGoals) {
                    teamStandings[awayTeam].won++;
                    teamStandings[awayTeam].points += 3;
                    teamStandings[homeTeam].lost++;
                } else {
                    teamStandings[homeTeam].drawn++;
                    teamStandings[awayTeam].drawn++;
                    teamStandings[homeTeam].points++;
                    teamStandings[awayTeam].points++;
                }
            }
        }
    });
    
    // Update positions within groups
    updateGroupPositions();
    
    // Refresh displays
    renderGroups();
    renderLeagueTable();
    renderThirdPlaceTeams();
}

// Update positions within each group
function updateGroupPositions() {
    Object.keys(groups).forEach(groupName => {
        const groupTeams = groups[groupName].map(team => ({
            team: team,
            ...teamStandings[team]
        }));
        
        // Sort by points, then goal difference, then goals scored
        groupTeams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const gdA = a.goalsFor - a.goalsAgainst;
            const gdB = b.goalsFor - b.goalsAgainst;
            if (gdB !== gdA) return gdB - gdA;
            return b.goalsFor - a.goalsFor;
        });
        
        // Update positions
        groupTeams.forEach((team, index) => {
            teamStandings[team.team].position = index + 1;
        });
    });
}

// Convert full team name to code (helper for API integration)
function getTeamCode(fullName) {
    const nameMap = {
        'United States': 'USA',
        'Mexico': 'MEX',
        'Canada': 'CAN',
        'Cape Verde': 'CPV',
        'Brazil': 'BRA',
        'Argentina': 'ARG',
        'Uruguay': 'URU',
        'Colombia': 'COL',
        'Germany': 'GER',
        'Spain': 'ESP',
        'Netherlands': 'NED',
        'Switzerland': 'SUI',
        'France': 'FRA',
        'England': 'ENG',
        'Belgium': 'BEL',
        'Portugal': 'POR',
        'Croatia': 'CRO',
        'Sweden': 'SWE',
        'Algeria': 'ALG',
        'Senegal': 'SEN',
        'Morocco': 'MAR',
        'Egypt': 'EGY',
        'Tunisia': 'TUN',
        'Iran': 'IRN',
        'Japan': 'JPN',
        'South Korea': 'KOR',
        'Australia': 'AUS',
        'Qatar': 'QAT',
        'Côte d\'Ivoire': 'CIV',
        'Ghana': 'GHA',
        'DR Congo': 'COD',
        'South Africa': 'RSA',
        'Saudi Arabia': 'KSA',
        'Iraq': 'IRQ',
        'Uzbekistan': 'UZB',
        'Jordan': 'JOR',
        'Türkiye': 'TUR',
        'Turkey': 'TUR',
        'Scotland': 'SCO',
        'Norway': 'NOR',
        'Austria': 'AUT',
        'Ecuador': 'ECU',
        'Paraguay': 'PAR',
        'Panama': 'PAN',
        'Bosnia': 'BIH',
        'Bosnia and Herzegovina': 'BIH',
        'New Zealand': 'NZL',
        'Curaçao': 'CUW',
        'Haiti': 'HAI',
        'Czechia': 'CZE',
        'Czech Republic': 'CZE'
    };
    return nameMap[fullName] || fullName;
}

// Start auto-refresh
let refreshInterval;
function startAutoRefresh() {
    fetchRealTimeStandings();
    refreshInterval = setInterval(fetchRealTimeStandings, API_CONFIG.updateInterval);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
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
    
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${pageName}-page`).classList.add('active');
    event.target.classList.add('active');
    
    if (pageName === 'knockout') {
        renderKnockoutBracket();
    }
}

// Render groups
function renderGroups() {
    Object.keys(groups).forEach(groupName => {
        const tbody = document.getElementById(`group${groupName}`);
        tbody.innerHTML = '';
        
        groups[groupName].forEach(team => {
            const owner = findOwner(team);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${team}</td>
                <td>${owner}</td>
            `;
            tbody.appendChild(row);
        });
    });
    
    renderThirdPlaceTeams();
}

// Render third place teams
function renderThirdPlaceTeams() {
    const tbody = document.getElementById('thirdPlaceTeams');
    tbody.innerHTML = '';
    
    Object.keys(groups).forEach(groupName => {
        const thirdPlaceTeam = groups[groupName][2]; // Assuming 3rd position
        const owner = findOwner(thirdPlaceTeam);
        const standing = teamStandings[thirdPlaceTeam];
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Group ${groupName}</td>
            <td>${thirdPlaceTeam}</td>
            <td>${owner}</td>
            <td>${standing.points}</td>
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
function renderLeagueTable(filterPlayer = 'all') {
    const leagueData = calculateLeagueTable();
    const tbody = document.getElementById('leagueTableBody');
    tbody.innerHTML = '';
    
    // Sort by points
    const sortedPlayers = Object.entries(leagueData).sort((a, b) => b[1].points - a[1].points);
    
    sortedPlayers.forEach(([player, data], index) => {
        if (filterPlayer === 'all' || filterPlayer === player) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${player}</strong></td>
                <td>${data.teams.join(', ')}</td>
                <td>${data.played}</td>
                <td>${data.won}</td>
                <td>${data.drawn}</td>
                <td>${data.lost}</td>
                <td><strong>${data.points}</strong></td>
            `;
            tbody.appendChild(row);
        }
    });
}

// Populate player filter
function populatePlayerFilter() {
    const select = document.getElementById('playerFilter');
    Object.keys(players).forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        select.appendChild(option);
    });
}

// Filter league table
function filterLeagueTable() {
    const select = document.getElementById('playerFilter');
    renderLeagueTable(select.value);
}

// Render knockout bracket
function renderKnockoutBracket() {
    // Round of 32 matchups (based on group winners and runners-up + best third place)
    const round32Matches = [
        { team1: '1A', team2: '2B' },
        { team1: '1C', team2: '2D' },
        { team1: '1E', team2: '2F' },
        { team1: '1G', team2: '2H' },
        { team1: '1I', team2: '2J' },
        { team1: '1K', team2: '2L' },
        { team1: '1B', team2: '2A' },
        { team1: '1D', team2: '2C' },
        { team1: '1F', team2: '2E' },
        { team1: '1H', team2: '2G' },
        { team1: '1J', team2: '2I' },
        { team1: '1L', team2: '2K' },
        { team1: '3rd-1', team2: '3rd-2' },
        { team1: '3rd-3', team2: '3rd-4' },
        { team1: '3rd-5', team2: '3rd-6' },
        { team1: '3rd-7', team2: '3rd-8' }
    ];
    
    renderRound('round32', round32Matches);
    renderRound('round16', Array(8).fill({ team1: 'TBD', team2: 'TBD' }));
    renderRound('quarters', Array(4).fill({ team1: 'TBD', team2: 'TBD' }));
    renderRound('semis', Array(2).fill({ team1: 'TBD', team2: 'TBD' }));
    renderRound('final', [{ team1: 'TBD', team2: 'TBD' }]);
}

function renderRound(roundId, matches) {
    const container = document.getElementById(roundId);
    container.innerHTML = '';
    
    matches.forEach((match, index) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        
        const team1 = getTeamFromCode(match.team1);
        const team2 = getTeamFromCode(match.team2);
        const owner1 = findOwner(team1);
        const owner2 = findOwner(team2);
        
        matchDiv.innerHTML = `
            <div class="match-team">
                <span class="team-name">${team1}</span>
                <span class="team-owner">${owner1}</span>
            </div>
            <div class="match-vs">vs</div>
            <div class="match-team">
                <span class="team-name">${team2}</span>
                <span class="team-owner">${owner2}</span>
            </div>
        `;
        container.appendChild(matchDiv);
    });
}

function getTeamFromCode(code) {
    if (code === 'TBD') return 'TBD';
    if (code.startsWith('3rd')) return code;
    
    const groupLetter = code.substring(1);
    const position = parseInt(code.substring(0, 1)) - 1;
    
    if (groups[groupLetter] && groups[groupLetter][position]) {
        return groups[groupLetter][position];
    }
    return code;
}

// Render statistics
function renderStatistics() {
    // Fastest goals
    const fastestGoalsList = document.getElementById('fastestGoals');
    if (statistics.fastestGoals.length === 0) {
        fastestGoalsList.innerHTML = '<li>No data yet</li>';
    } else {
        fastestGoalsList.innerHTML = statistics.fastestGoals
            .slice(0, 3)
            .map(goal => `<li>${goal.team} - ${goal.time}' (${goal.player}) - Owner: ${findOwner(goal.team)}</li>`)
            .join('');
    }
    
    // Fastest cards
    const fastestCardsList = document.getElementById('fastestCards');
    if (statistics.fastestCards.length === 0) {
        fastestCardsList.innerHTML = '<li>No data yet</li>';
    } else {
        fastestCardsList.innerHTML = statistics.fastestCards
            .slice(0, 3)
            .map(card => `<li>${card.team} - ${card.time}' (${card.player}, ${card.type}) - Owner: ${findOwner(card.team)}</li>`)
            .join('');
    }
    
    // Most conceded
    const mostConcededList = document.getElementById('mostConceded');
    if (statistics.mostConceded.length === 0) {
        mostConcededList.innerHTML = '<li>No data yet</li>';
    } else {
        mostConcededList.innerHTML = statistics.mostConceded
            .slice(0, 3)
            .map(game => `<li>${game.team} - ${game.goals} goals vs ${game.opponent} - Owner: ${findOwner(game.team)}</li>`)
            .join('');
    }
    
    // Most cards by player
    const mostCardsTable = document.getElementById('mostCards');
    const sortedCards = Object.entries(statistics.playerCards)
        .sort((a, b) => b[1].total - a[1].total);
    
    mostCardsTable.innerHTML = sortedCards
        .map(([player, cards]) => `
            <tr>
                <td>${player}</td>
                <td>${cards.yellow}</td>
                <td>${cards.red}</td>
                <td><strong>${cards.total}</strong></td>
            </tr>
        `)
        .join('');
}

// Show stats form (placeholder)
function showStatsForm() {
    alert('Statistics update form would open here. In a full implementation, this would allow you to:\n\n' +
          '- Add fastest goals with time and player\n' +
          '- Add fastest cards with time and type\n' +
          '- Record goals conceded in matches\n' +
          '- Update card counts for teams\n\n' +
          'For now, you can manually update the statistics object in the JavaScript code.');
}

// Manual refresh function
function manualRefresh() {
    fetchRealTimeStandings();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderGroups();
    populatePlayerFilter();
    renderLeagueTable();
    renderStatistics();
    
    // Start auto-refresh for real-time data
    startAutoRefresh();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// Made with Bob
