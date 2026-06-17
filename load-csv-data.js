// CSV Data Loading Functions for World Cup 2026

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        const row = {};
        
        headers.forEach((header, index) => {
            const value = values[index];
            // Try to parse as number if it looks like one
            if (value && !isNaN(value) && value.trim() !== '') {
                row[header] = parseFloat(value);
            } else {
                row[header] = value || '';
            }
        });
        
        data.push(row);
    }
    
    return data;
}

/**
 * Load group standings from individual group CSV files
 */
async function loadGroupStandings() {
    const groups = {};
    const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    for (const letter of groupLetters) {
        try {
            const response = await fetch(`data/group_${letter.toLowerCase()}.csv`);
            if (response.ok) {
                const csvText = await response.text();
                const standings = parseCSV(csvText);
                
                if (standings.length > 0) {
                    groups[letter] = standings.map(team => ({
                        team: team.team,
                        owner: team.owner,
                        played: team.played,
                        won: team.won,
                        drawn: team.drawn,
                        lost: team.lost,
                        goalsFor: team.goals_for,
                        goalsAgainst: team.goals_against,
                        goalDiff: team.goal_diff,
                        points: team.points,
                        yellowCards: team.yellows,
                        redCards: team.reds
                    }));
                }
            }
        } catch (error) {
            console.warn(`Could not load Group ${letter}:`, error);
        }
    }
    
    return groups;
}

/**
 * Load leaderboard data from CSV
 */
async function loadLeaderboardData() {
    try {
        const response = await fetch('data/leaderboard.csv');
        if (!response.ok) return null;
        
        const csvText = await response.text();
        const leaderboard = parseCSV(csvText);
        
        return leaderboard.map(row => ({
            position: row.position,
            owner: row.owner,
            teams: row.teams,
            played: row.played,
            won: row.won,
            drawn: row.drawn,
            lost: row.lost,
            goalsFor: row.goals_for,
            goalsAgainst: row.goals_against,
            goalDiff: row.goal_diff,
            points: row.points,
            yellowCards: row.yellows,
            redCards: row.reds
        }));
    } catch (error) {
        console.warn('Could not load leaderboard:', error);
        return null;
    }
}

/**
 * Load third place teams data from CSV
 */
async function loadThirdPlaceData() {
    try {
        const response = await fetch('data/third_place.csv');
        if (!response.ok) return null;
        
        const csvText = await response.text();
        const thirdPlace = parseCSV(csvText);
        
        return thirdPlace.map(row => ({
            rank: row.rank,
            team: row.team,
            owner: row.owner,
            group: row.group,
            played: row.played,
            won: row.won,
            drawn: row.drawn,
            lost: row.lost,
            goalsFor: row.goals_for,
            goalsAgainst: row.goals_against,
            goalDiff: row.goal_diff,
            points: row.points,
            yellowCards: row.yellows,
            redCards: row.reds
        }));
    } catch (error) {
        console.warn('Could not load third place data:', error);
        return null;
    }
}

/**
 * Load all CSV data and update the application
 */
async function loadAllCSVData() {
    console.log('📊 Loading data from CSV files...');
    
    try {
        // Load all data in parallel
        const [groupStandings, leaderboardData, thirdPlaceData] = await Promise.all([
            loadGroupStandings(),
            loadLeaderboardData(),
            loadThirdPlaceData()
        ]);
        
        // Update global variables
        if (groupStandings && Object.keys(groupStandings).length > 0) {
            window.groupStandings = groupStandings;
            console.log(`✅ Loaded ${Object.keys(groupStandings).length} group standings`);
        }
        
        if (leaderboardData) {
            window.leaderboardData = leaderboardData;
            console.log(`✅ Loaded leaderboard with ${leaderboardData.length} entries`);
        }
        
        if (thirdPlaceData) {
            window.thirdPlaceData = thirdPlaceData;
            console.log(`✅ Loaded ${thirdPlaceData.length} third place teams`);
        }
        
        return {
            groups: groupStandings,
            leaderboard: leaderboardData,
            thirdPlace: thirdPlaceData
        };
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return null;
    }
}

// Made with Bob
