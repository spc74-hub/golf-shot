'use client';

import React from 'react';
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
 // Only show back 9
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

 // Render a single table for a set of 9 holes
 const renderNineTable = (nineHoles, label) => {
 if (nineHoles.length === 0) return null;

 const nineTotals = players.map(p => getTotals(nineHoles, p));

 return (
 <div className="overflow-x-auto scorecard-table-wrapper mb-3" style={{
 maxWidth: '100%',
 boxShadow: '0 0 10px rgba(0,0,0,0.05)',
 borderRadius: '8px',
 WebkitOverflowScrolling: 'touch',
 overscrollBehavior: 'contain'
 }}>
 <style dangerouslySetInnerHTML={{__html: `
 .scorecard-table-wrapper {
 border: 2px solid #333;
 }
 .scorecard-table-wrapper table {
 border-spacing: 0;
 border-collapse: collapse;
 }
 .scorecard-table-wrapper td,
 .scorecard-table-wrapper th {
 border: none !important;
 }
 .scorecard-table-wrapper .total-column {
 border-left: 2px solid #333 !important;
 }
 `}} />
 <table className="w-full bg-white">
 <thead>
 <tr className="bg-gray-100">
 <th className="p-1 text-left text-xs font-bold sticky left-0 bg-gray-100 z-20" style={{ minWidth: '70px' }}>
 {label}
 </th>
 {nineHoles.map(hole => (
 <th key={hole.number} className="p-0.5 text-center text-xs min-w-[28px]">
 {hole.number}
 </th>
 ))}
 <th className="p-0.5 text-center text-xs font-bold bg-gray-100 total-column">
 {label}
 </th>
 </tr>
 </thead>
 <tbody>
 {/* Course Info Rows */}
 <tr>
 <td className="p-1 sticky left-0 bg-white z-10" style={{ fontSize: '0.65rem', fontWeight: '600' }}>Metros</td>
 {nineHoles.map(hole => (
 <td key={hole.number} className="p-1 text-center" style={{ fontSize: '0.6rem', letterSpacing: '0.3px' }}>{hole.distance}</td>
 ))}
 <td className="p-1 text-center font-bold bg-gray-50 total-column" style={{ fontSize: '0.65rem' }}>
 {nineHoles.reduce((a, h) => a + h.distance, 0)}
 </td>
 </tr>
 <tr>
 <td className="p-1 text-xs font-semibold sticky left-0 bg-white z-10">Par</td>
 {nineHoles.map(hole => (
 <td key={hole.number} className="p-1 text-center text-xs">{hole.par}</td>
 ))}
 <td className="p-1 text-center text-xs font-bold bg-gray-50 total-column">
 {nineHoles.reduce((a, h) => a + h.par, 0)}
 </td>
 </tr>
 <tr>
 <td className="p-1 text-xs font-semibold sticky left-0 bg-white z-10">Hcp</td>
 {nineHoles.map(hole => (
 <td key={hole.number} className="p-1 text-center text-xs">{hole.handicap}</td>
 ))}
 <td className="p-1 text-center bg-gray-50 total-column">-</td>
 </tr>

 {/* Players Rows */}
 {players.map((player, playerIdx) => {
 const totals = nineTotals[playerIdx];
 const isTeamMode = round.settings?.gameMode === 'team';
 const teamColor = isTeamMode && player.team === 'A' ? '#1976d2' : isTeamMode && player.team === 'B' ? '#d32f2f' : 'inherit';

 return (
 <React.Fragment key={player.id}>
 {/* Player Name with Handicap Dots */}
 <tr className="bg-red-50">
 <td className="p-1 text-xs font-semibold sticky left-0 bg-red-50 z-10">
 {player.name}
 <div style={{ fontSize: '0.65rem' }} className="font-normal text-gray-500">Hcp {player.playingHandicap}</div>
 </td>
 {nineHoles.map(hole => {
 const strokes = getStrokesReceivedForHole(player.playingHandicap, hole.handicap);
 const dots = '•'.repeat(strokes);
 return (
 <td key={hole.number} className="p-0.5 text-center text-xs" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
 {dots}
 </td>
 );
 })}
 <td className="p-0.5 text-center bg-red-100 total-column"></td>
 </tr>

 {/* Player Scores */}
 <tr>
 <td className="p-1 text-xs font-bold sticky left-0 bg-white z-10">
 <span style={{ color: teamColor }}>{player.name}</span>
 </td>
 {nineHoles.map(hole => {
 const isConfirmed = round.completedHoles?.includes(hole.number);
 const score = isConfirmed ? player.scores[hole.number] : null;
 const bg = score ? getScoreColor(score.strokes, hole.par) : 'transparent';
 const color = score ? 'white' : 'inherit';
 const strokes = getStrokesReceivedForHole(player.playingHandicap, hole.handicap);
 const dots = '•'.repeat(strokes);

 return (
 <td key={hole.number} className="p-0.5 text-center">
 {score ? (
 <div style={{ position: 'relative' }}>
 <div style={{
 background: bg, color: color,
 width: '22px', height: '22px',
 borderRadius: '3px', margin: '0 auto',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: '0.75rem', fontWeight: 'bold'
 }}>
 {score.strokes}
 </div>
 {dots && (
 <div style={{
 position: 'absolute',
 top: '-6px',
 left: '50%',
 transform: 'translateX(-50%)',
 fontSize: '0.55rem',
 color: '#d32f2f',
 fontWeight: 'bold',
 lineHeight: 1
 }}>
 {dots}
 </div>
 )}
 </div>
 ) : '-'}
 </td>
 );
 })}
 <td className="p-1 text-center font-bold bg-gray-50 total-column">
 {totals.strokes || '-'}
 </td>
 </tr>

 {/* Performance vs HDJ Row */}
 <tr style={{ background: '#fff3e0' }}>
 <td className="p-1 text-xs sticky left-0 z-10" style={{ background: '#fff3e0', fontSize: '0.65rem' }}>
 vs HDJ
 </td>
 {nineHoles.map(hole => {
 const isConfirmed = round.completedHoles?.includes(hole.number);
 if (!isConfirmed) return <td key={hole.number} className="p-0.5 text-center" style={{ fontSize: '0.6rem' }}>-</td>;

 const score = player.scores[hole.number];
 const strokesReceived = getStrokesReceivedForHole(player.playingHandicap, hole.handicap);
 const points = calculateStablefordPoints(score.strokes, hole.par, strokesReceived);

 let label = '';
 let color = '#666';
 if (points === 0) { label = '2B+'; color = '#212121'; } // Negro - Triple+ bogey
 else if (points === 1) { label = 'BOG'; color = '#43a047'; } // Verde - Bogey
 else if (points === 2) { label = 'PAR'; color = '#1e88e5'; } // Azul - Par
 else if (points === 3) { label = 'BIR'; color = '#e53935'; } // Rojo - Birdie
 else if (points === 4) { label = 'EAG'; color = '#FFD700'; } // Amarillo dorado - Eagle
 else if (points > 4) { label = 'ALB'; color = '#FFD700'; } // Amarillo dorado - Albatross

 return (
 <td key={hole.number} className="p-0.5 text-center" style={{ color, fontWeight: 'bold', fontSize: '0.6rem' }}>
 {label}
 </td>
 );
 })}
 <td className="p-1 text-center text-xs font-bold total-column" style={{ background: '#ffe0b2' }}>
 {(() => {
 const completedHoles = nineHoles.filter(h => round.completedHoles?.includes(h.number)).length;
 if (completedHoles === 0) return '-';
 const expectedPoints = completedHoles * 2;
 const diff = totals.stableford - expectedPoints;
 const color = diff > 0 ? '#2e7d32' : diff < 0 ? '#c62828' : '#1976d2';
 return <span style={{ color }}>{diff > 0 ? '+' : ''}{diff}</span>;
 })()}
 </td>
 </tr>

 {/* Putts Row */}
 <tr className="bg-blue-50">
 <td className="p-1 text-xs sticky left-0 bg-blue-50 z-10">
 Putts
 </td>
 {nineHoles.map(hole => {
 const isConfirmed = round.completedHoles?.includes(hole.number);
 const score = isConfirmed ? player.scores[hole.number] : null;
 return (
 <td key={hole.number} className="p-1 text-center text-xs">
 {score?.putts || '-'}
 </td>
 );
 })}
 <td className="p-1 text-center text-xs font-bold bg-blue-100 total-column">
 {totals.putts || '-'}
 </td>
 </tr>

 {/* Stableford Row */}
 <tr className="bg-gray-50">
 <td className="p-1 text-xs sticky left-0 bg-gray-50 z-10">
 STB
 </td>
 {nineHoles.map(hole => {
 const isConfirmed = round.completedHoles?.includes(hole.number);
 if (!isConfirmed) return <td key={hole.number} className="p-1 text-center text-xs">-</td>;
 const score = player.scores[hole.number];
 const strokesReceived = getStrokesReceivedForHole(player.playingHandicap, hole.handicap);
 const points = calculateStablefordPoints(score.strokes, hole.par, strokesReceived);
 return <td key={hole.number} className="p-1 text-center text-xs">{points}</td>;
 })}
 <td className="p-1 text-center text-xs font-bold total-column">
 {totals.stableford || '-'}
 </td>
 </tr>
 </React.Fragment>
 );
 })}
 </tbody>
 </table>
 </div>
 );
 };

 // Helper function to calculate score distribution
 const getScoreDistribution = (player, useHandicap) => {
 const distribution = {
 eagles: 0,       // -2 or better vs par
 birdies: 0,      // -1 vs par
 pars: 0,         // 0 vs par
 bogeys: 0,       // +1 vs par
 doubleBogeys: 0, // +2 vs par
 worse: 0         // +3 or worse vs par
 };

 round.holes.forEach(hole => {
 if (!round.completedHoles?.includes(hole.number)) return;
 const score = player.scores[hole.number];
 if (!score) return;

 const strokesReceived = useHandicap ? getStrokesReceivedForHole(player.playingHandicap, hole.handicap) : 0;
 const netScore = score.strokes - strokesReceived;
 const diff = netScore - hole.par;

 if (diff <= -2) distribution.eagles++;
 else if (diff === -1) distribution.birdies++;
 else if (diff === 0) distribution.pars++;
 else if (diff === 1) distribution.bogeys++;
 else if (diff === 2) distribution.doubleBogeys++;
 else distribution.worse++;
 });

 return distribution;
 };

 // Calculate grand totals for classification
 const playersTotals = players.map(player => {
 const outTotals = getTotals(frontNine, player);
 const inTotals = getTotals(backNine, player);

 // Calculate Sindicato points if applicable
 let sindicatoTotal = 0;
 if (round.settings?.gameMode === 'sindicato') {
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
 totalPutts: outTotals.putts + inTotals.putts,
 totalSindicato: sindicatoTotal,
 outTotals,
 inTotals,
 scratchDistribution: getScoreDistribution(player, false),
 hdjDistribution: getScoreDistribution(player, true)
 };
 });

 return (
 <div>
 {/* Front Nine Table */}
 {frontNine.length > 0 && renderNineTable(frontNine, courseLength === 'front9' ? 'HOYOS' : 'OUT (1-9)')}

 {/* Back Nine Table */}
 {backNine.length > 0 && renderNineTable(backNine, courseLength === 'back9' ? 'HOYOS' : 'IN (10-18)')}

 {/* Grand Total Summary (only for 18 holes) */}
 {courseLength === '18' && (
 <div className="overflow-x-auto scorecard-table-wrapper" style={{
 maxWidth: '100%',
 boxShadow: '0 0 10px rgba(0,0,0,0.05)',
 borderRadius: '8px',
 WebkitOverflowScrolling: 'touch',
 overscrollBehavior: 'contain'
 }}>
 <style dangerouslySetInnerHTML={{__html: `
 .scorecard-table-wrapper {
 border: 2px solid #333;
 }
 .scorecard-table-wrapper table {
 border-spacing: 0;
 border-collapse: collapse;
 }
 .scorecard-table-wrapper td,
 .scorecard-table-wrapper th {
 border: none !important;
 }
 `}} />
 <table className="w-full bg-white">
 <thead>
 <tr className="bg-gray-800 text-white">
 <th className="p-2 text-left text-xs font-bold">TOTAL 18 HOYOS</th>
 <th className="p-2 text-center text-xs font-bold">Golpes</th>
 <th className="p-2 text-center text-xs font-bold">Putts</th>
 <th className="p-2 text-center text-xs font-bold">STB</th>
 <th className="p-2 text-center text-xs font-bold">vs HDJ</th>
 </tr>
 </thead>
 <tbody>
 {playersTotals.map(player => {
 const completedHoles = round.holes.filter(h => round.completedHoles?.includes(h.number)).length;
 const expectedPoints = completedHoles * 2;
 const diff = player.totalStableford - expectedPoints;
 const diffColor = diff > 0 ? '#2e7d32' : diff < 0 ? '#c62828' : '#1976d2';

 return (
 <tr key={player.id} className="border-t">
 <td className="p-2 text-sm font-bold">{player.name}</td>
 <td className="p-2 text-center text-sm font-bold">{player.totalStrokes || '-'}</td>
 <td className="p-2 text-center text-sm">{player.totalPutts || '-'}</td>
 <td className="p-2 text-center text-sm font-bold">{player.totalStableford || '-'}</td>
 <td className="p-2 text-center text-sm font-bold">
 <span style={{ color: diffColor }}>
 {completedHoles > 0 ? (diff > 0 ? '+' : '') + diff : '-'}
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>

 {/* Statistics Section */}
 <div className="mt-4">
 {playersTotals.map(player => (
 <div key={player.id} className="mb-4">
 <div className="text-sm font-bold mb-2" style={{ color: 'var(--primary)' }}>
 {player.name} - Estadísticas
 </div>

 {/* Scratch Statistics */}
 <div className="mb-3 p-3 bg-white rounded-lg border border-gray-300">
 <div className="text-xs font-semibold mb-2" style={{ color: '#666' }}>
 Resultado Scratch (sin HDJ)
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
 <div style={{ textAlign: 'center', padding: '6px', background: '#FFD700', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#333' }}>Eagles</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.scratchDistribution.eagles}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#e53935', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>Birdies</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.scratchDistribution.birdies}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#1e88e5', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>Pares</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.scratchDistribution.pars}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#43a047', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>Bogeys</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.scratchDistribution.bogeys}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#757575', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>Dobles</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.scratchDistribution.doubleBogeys}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#212121', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>+Dobles</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.scratchDistribution.worse}
 </div>
 </div>
 </div>
 </div>

 {/* HDJ Statistics */}
 <div className="p-3 bg-white rounded-lg border border-gray-300">
 <div className="text-xs font-semibold mb-2" style={{ color: '#666' }}>
 Resultado HDJ (con hándicap)
 </div>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
 <div style={{ textAlign: 'center', padding: '6px', background: '#FFD700', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#333' }}>Eagles</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.hdjDistribution.eagles}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#e53935', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>Birdies</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.hdjDistribution.birdies}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#1e88e5', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>Pares</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.hdjDistribution.pars}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#43a047', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>Bogeys</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.hdjDistribution.bogeys}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#757575', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>Dobles</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.hdjDistribution.doubleBogeys}
 </div>
 </div>
 <div style={{ textAlign: 'center', padding: '6px', background: '#212121', borderRadius: '4px' }}>
 <div style={{ fontSize: '0.65rem', color: '#fff' }}>+Dobles</div>
 <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
 {player.hdjDistribution.worse}
 </div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Clasificación */}
 {players.length >= 2 && round.settings?.gameMode !== 'team' && (
 <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
 <div className="text-sm font-bold mb-3">CLASIFICACIÓN</div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {(() => {
 const gameMode = round.settings?.gameMode || 'stableford';
 let sorted, leaderValue, getValue, unit, higherIsBetter;

 if (gameMode === 'stroke') {
 sorted = [...playersTotals].sort((a, b) => a.totalStrokes - b.totalStrokes);
 leaderValue = sorted[0].totalStrokes;
 getValue = (p) => p.totalStrokes;
 unit = ' gps';
 higherIsBetter = false;
 } else if (gameMode === 'sindicato') {
 sorted = [...playersTotals].sort((a, b) => b.totalSindicato - a.totalSindicato);
 leaderValue = sorted[0].totalSindicato;
 getValue = (p) => p.totalSindicato;
 unit = ' pts';
 higherIsBetter = true;
 } else {
 sorted = [...playersTotals].sort((a, b) => b.totalStableford - a.totalStableford);
 leaderValue = sorted[0].totalStableford;
 getValue = (p) => p.totalStableford;
 unit = ' pts';
 higherIsBetter = true;
 }

 return sorted.map((player, idx) => {
 const value = getValue(player);
 const diff = higherIsBetter ? value - leaderValue : value - leaderValue;

 let displayText, textColor;
 if (idx === 0) {
 displayText = `${formatNumber(value)}${unit}`;
 textColor = '#2e7d32';
 } else if (diff === 0) {
 displayText = `${formatNumber(value)}${unit}`;
 textColor = '#000';
 } else {
 if (gameMode === 'stableford' || gameMode === 'sindicato') {
 displayText = `${formatNumber(value)}${unit} (${formatNumber(diff)}${unit})`;
 } else {
 displayText = `${formatNumber(diff)}${unit}`;
 }
 textColor = '#c62828';
 }

 return (
 <div key={player.id} style={{
 display: 'flex',
 justifyContent: 'space-between',
 alignItems: 'center',
 padding: '8px 12px',
 background: idx === 0 ? '#e8f5e9' : 'white',
 borderRadius: '6px',
 border: idx === 0 ? '2px solid #2e7d32' : '1px solid #ddd'
 }}>
 <span className="text-sm font-bold">
 {idx + 1}. {player.name}
 </span>
 <span className="text-sm font-bold" style={{ color: textColor }}>
 {displayText}
 </span>
 </div>
 );
 });
 })()}
 </div>
 </div>
 )}
 </div>
 );
}
