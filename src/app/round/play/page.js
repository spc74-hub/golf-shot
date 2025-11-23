'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/store';
import { getStrokesReceivedForHole, calculateStablefordPoints } from '@/lib/golf-logic';

export default function PlayRound() {
    const router = useRouter();
    const { currentRound, updateScore, finishRound, saveProgress, confirmHole, reopenHole } = useGame();
    const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
    const [showHoleSelector, setShowHoleSelector] = useState(false);

    useEffect(() => {
        if (!currentRound) {
            router.push('/');
        }
    }, [currentRound, router]);

    if (!currentRound) return null;

    const currentHole = currentRound.holes[currentHoleIndex];
    const isHoleCompleted = currentRound.completedHoles?.includes(currentHole.number);

    const handleNextHole = () => {
        if (!isHoleCompleted) {
            if (!confirm('El hoyo no está confirmado. ¿Confirmar y avanzar?')) return;
            confirmHole(currentHole.number);
        }

        if (currentHoleIndex < currentRound.holes.length - 1) {
            setCurrentHoleIndex(prev => prev + 1);
        } else {
            if (confirm('¿Terminar la ronda?')) {
                finishRound();
                router.push('/history');
            }
        }
    };

    const handlePrevHole = () => {
        if (currentHoleIndex > 0) {
            setCurrentHoleIndex(prev => prev - 1);
        }
    };

    const adjustScore = (playerId, field, delta) => {
        const player = currentRound.players.find(p => p.id === playerId);
        const currentValue = player.scores[currentHole.number]?.[field] || (field === 'strokes' ? currentHole.par : 2);
        const newValue = Math.max(field === 'strokes' ? 1 : 0, currentValue + delta);
        updateScore(playerId, currentHole.number, field, newValue);
    };

    const handleFinishRound = () => {
        if (confirm('¿Finalizar y guardar la partida?\n\nLa partida quedará marcada como "Finalizada" en el historial.')) {
            finishRound();
            router.push('/history');
        }
    };

    const handleConfirmHole = () => {
        confirmHole(currentHole.number);
        // Advance to next hole after confirming
        if (currentHoleIndex < currentRound.holes.length - 1) {
            setCurrentHoleIndex(prev => prev + 1);
        }
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '20px' }}>
            {/* Compact Header */}
            <div style={{
                padding: '10px 16px',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => router.push('/')}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                    ← Inicio
                </button>
                <div style={{ textAlign: 'center', position: 'relative' }}>
                    <div
                        onClick={() => setShowHoleSelector(!showHoleSelector)}
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        Hoyo {currentHole.number}
                        <span style={{ fontSize: '0.8rem' }}>▼</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Par {currentHole.par} • Hcp {currentHole.handicap}</div>

                    {/* Hole Selector Dropdown */}
                    {showHoleSelector && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginTop: '8px',
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            padding: '8px',
                            zIndex: 1000,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '6px',
                            minWidth: '280px'
                        }}>
                            {currentRound.holes.map((hole, idx) => {
                                const isConfirmed = currentRound.completedHoles?.includes(hole.number);
                                const isCurrent = idx === currentHoleIndex;
                                return (
                                    <button
                                        key={hole.number}
                                        onClick={() => {
                                            setCurrentHoleIndex(idx);
                                            setShowHoleSelector(false);
                                        }}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: isCurrent ? '2px solid var(--primary)' : '1px solid #ddd',
                                            background: isConfirmed ? '#4caf50' : 'white',
                                            color: isConfirmed ? 'white' : '#333',
                                            fontWeight: isCurrent ? 'bold' : 'normal',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {hole.number}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => router.push('/round/card')}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                    Ver Tarjeta
                </button>
            </div>

            {/* Players List */}
            <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentRound.players.map(player => {
                    const score = player.scores[currentHole.number] || { strokes: currentHole.par, putts: 2 };
                    const strokesReceived = getStrokesReceivedForHole(player.playingHandicap, currentHole.handicap);
                    const stablefordPoints = calculateStablefordPoints(score.strokes, currentHole.par, strokesReceived);

                    return (
                        <div key={player.id} style={{
                            background: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            {/* Player Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{player.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#666' }}>HDJ {player.playingHandicap}</div>
                                </div>
                                {strokesReceived > 0 && (
                                    <div style={{ fontSize: '1.2rem', color: '#d32f2f', fontWeight: 'bold' }}>
                                        {'•'.repeat(strokesReceived)}
                                    </div>
                                )}
                            </div>

                            {/* Score Inputs - Compact Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                {/* Golpes */}
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '4px', textAlign: 'center' }}>Golpes</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            onClick={() => adjustScore(player.id, 'strokes', -1)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                border: '1px solid #ddd',
                                                background: 'white',
                                                fontSize: '1.2rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            -
                                        </button>
                                        <div style={{
                                            flex: 1,
                                            textAlign: 'center',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {score.strokes}
                                        </div>
                                        <button
                                            onClick={() => adjustScore(player.id, 'strokes', 1)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                border: '1px solid #ddd',
                                                background: 'white',
                                                fontSize: '1.2rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Putts */}
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '4px', textAlign: 'center' }}>Putts</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            onClick={() => adjustScore(player.id, 'putts', -1)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                border: '1px solid #ddd',
                                                background: 'white',
                                                fontSize: '1.2rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            -
                                        </button>
                                        <div style={{
                                            flex: 1,
                                            textAlign: 'center',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {score.putts}
                                        </div>
                                        <button
                                            onClick={() => adjustScore(player.id, 'putts', 1)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                border: '1px solid #ddd',
                                                background: 'white',
                                                fontSize: '1.2rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stableford Points */}
                            <div style={{
                                background: '#f5f5f5',
                                padding: '6px',
                                borderRadius: '6px',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '0.7rem', color: '#666' }}>Pts STB: </span>
                                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stablefordPoints}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Save Progress Button */}
            <div style={{ padding: '0 16px 12px' }}>
                <button
                    onClick={() => {
                        if (confirm('¿Guardar progreso de la partida?')) {
                            saveProgress();
                        }
                    }}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    💾 Guardar Progreso
                </button>
            </div>

            {/* Finish Round Button */}
            <div style={{ padding: '0 16px 12px' }}>
                <button
                    onClick={handleFinishRound}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    ✅ Finalizar Partida
                </button>
            </div>

            {/* Confirm/Edit Button */}
            <div style={{ padding: '0 16px 12px' }}>
                {isHoleCompleted ? (
                    <button
                        onClick={() => reopenHole(currentHole.number)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Editar Hoyo
                    </button>
                ) : (
                    <button
                        onClick={handleConfirmHole}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Confirmar Hoyo
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px' }}>
                <button
                    onClick={handlePrevHole}
                    disabled={currentHoleIndex === 0}
                    style={{
                        padding: '14px',
                        background: currentHoleIndex === 0 ? '#ccc' : 'white',
                        color: currentHoleIndex === 0 ? '#999' : '#333',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: currentHoleIndex === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Anterior
                </button>
                <button
                    onClick={handleNextHole}
                    style={{
                        padding: '14px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    {currentHoleIndex === currentRound.holes.length - 1 ? 'Terminar' : 'Siguiente'}
                </button>
            </div>
        </div>
    );
}
