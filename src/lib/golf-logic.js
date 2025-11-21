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

export function calculateSindicatoPoints(playerScores, playerCount) {
    // playerScores: Array of { playerId, netScore }
    // Returns: Map { playerId: points }

    // Define distribution based on player count
    let distribution = [];
    if (playerCount === 3) distribution = [5, 3, 1];
    else if (playerCount === 4) distribution = [6, 4, 2, 0];
    else return {}; // Unsupported count for now

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
