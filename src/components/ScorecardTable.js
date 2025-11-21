'use client';

import { getStrokesReceivedForHole, calculateStablefordPoints, calculateSindicatoPoints } from '@/lib/golf-logic';

export default function ScorecardTable({ round }) {
    if (!round) return null;

    const holes = round.holes;
    const players = round.players;

    const frontNine = holes.slice(0, 9);
    const backNine = holes.slice(9, 18);

    // Helper to calculate totals
    const getTotals = (nine, player) => {
        return nine.reduce((acc, hole) => {
            const score = player.scores[hole.number];
            if (!score) return acc;

            const strokesReceived = getStrokesReceivedForHole(player.playingHandicap, hole.handicap);
            const stableford = calculateStablefordPoints(score.strokes, hole.par, strokesReceived);

            return {
                strokes: acc.strokes + score.strokes,
                putts: acc.putts + score.putts,
                stableford: acc.stableford + stableford
            };
        }, { strokes: 0, putts: 0, stableford: 0 });
    };

    const getScoreColor = (strokes, par) => {
        if (!strokes) return 'transparent';
        const diff = strokes - par;
        if (diff <= -2) return '#FFD700'; // Eagle (Gold)
        if (diff === -1) return '#e53935'; // Birdie (Red)
        if (diff === 0) return '#1e88e5'; // Par (Blue)
        if (diff === 1) return '#43a047'; // Bogey (Green)
        if (diff === 2) return '#757575'; // Double Bogey (Grey)
        return '#212121'; // Triple+ (Black)
    };

    const renderNine = (nineHoles, label) => (
        <>
            {nineHoles.map(hole => (
                <th key={hole.number} className="p-1 text-center text-xs border-l border-gray-200 min-w-[30px]">
                    {hole.number}
                </th>
            ))}
            <th className="p-1 text-center text-xs font-bold border-l border-gray-300 bg-gray-100">{label}</th>
        </>
    );

    const renderRow = (label, dataFn, isHeader = false) => (
        <tr className={isHeader ? "bg-gray-50" : "border-b border-gray-100"}>
            <td className="p-2 text-sm font-semibold sticky left-0 bg-white border-r border-gray-200 z-10 min-w-[80px]">
                {label}
            </td>
            {/* Front Nine */}
            {frontNine.map(hole => (
                <td key={hole.number} className="p-1 text-center text-sm border-l border-gray-200">
                    {dataFn(hole)}
                </td>
            ))}
            <td className="p-1 text-center text-sm font-bold border-l border-gray-300 bg-gray-50">
                {dataFn(null, 'out')}
            </td>

            {/* Back Nine */}
            {backNine.map(hole => (
                <td key={hole.number} className="p-1 text-center text-sm border-l border-gray-200">
                    {dataFn(hole)}
                </td>
            ))}
            <td className="p-1 text-center text-sm font-bold border-l border-gray-300 bg-gray-50">
                {dataFn(null, 'in')}
            </td>

            {/* Total */}
            <td className="p-1 text-center text-sm font-bold border-l-2 border-gray-300 bg-gray-100">
                {dataFn(null, 'total')}
            </td>
        </tr>
    );

    return (
        <div className="overflow-x-auto" style={{ maxWidth: '100%', boxShadow: '0 0 10px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <table className="w-full border-collapse bg-white" style={{ minWidth: '800px' }}>
                <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="p-2 text-left text-xs font-bold sticky left-0 bg-gray-100 z-20 border-r border-gray-200">HOYO</th>
                        {renderNine(frontNine, 'OUT')}
                        {renderNine(backNine, 'IN')}
                        <th className="p-2 text-center text-xs font-bold border-l-2 border-gray-300">TOT</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Course Info Rows */}
                    {renderRow('Metros', (hole, type) => {
                        if (type === 'out') return frontNine.reduce((a, h) => a + h.distance, 0);
                        if (type === 'in') return backNine.reduce((a, h) => a + h.distance, 0);
                        if (type === 'total') return round.holes.reduce((a, h) => a + h.distance, 0);
                        return hole.distance;
                    })}
                    {renderRow('Par', (hole, type) => {
                        if (type === 'out') return frontNine.reduce((a, h) => a + h.par, 0);
                        if (type === 'in') return backNine.reduce((a, h) => a + h.par, 0);
                        if (type === 'total') return round.holes.reduce((a, h) => a + h.par, 0);
                        return hole.par;
                    })}
                    {renderRow('Hcp', (hole, type) => {
                        if (type) return '-';
                        return hole.handicap;
                    })}

                    {/* Players Rows */}
                    {players.map(player => {
                        const outTotals = getTotals(frontNine, player);
                        const inTotals = getTotals(backNine, player);
                        const totalStrokes = outTotals.strokes + inTotals.strokes;

                        return (
                            <tr key={player.id} className="border-b border-gray-200">
                                <td className="p-2 text-sm font-bold sticky left-0 bg-white border-r border-gray-200 z-10">
                                    {player.name}
                                    <div className="text-xs font-normal text-gray-500">Hcp {player.playingHandicap}</div>
                                </td>

                                {/* Front Nine Scores */}
                                {frontNine.map(hole => {
                                    const score = player.scores[hole.number];
                                    const bg = score ? getScoreColor(score.strokes, hole.par) : 'transparent';
                                    const color = score ? 'white' : 'inherit';
                                    return (
                                        <td key={hole.number} className="p-1 text-center border-l border-gray-200">
                                            {score ? (
                                                <div style={{
                                                    background: bg, color: color,
                                                    width: '24px', height: '24px',
                                                    borderRadius: '4px', margin: '0 auto',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.85rem', fontWeight: 'bold'
                                                }}>
                                                    {score.strokes}
                                                </div>
                                            ) : '-'}
                                        </td>
                                    );
                                })}
                                <td className="p-1 text-center font-bold bg-gray-50 border-l border-gray-300">{outTotals.strokes || '-'}</td>

                                {/* Back Nine Scores */}
                                {backNine.map(hole => {
                                    const score = player.scores[hole.number];
                                    const bg = score ? getScoreColor(score.strokes, hole.par) : 'transparent';
                                    const color = score ? 'white' : 'inherit';
                                    return (
                                        <td key={hole.number} className="p-1 text-center border-l border-gray-200">
                                            {score ? (
                                                <div style={{
                                                    background: bg, color: color,
                                                    width: '24px', height: '24px',
                                                    borderRadius: '4px', margin: '0 auto',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.85rem', fontWeight: 'bold'
                                                }}>
                                                    {score.strokes}
                                                </div>
                                            ) : '-'}
                                        </td>
                                    );
                                })}
                                <td className="p-1 text-center font-bold bg-gray-50 border-l border-gray-300">{inTotals.strokes || '-'}</td>

                                {/* Total */}
                                <td className="p-1 text-center font-bold bg-gray-100 border-l-2 border-gray-300">{totalStrokes || '-'}</td>
                            </tr>
                        );
                    })}

                    {/* Sindicato Rows */}
                    {round.settings?.gameMode === 'sindicato' && (
                        <>
                            <tr className="bg-gray-100 border-b border-gray-200">
                                <td className="p-2 text-xs font-bold sticky left-0 bg-gray-100 z-10 border-r border-gray-200">SINDICATO</td>
                                <td colSpan={21} className="bg-gray-50"></td>
                            </tr>
                            {players.map(player => {
                                // Calculate Sindicato points for all holes
                                const scoresForCalc = round.holes.map(h => {
                                    // Only calculate if hole is completed
                                    if (!round.completedHoles?.includes(h.number)) {
                                        return { hole: h.number, points: {} };
                                    }

                                    const pScore = round.players.map(p => {
                                        const s = p.scores[h.number];
                                        if (!s) return { playerId: p.id, netScore: 999 }; // No score yet
                                        const strokesRec = getStrokesReceivedForHole(p.playingHandicap, h.handicap);
                                        return { playerId: p.id, netScore: s.strokes - strokesRec };
                                    });
                                    // Calculate Sindicato points using imported function
                                    return { hole: h.number, points: calculateSindicatoPoints(pScore, players.length) };
                                });

                                const getPlayerPoints = (holeNum) => {
                                    const holeData = scoresForCalc.find(d => d.hole === holeNum);
                                    return holeData ? holeData.points[player.id] || 0 : 0;
                                };

                                const outPoints = frontNine.reduce((acc, h) => acc + getPlayerPoints(h.number), 0);
                                const inPoints = backNine.reduce((acc, h) => acc + getPlayerPoints(h.number), 0);
                                const totalPoints = outPoints + inPoints;

                                return (
                                    <tr key={`sind-${player.id}`} className="border-b border-gray-100 bg-blue-50">
                                        <td className="p-2 text-xs font-bold sticky left-0 bg-blue-50 border-r border-gray-200 z-10">
                                            PTS ({player.name})
                                        </td>
                                        {frontNine.map(hole => (
                                            <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200">
                                                {getPlayerPoints(hole.number) || '-'}
                                            </td>
                                        ))}
                                        <td className="p-1 text-center text-xs font-bold border-l border-gray-300">{outPoints}</td>

                                        {backNine.map(hole => (
                                            <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200">
                                                {getPlayerPoints(hole.number) || '-'}
                                            </td>
                                        ))}
                                        <td className="p-1 text-center text-xs font-bold border-l border-gray-300">{inPoints}</td>
                                        <td className="p-1 text-center text-xs font-bold border-l-2 border-gray-300 text-blue-800">{totalPoints}</td>
                                    </tr>
                                );
                            })}
                        </>
                    )}

                    {/* Stableford Row (Only if mode is stableford) */}
                    {round.settings?.gameMode === 'stableford' && players.map(player => {
                        const outTotals = getTotals(frontNine, player);
                        const inTotals = getTotals(backNine, player);
                        return (
                            <tr key={`stb-${player.id}`} className="border-b border-gray-100 bg-gray-50">
                                <td className="p-2 text-xs sticky left-0 bg-gray-50 border-r border-gray-200 z-10">
                                    STB ({player.name})
                                </td>
                                {frontNine.map(hole => {
                                    const score = player.scores[hole.number];
                                    if (!score) return <td key={hole.number} className="border-l border-gray-200"></td>;
                                    const strokesReceived = getStrokesReceivedForHole(player.playingHandicap, hole.handicap);
                                    const points = calculateStablefordPoints(score.strokes, hole.par, strokesReceived);
                                    return <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200">{points}</td>;
                                })}
                                <td className="p-1 text-center text-xs font-bold border-l border-gray-300">{outTotals.stableford}</td>

                                {backNine.map(hole => {
                                    const score = player.scores[hole.number];
                                    if (!score) return <td key={hole.number} className="border-l border-gray-200"></td>;
                                    const strokesReceived = getStrokesReceivedForHole(player.playingHandicap, hole.handicap);
                                    const points = calculateStablefordPoints(score.strokes, hole.par, strokesReceived);
                                    return <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200">{points}</td>;
                                })}
                                <td className="p-1 text-center text-xs font-bold border-l border-gray-300">{inTotals.stableford}</td>
                                <td className="p-1 text-center text-xs font-bold border-l-2 border-gray-300">{outTotals.stableford + inTotals.stableford}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
