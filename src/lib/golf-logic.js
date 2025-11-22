export function calculatePlayingHandicap(handicapIndex, slope, courseRating, par) {
    // Fórmula WHS: (Handicap Index x (Slope Rating / 113)) + (Course Rating - Par)
    if (!handicapIndex || !slope || !courseRating || !par) return 0;

    const courseHandicap = handicapIndex * (slope / 113) + (courseRating - par);
    return Math.round(courseHandicap);
}

export function calculateStablefordPoints(strokes, par, strokesReceived) {
    // Net Score = Gross Strokes - Strokes Received
    // Points:
    // Net Par = 2 points
    // Net Birdie (-1) = 3 points
    // Net Eagle (-2) = 4 points
    // Net Bogey (+1) = 1 point
    // Net Double Bogey or worse (+2) = 0 points

    const netScore = strokes - strokesReceived;
    const scoreToPar = netScore - par;

    if (scoreToPar >= 2) return 0; // Double bogey or worse (net)
    if (scoreToPar === 1) return 1; // Bogey
    if (scoreToPar === 0) return 2; // Par
    if (scoreToPar === -1) return 3; // Birdie
    if (scoreToPar === -2) return 4; // Eagle
    if (scoreToPar <= -3) return 5; // Albatross or better

    return 0;
}

export function getStrokesReceivedForHole(playingHandicap, holeHandicap) {
    // Distribute handicap strokes across holes based on hole difficulty (handicap index)
    let strokes = 0;

    // Base strokes (e.g. if handicap is 20, everyone gets at least 1 stroke per hole)
    if (playingHandicap >= 18) {
        strokes += Math.floor(playingHandicap / 18);
    }

    // Extra strokes for hardest holes
    const remainder = playingHandicap % 18;
    if (holeHandicap <= remainder) {
        strokes += 1;
    }

    return strokes;
}

export function calculateSindicatoPoints(playerScores, playerCount, customDistribution = null) {
    // playerScores: Array of { playerId, netScore }
    // customDistribution: Array of points per position [1st, 2nd, 3rd, ...]
    // Returns: Map { playerId: points }

    // Use custom distribution or default
    let distribution = customDistribution;
    if (!distribution) {
        if (playerCount === 2) distribution = [2, 0];
        else if (playerCount === 3) distribution = [4, 2, 1];
        else if (playerCount === 4) distribution = [4, 2, 1, 0];
        else distribution = Array(playerCount).fill(0).map((_, i) => Math.max(0, playerCount - i - 1));
    }

    // Sort players by net score (ascending, lower is better)
    const sortedPlayers = [...playerScores].sort((a, b) => a.netScore - b.netScore);

    const results = {};
    let currentRank = 0;

    while (currentRank < sortedPlayers.length) {
        // Find ties
        let tieCount = 1;
        while (currentRank + tieCount < sortedPlayers.length &&
            sortedPlayers[currentRank].netScore === sortedPlayers[currentRank + tieCount].netScore) {
            tieCount++;
        }

        // Calculate points for this group
        let totalPoints = 0;
        for (let i = 0; i < tieCount; i++) {
            if (currentRank + i < distribution.length) {
                totalPoints += distribution[currentRank + i];
            }
        }

        const pointsPerPlayer = totalPoints / tieCount;

        // Assign points
        for (let i = 0; i < tieCount; i++) {
            results[sortedPlayers[currentRank + i].playerId] = pointsPerPlayer;
        }

        currentRank += tieCount;
    }

    return results;
}

export function calculateTeamPoints(playersData, teamMode, pointsConfig) {
    // playersData: Array of { playerId, netScore, team }
    // teamMode: 'bestBall' or 'goodBadBall'
    // pointsConfig: { bestBallPoints, worstBallPoints } (only for goodBadBall)
    // Returns: { teamA: points, teamB: points, status: 'A/S' | '1UP' | '2UP' etc, winner: 'A' | 'B' | null }

    if (playersData.length === 0) return { teamA: 0, teamB: 0, status: '-', winner: null };

    // Group players by team
    const teamA = playersData.filter(p => p.team === 'A');
    const teamB = playersData.filter(p => p.team === 'B');

    if (teamA.length === 0 || teamB.length === 0) {
        return { teamA: 0, teamB: 0, status: '-', winner: null };
    }

    // Sort each team by net score (ascending, lower is better)
    const teamASorted = [...teamA].sort((a, b) => a.netScore - b.netScore);
    const teamBSorted = [...teamB].sort((a, b) => a.netScore - b.netScore);

    if (teamMode === 'bestBall') {
        // Winner gets 1 point
        const bestA = teamASorted[0].netScore;
        const bestB = teamBSorted[0].netScore;

        if (bestA < bestB) {
            return { teamA: 1, teamB: 0, status: '1UP', winner: 'A' };
        } else if (bestB < bestA) {
            return { teamA: 0, teamB: 1, status: '1UP', winner: 'B' };
        } else {
            // Tie - All Square
            return { teamA: 0.5, teamB: 0.5, status: 'A/S', winner: null };
        }
    } else if (teamMode === 'goodBadBall') {
        // Distribute points for best ball and worst ball
        const { bestBallPoints = 2, worstBallPoints = 1 } = pointsConfig;
        let teamAPoints = 0;
        let teamBPoints = 0;

        // Best ball comparison
        const bestA = teamASorted[0].netScore;
        const bestB = teamBSorted[0].netScore;

        if (bestA < bestB) {
            teamAPoints += bestBallPoints;
        } else if (bestB < bestA) {
            teamBPoints += bestBallPoints;
        } else {
            // Tie - split points
            teamAPoints += bestBallPoints / 2;
            teamBPoints += bestBallPoints / 2;
        }

        // Worst ball comparison (last player in sorted array)
        const worstA = teamASorted[teamASorted.length - 1].netScore;
        const worstB = teamBSorted[teamBSorted.length - 1].netScore;

        if (worstA < worstB) {
            teamAPoints += worstBallPoints;
        } else if (worstB < worstA) {
            teamBPoints += worstBallPoints;
        } else {
            // Tie - split points
            teamAPoints += worstBallPoints / 2;
            teamBPoints += worstBallPoints / 2;
        }

        // Determine status
        let status, winner;
        if (teamAPoints === teamBPoints) {
            status = 'A/S';
            winner = null;
        } else if (teamAPoints > teamBPoints) {
            const diff = teamAPoints - teamBPoints;
            status = `${diff}UP`;
            winner = 'A';
        } else {
            const diff = teamBPoints - teamAPoints;
            status = `${diff}UP`;
            winner = 'B';
        }

        return { teamA: teamAPoints, teamB: teamBPoints, status, winner };
    }

    return { teamA: 0, teamB: 0, status: '-', winner: null };
}
