'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/store';
import HoleInput from '@/components/HoleInput';
import { getStrokesReceivedForHole, calculateStablefordPoints } from '@/lib/golf-logic';

export default function PlayRound() {
    const router = useRouter();
    const { currentRound, updateScore, finishRound, confirmHole, reopenHole } = useGame();
    const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
    const [activePlayerId, setActivePlayerId] = useState(null);

    useEffect(() => {
        if (!currentRound) {
            router.push('/');
        } else if (!activePlayerId && currentRound.players.length > 0) {
            setActivePlayerId(currentRound.players[0].id);
        }
    }, [currentRound, router, activePlayerId]);

    if (!currentRound || !activePlayerId) return null;

    const currentHole = currentRound.holes[currentHoleIndex];
    const activePlayer = currentRound.players.find(p => p.id === activePlayerId);
    const currentScore = activePlayer.scores[currentHole.number] || { strokes: currentHole.par, putts: 2 };
    const isHoleCompleted = currentRound.completedHoles?.includes(currentHole.number);

    
    // Calculate Stableford Data
    const strokesReceived = getStrokesReceivedForHole(activePlayer.playingHandicap, currentHole.handicap);
    const stablefordPoints = calculateStablefordPoints(currentScore.strokes, currentHole.par, strokesReceived);

    const handleNextHole = () => {
        if (!isHoleCompleted) {
            if (!confirm('El hoyo no está confirmado. ¿Confirmar y avanzar?')) return;
            confirmHole(currentHole.number);
        }

        if (currentHoleIndex < currentRound.holes.length - 1) {
            setCurrentHoleIndex(prev => prev + 1);
            setActivePlayerId(currentRound.players[0].id); // Volver al primer jugador
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
            setActivePlayerId(currentRound.players[0].id); // Volver al primer jugador
        }
    };

    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header Info */}
            <div className="mb-4 card" style={{ padding: '12px', background: 'var(--primary)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <button
                        onClick={() => router.push('/')}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                        ← Inicio
                    </button>
                    <div className="text-right">
                        <button
                            onClick={() => router.push('/round/card')}
                            className="text-sm font-bold underline"
                            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Ver Tarjeta
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 className="text-2xl font-bold">Hoyo {currentHole.number}</h2>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>Par {currentHole.par} • Hcp {currentHole.handicap}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{activePlayer.playingHandicap}</div>
                        <div className="text-xs" style={{ color: 'rgba(255,255,255,0.9)' }}>Juego Hcp</div>
                    </div>
                </div>
            </div>

            {/* Player Selector */}
            <div className="mb-4">
                <select
                    value={activePlayerId}
                    onChange={(e) => setActivePlayerId(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: '2px solid var(--primary)',
                        background: 'var(--primary)',
                        color: 'white',
                        cursor: 'pointer',
                        appearance: 'none',
                        textAlign: 'center'
                    }}
                >
                    {currentRound.players.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ↑ Toca para cambiar de jugador
                </div>
            </div>

            {/* Input Area */}
            <div key={activePlayerId} className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="text-center mb-6">
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Puntos concedidos en este hoyo
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                        {Array.from({ length: strokesReceived }).map((_, i) => (
                            <span key={i} style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: 'var(--accent)', display: 'inline-block'
                            }} />
                        ))}
                        {strokesReceived === 0 && <span className="text-sm">0</span>}
                    </div>
                </div>

                <HoleInput
                    label="Golpes (Total)"
                    value={currentScore.strokes}
                    onChange={(val) => updateScore(activePlayerId, currentHole.number, 'strokes', val)}
                />

                <div className="text-center mb-6 p-2" style={{ background: 'var(--surface-highlight)', borderRadius: '8px' }}>
                    <span className="text-sm block">Puntos Stableford</span>
                    <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{stablefordPoints}</span>
                </div>

                <HoleInput
                    label="Putts"
                    value={currentScore.putts}
                    onChange={(val) => updateScore(activePlayerId, currentHole.number, 'putts', val)}
                    min={0}
                />

                <div className="mt-6 text-center">
                    {isHoleCompleted ? (
                        <button
                            onClick={() => reopenHole(currentHole.number)}
                            className="btn btn-secondary"
                            style={{
                                background: '#ff9800',
                                color: 'white',
                                borderColor: '#ff9800'
                            }}
                        >
                            Editar Hoyo
                        </button>
                    ) : (
                        <button
                            onClick={() => confirmHole(currentHole.number)}
                            className="btn btn-primary"
                        >
                            Confirmar Hoyo
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="grid-2 mt-4" style={{ marginTop: 'auto' }}>
                <button
                    className="btn btn-secondary"
                    onClick={handlePrevHole}
                    disabled={currentHoleIndex === 0}
                    style={{ opacity: currentHoleIndex === 0 ? 0.5 : 1 }}
                >
                    Anterior
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleNextHole}
                >
                    {currentHoleIndex === currentRound.holes.length - 1 ? 'Terminar' : 'Siguiente'}
                </button>
            </div>
        </div>
    );
}
