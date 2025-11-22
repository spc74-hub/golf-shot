'use client';

import { getStrokesReceivedForHole, calculateStablefordPoints, calculateSindicatoPoints, calculateTeamPoints } from '@/lib/golf-logic';

export default function ScorecardTable({ round }) {
    if (!round) return null;

    const holes = round.holes;
    const players = round.players;
    const courseLength = round.settings?.courseLength || '18';

    // Determine which holes to display based on course length
    let frontNine, backNine;

    if (courseLength === 'front9') {
        // Only show front 9
        frontNine = holes;
        backNine = [];
    } else if (courseLength === 'back9') {
        // Only show back 9 - put holes in backNine to show IN column
        frontNine = [];
        backNine = holes;
    } else {
        // Show both front and back 9
        frontNine = holes.slice(0, 9);
        backNine = holes.slice(9, 18);
    }

    // Helper para formatear números con máximo 1 decimal
    const formatNumber = (num) => {
        if (Number.isInteger(num)) return num;
        return num.toFixed(1);
    };

    // Helper to calculate totals (only confirmed holes)
    const getTotals = (nine, player) => {
        return nine.reduce((acc, hole) => {
            if (!round.completedHoles?.includes(hole.number)) return acc;
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

    const is9Holes = courseLength === 'front9' || courseLength === 'back9';

    const renderNine = (nineHoles, label) => (
        <>
            {nineHoles.map(hole => (
                <th key={hole.number} className="p-1 text-center text-xs border-l border-gray-200 min-w-[30px]">
                    {hole.number}
                </th>
            ))}
            {/* Show OUT for 18 holes and front9, show IN for 18 holes and back9 */}
            {((courseLength === '18' || (courseLength === 'front9' && label === 'OUT') || (courseLength === 'back9' && label === 'IN')) && nineHoles.length > 0) && (
                <th className="p-1 text-center text-xs font-bold border-l border-gray-300 bg-gray-100">{label}</th>
            )}
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
            {/* OUT column - show for 18 holes and front9 */}
            {(courseLength === '18' || courseLength === 'front9') && frontNine.length > 0 && (
                <td className="p-1 text-center text-sm font-bold border-l border-gray-300 bg-gray-50">
                    {dataFn(null, 'out')}
                </td>
            )}

            {/* Back Nine */}
            {backNine.map(hole => (
                <td key={hole.number} className="p-1 text-center text-sm border-l border-gray-200">
                    {dataFn(hole)}
                </td>
            ))}
            {/* IN column - show for 18 holes and back9 */}
            {(courseLength === '18' || courseLength === 'back9') && backNine.length > 0 && (
                <td className="p-1 text-center text-sm font-bold border-l border-gray-300 bg-gray-50">
                    {dataFn(null, 'in')}
                </td>
            )}

            {/* Total - only for 18 holes */}
            {courseLength === '18' && (
                <td className="p-1 text-center text-sm font-bold border-l-2 border-gray-300 bg-gray-100">
                    {dataFn(null, 'total')}
                </td>
            )}
        </tr>
    );

    return (
        <div className="overflow-x-auto" style={{
            maxWidth: '100%',
            boxShadow: '0 0 10px rgba(0,0,0,0.05)',
            borderRadius: '8px',
            WebkitOverflowScrolling: 'touch', // Smooth scrolling en iOS
            overscrollBehavior: 'contain' // Evita scroll del body cuando llegas al final
        }}>
            <table className="w-full border-collapse bg-white" style={{ minWidth: '800px' }}>
                <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="p-2 text-left text-xs font-bold sticky left-0 bg-gray-100 z-20 border-r border-gray-200" style={{ minWidth: '80px' }}>HOYO</th>
                        {renderNine(frontNine, 'OUT')}
                        {backNine.length > 0 && renderNine(backNine, 'IN')}
                        {courseLength === '18' && <th className="p-2 text-center text-xs font-bold border-l-2 border-gray-300">TOT</th>}
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

                        // Team colors (only for team mode)
                        const isTeamMode = round.settings?.gameMode === 'team';
                        const teamColor = isTeamMode && player.team === 'A' ? '#1976d2' : isTeamMode && player.team === 'B' ? '#d32f2f' : 'inherit';

                        return (
                            <tr key={player.id} className="border-b border-gray-200">
                                <td className="p-2 text-sm font-bold sticky left-0 bg-white border-r border-gray-200 z-10">
                                    <span style={{ color: teamColor }}>{player.name}</span>
                                    <div className="text-xs font-normal text-gray-500">Hcp {player.playingHandicap}</div>
                                </td>

                                {/* Front Nine Scores */}
                                {frontNine.map(hole => {
                                    const isConfirmed = round.completedHoles?.includes(hole.number);
                                    const score = isConfirmed ? player.scores[hole.number] : null;
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
                                {/* OUT column - show for 18 holes and front9 */}
                                {(courseLength === '18' || courseLength === 'front9') && frontNine.length > 0 && (
                                    <td className="p-1 text-center font-bold bg-gray-50 border-l border-gray-300">{outTotals.strokes || '-'}</td>
                                )}

                                {/* Back Nine Scores */}
                                {backNine.map(hole => {
                                    const isConfirmed = round.completedHoles?.includes(hole.number);
                                    const score = isConfirmed ? player.scores[hole.number] : null;
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
                                {/* IN column - show for 18 holes and back9 */}
                                {(courseLength === '18' || courseLength === 'back9') && backNine.length > 0 && (
                                    <td className="p-1 text-center font-bold bg-gray-50 border-l border-gray-300">{inTotals.strokes || '-'}</td>
                                )}

                                {/* Total - only for 18 holes */}
                                {courseLength === '18' && (
                                    <td className="p-1 text-center font-bold bg-gray-100 border-l-2 border-gray-300">{totalStrokes || '-'}</td>
                                )}
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
                                    // Calculate Sindicato points using imported function (with custom distribution)
                                    return { hole: h.number, points: calculateSindicatoPoints(pScore, players.length, round.settings?.sindicatoPoints) };
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
                                        {frontNine.map(hole => {
                                            const pts = getPlayerPoints(hole.number);
                                            return (
                                                <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200">
                                                    {pts ? formatNumber(pts) : '-'}
                                                </td>
                                            );
                                        })}
                                        {/* OUT column - show for 18 holes and front9 */}
                                        {(courseLength === '18' || courseLength === 'front9') && frontNine.length > 0 && (
                                            <td className="p-1 text-center text-xs font-bold border-l border-gray-300">{formatNumber(outPoints)}</td>
                                        )}

                                        {backNine.map(hole => {
                                            const pts = getPlayerPoints(hole.number);
                                            return (
                                                <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200">
                                                    {pts ? formatNumber(pts) : '-'}
                                                </td>
                                            );
                                        })}
                                        {/* IN column - show for 18 holes and back9 */}
                                        {(courseLength === '18' || courseLength === 'back9') && backNine.length > 0 && (
                                            <td className="p-1 text-center text-xs font-bold border-l border-gray-300">{formatNumber(inPoints)}</td>
                                        )}
                                        {/* Total - only for 18 holes */}
                                        {courseLength === '18' && (
                                            <td className="p-1 text-center text-xs font-bold border-l-2 border-gray-300 text-blue-800">{formatNumber(totalPoints)}</td>
                                        )}
                                    </tr>
                                );
                            })}
                        </>
                    )}

                    {/* Stableford Row (siempre visible) */}
                    {players.map(player => {
                        const outTotals = getTotals(frontNine, player);
                        const inTotals = getTotals(backNine, player);
                        return (
                            <tr key={`stb-${player.id}`} className="border-b border-gray-100 bg-gray-50">
                                <td className="p-2 text-xs sticky left-0 bg-gray-50 border-r border-gray-200 z-10">
                                    STB ({player.name})
                                </td>
                                {frontNine.map(hole => {
                                    const isConfirmed = round.completedHoles?.includes(hole.number);
                                    if (!isConfirmed) return <td key={hole.number} className="border-l border-gray-200">-</td>;
                                    const score = player.scores[hole.number];
                                    const strokesReceived = getStrokesReceivedForHole(player.playingHandicap, hole.handicap);
                                    const points = calculateStablefordPoints(score.strokes, hole.par, strokesReceived);
                                    return <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200">{points}</td>;
                                })}
                                {/* OUT column - show for 18 holes and front9 */}
                                {(courseLength === '18' || courseLength === 'front9') && frontNine.length > 0 && (
                                    <td className="p-1 text-center text-xs font-bold border-l border-gray-300">{outTotals.stableford || '-'}</td>
                                )}

                                {backNine.map(hole => {
                                    const isConfirmed = round.completedHoles?.includes(hole.number);
                                    if (!isConfirmed) return <td key={hole.number} className="border-l border-gray-200">-</td>;
                                    const score = player.scores[hole.number];
                                    const strokesReceived = getStrokesReceivedForHole(player.playingHandicap, hole.handicap);
                                    const points = calculateStablefordPoints(score.strokes, hole.par, strokesReceived);
                                    return <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200">{points}</td>;
                                })}
                                {/* IN column - show for 18 holes and back9 */}
                                {(courseLength === '18' || courseLength === 'back9') && backNine.length > 0 && (
                                    <td className="p-1 text-center text-xs font-bold border-l border-gray-300">{inTotals.stableford || '-'}</td>
                                )}
                                {/* Total - only for 18 holes */}
                                {courseLength === '18' && (
                                    <td className="p-1 text-center text-xs font-bold border-l-2 border-gray-300">{(outTotals.stableford + inTotals.stableford) || '-'}</td>
                                )}
                            </tr>
                        );
                    })}

                    {/* Team Mode Rows */}
                    {round.settings?.gameMode === 'team' && (() => {
                        const teamMode = round.settings?.teamMode || 'bestBall';
                        const pointsConfig = {
                            bestBallPoints: round.settings?.bestBallPoints || 2,
                            worstBallPoints: round.settings?.worstBallPoints || 1
                        };

                        // Calculate team points for each hole
                        const teamScoresByHole = round.holes.map(h => {
                            if (!round.completedHoles?.includes(h.number)) {
                                return { hole: h.number, teamA: 0, teamB: 0, status: '-', winner: null };
                            }

                            const playersData = round.players.map(p => {
                                const s = p.scores[h.number];
                                if (!s) return { playerId: p.id, netScore: 999, team: p.team };
                                const strokesRec = getStrokesReceivedForHole(p.playingHandicap, h.handicap);
                                return { playerId: p.id, netScore: s.strokes - strokesRec, team: p.team };
                            });

                            const teamPoints = calculateTeamPoints(playersData, teamMode, pointsConfig);
                            return { hole: h.number, ...teamPoints };
                        });

                        const teamAOutPoints = frontNine.reduce((acc, h) => {
                            const holeData = teamScoresByHole.find(d => d.hole === h.number);
                            return acc + (holeData ? holeData.teamA : 0);
                        }, 0);

                        const teamAInPoints = backNine.reduce((acc, h) => {
                            const holeData = teamScoresByHole.find(d => d.hole === h.number);
                            return acc + (holeData ? holeData.teamA : 0);
                        }, 0);

                        const teamBOutPoints = frontNine.reduce((acc, h) => {
                            const holeData = teamScoresByHole.find(d => d.hole === h.number);
                            return acc + (holeData ? holeData.teamB : 0);
                        }, 0);

                        const teamBInPoints = backNine.reduce((acc, h) => {
                            const holeData = teamScoresByHole.find(d => d.hole === h.number);
                            return acc + (holeData ? holeData.teamB : 0);
                        }, 0);

                        return (
                            <>
                                <tr className="bg-gray-100 border-b border-gray-200">
                                    <td className="p-2 text-xs font-bold sticky left-0 bg-gray-100 z-10 border-r border-gray-200">EQUIPOS</td>
                                    <td colSpan={21} className="bg-gray-50"></td>
                                </tr>
                                <tr className="border-b border-gray-100" style={{ backgroundColor: '#e3f2fd' }}>
                                    <td className="p-2 text-xs font-bold sticky left-0 border-r border-gray-200 z-10" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                                        Equipo A (Azul)
                                    </td>
                                    {frontNine.map(hole => {
                                        const holeData = teamScoresByHole.find(d => d.hole === hole.number);
                                        const winner = holeData?.winner;
                                        const status = holeData?.status || '-';
                                        return (
                                            <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200" style={{ fontWeight: winner === 'A' ? 'bold' : 'normal', color: winner === 'A' ? '#1976d2' : '#666' }}>
                                                {winner === 'A' ? status : winner === null && status === 'A/S' ? status : ''}
                                            </td>
                                        );
                                    })}
                                    {/* OUT column - show for 18 holes and front9 */}
                                    {(courseLength === '18' || courseLength === 'front9') && frontNine.length > 0 && (
                                        <td className="p-1 text-center text-xs border-l border-gray-300"></td>
                                    )}

                                    {backNine.map(hole => {
                                        const holeData = teamScoresByHole.find(d => d.hole === hole.number);
                                        const winner = holeData?.winner;
                                        const status = holeData?.status || '-';
                                        return (
                                            <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200" style={{ fontWeight: winner === 'A' ? 'bold' : 'normal', color: winner === 'A' ? '#1976d2' : '#666' }}>
                                                {winner === 'A' ? status : winner === null && status === 'A/S' ? status : ''}
                                            </td>
                                        );
                                    })}
                                    {/* IN column - show for 18 holes and back9 */}
                                    {(courseLength === '18' || courseLength === 'back9') && backNine.length > 0 && (
                                        <td className="p-1 text-center text-xs border-l border-gray-300"></td>
                                    )}
                                    {/* Total - only for 18 holes */}
                                    {courseLength === '18' && (
                                        <td className="p-1 text-center text-xs border-l-2 border-gray-300"></td>
                                    )}
                                </tr>
                                <tr className="border-b border-gray-100" style={{ backgroundColor: '#ffebee' }}>
                                    <td className="p-2 text-xs font-bold sticky left-0 border-r border-gray-200 z-10" style={{ backgroundColor: '#ffebee', color: '#d32f2f' }}>
                                        Equipo B (Rojo)
                                    </td>
                                    {frontNine.map(hole => {
                                        const holeData = teamScoresByHole.find(d => d.hole === hole.number);
                                        const winner = holeData?.winner;
                                        const status = holeData?.status || '-';
                                        return (
                                            <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200" style={{ fontWeight: winner === 'B' ? 'bold' : 'normal', color: winner === 'B' ? '#d32f2f' : '#666' }}>
                                                {winner === 'B' ? status : ''}
                                            </td>
                                        );
                                    })}
                                    {/* OUT column - show for 18 holes and front9 */}
                                    {(courseLength === '18' || courseLength === 'front9') && frontNine.length > 0 && (
                                        <td className="p-1 text-center text-xs border-l border-gray-300"></td>
                                    )}

                                    {backNine.map(hole => {
                                        const holeData = teamScoresByHole.find(d => d.hole === hole.number);
                                        const winner = holeData?.winner;
                                        const status = holeData?.status || '-';
                                        return (
                                            <td key={hole.number} className="p-1 text-center text-xs border-l border-gray-200" style={{ fontWeight: winner === 'B' ? 'bold' : 'normal', color: winner === 'B' ? '#d32f2f' : '#666' }}>
                                                {winner === 'B' ? status : ''}
                                            </td>
                                        );
                                    })}
                                    {/* IN column - show for 18 holes and back9 */}
                                    {(courseLength === '18' || courseLength === 'back9') && backNine.length > 0 && (
                                        <td className="p-1 text-center text-xs border-l border-gray-300"></td>
                                    )}
                                    {/* Total - only for 18 holes */}
                                    {courseLength === '18' && (
                                        <td className="p-1 text-center text-xs border-l-2 border-gray-300"></td>
                                    )}
                                </tr>
                            </>
                        );
                    })()}

                    {/* Clasificación (2+ jugadores, adaptada por modalidad) */}
                    {players.length >= 2 && (() => {
                        const gameMode = round.settings?.gameMode || 'stableford';

                        // Para modo equipo, no mostrar clasificación (match play no tiene clasificación acumulada)
                        if (gameMode === 'team') {
                            return null;
                        }

                        // Calcular datos de cada jugador (para otros modos)
                        const playerScores = players.map(player => {
                            const outTotals = getTotals(frontNine, player);
                            const inTotals = getTotals(backNine, player);

                            // Para Sindicato, calcular puntos del sindicato
                            let sindicatoTotal = 0;
                            if (gameMode === 'sindicato') {
                                round.holes.forEach(h => {
                                    if (!round.completedHoles?.includes(h.number)) return;
                                    const pScore = round.players.map(p => {
                                        const s = p.scores[h.number];
                                        if (!s) return { playerId: p.id, netScore: 999 };
                                        const strokesRec = getStrokesReceivedForHole(p.playingHandicap, h.handicap);
                                        return { playerId: p.id, netScore: s.strokes - strokesRec };
                                    });
                                    const pts = calculateSindicatoPoints(pScore, players.length, round.settings?.sindicatoPoints);
                                    sindicatoTotal += pts[player.id] || 0;
                                });
                            }

                            return {
                                ...player,
                                totalStableford: outTotals.stableford + inTotals.stableford,
                                totalStrokes: outTotals.strokes + inTotals.strokes,
                                totalSindicato: sindicatoTotal
                            };
                        });

                        // Ordenar según modalidad
                        let sorted, leaderValue, getValue, unit, higherIsBetter;

                        if (gameMode === 'stroke') {
                            // Medal: menor golpes = mejor
                            sorted = [...playerScores].sort((a, b) => a.totalStrokes - b.totalStrokes);
                            leaderValue = sorted[0].totalStrokes;
                            getValue = (p) => p.totalStrokes;
                            unit = ' gps';
                            higherIsBetter = false;
                        } else if (gameMode === 'sindicato') {
                            // Sindicato: mayor puntos sindicato = mejor
                            sorted = [...playerScores].sort((a, b) => b.totalSindicato - a.totalSindicato);
                            leaderValue = sorted[0].totalSindicato;
                            getValue = (p) => p.totalSindicato;
                            unit = ' pts';
                            higherIsBetter = true;
                        } else {
                            // Stableford: mayor puntos stableford = mejor
                            sorted = [...playerScores].sort((a, b) => b.totalStableford - a.totalStableford);
                            leaderValue = sorted[0].totalStableford;
                            getValue = (p) => p.totalStableford;
                            unit = ' pts';
                            higherIsBetter = true;
                        }

                        return (
                            <tr className="border-t-2 border-gray-300 bg-yellow-50">
                                <td colSpan={21} className="p-3">
                                    <div className="text-xs font-bold mb-2">CLASIFICACIÓN</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {sorted.map((player, idx) => {
                                            const value = getValue(player);
                                            const diff = higherIsBetter ? value - leaderValue : value - leaderValue;

                                            // Formatear diferencia
                                            let displayText, textColor;
                                            if (idx === 0) {
                                                displayText = `${formatNumber(value)}${unit}`;
                                                textColor = '#2e7d32';
                                            } else if (diff === 0) {
                                                displayText = `${formatNumber(value)}${unit}`;
                                                textColor = '#000';
                                            } else {
                                                // Para Stableford y Sindicato, mostrar total y diferencia en paréntesis
                                                if (gameMode === 'stableford' || gameMode === 'sindicato') {
                                                    displayText = `${formatNumber(value)}${unit} (${formatNumber(diff)}${unit})`;
                                                } else {
                                                    displayText = `${formatNumber(diff)}${unit}`;
                                                }
                                                textColor = '#c62828';
                                            }

                                            return (
                                                <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: idx === 0 ? '#e8f5e9' : 'white', borderRadius: '4px' }}>
                                                    <span className="text-sm font-bold">{idx + 1}. {player.name}</span>
                                                    <span className="text-sm font-bold" style={{ color: textColor }}>
                                                        {displayText}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </td>
                            </tr>
                        );
                    })()}
                </tbody>
            </table>
        </div>
    );
}
