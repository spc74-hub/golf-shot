'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/store';
import { MOCK_COURSES } from '@/lib/mock-data';

export default function RoundSetup() {
    const router = useRouter();
    const { startRound, currentRound } = useGame();

    const [step, setStep] = useState(1);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [gameMode, setGameMode] = useState('stableford');
    const [handicapPercentage, setHandicapPercentage] = useState(100);
    const [players, setPlayers] = useState([
        { id: 'p1', name: 'Jugador 1', handicapIndex: 18.0, teeBox: null }
    ]);

    useEffect(() => {
        if (currentRound && currentRound.players && currentRound.players.length > 0) {
            // Pre-fill players from current round to prevent data loss on navigation
            setPlayers(currentRound.players.map(p => ({
                id: p.id,
                name: p.name,
                handicapIndex: p.handicapIndex || 18.0,
                teeBox: p.teeBox
            })));

            // Also try to restore course if possible, though step 1 handles selection
            if (currentRound.course) {
                setSelectedCourse(currentRound.course);
                setStep(2); // Skip to player setup if course is known
            }
        }
    }, [currentRound]);

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        // Set default tee box for first player
        const defaultTee = course.tees.find(t => t.name === 'Amarillas') || course.tees[0];
        setPlayers(prev => prev.map(p => ({ ...p, teeBox: defaultTee })));
        setStep(2);
    };

    const addPlayer = () => {
        const newId = `p${players.length + 1}`;
        const defaultTee = selectedCourse.tees.find(t => t.name === 'Amarillas') || selectedCourse.tees[0];
        setPlayers([...players, { id: newId, name: `Jugador ${players.length + 1}`, handicapIndex: 24.0, teeBox: defaultTee }]);
    };

    const updatePlayer = (id, field, value) => {
        setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleStart = () => {
        startRound(selectedCourse, players, { gameMode, handicapPercentage });
        router.push('/round/play');
    };

    if (step === 1) {
        return (
            <div>
                <h1 className="mb-8">Selecciona Campo</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {MOCK_COURSES.map(course => (
                        <div key={course.id} className="card" onClick={() => handleCourseSelect(course)} style={{ cursor: 'pointer' }}>
                            <h3 className="text-xl mb-2">{course.name}</h3>
                            <p className="text-sm">{course.holes} Hoyos • Par {course.par}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <button onClick={() => setStep(1)} className="text-sm text-primary mb-4">← Cambiar Campo</button>
                <h1 className="text-xl">{selectedCourse.name}</h1>
            </div>

            <h1 className="mb-6">Configuración</h1>

            {/* Game Mode Selection */}
            <div className="card mb-6">
                <h3 className="text-lg mb-4">Modalidad de Juego</h3>
                <div className="mb-4">
                    <select
                        value={gameMode}
                        onChange={(e) => setGameMode(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    >
                        <option value="stableford">Stableford</option>
                        <option value="stroke">Stroke Play (Medal)</option>
                        <option value="sindicato">Sindicato (Puntos)</option>
                    </select>
                </div>

                {gameMode === 'sindicato' && (
                    <div>
                        <label className="text-sm text-secondary mb-2 block">Porcentaje de Handicap</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className={`btn ${handicapPercentage === 100 ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setHandicapPercentage(100)}
                                style={{ flex: 1 }}
                            >
                                100%
                            </button>
                            <button
                                className={`btn ${handicapPercentage === 75 ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setHandicapPercentage(75)}
                                style={{ flex: 1 }}
                            >
                                75%
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3>Jugadores ({players.length})</h3>
                    <button onClick={addPlayer} className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px' }}>
                        + Añadir
                    </button>
                </div>

                {players.map((player, index) => (
                    <div key={player.id} className="card mb-4">
                        <div className="mb-4">
                            <label className="text-sm block mb-1">Nombre</label>
                            <input
                                type="text"
                                value={player.name}
                                onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div className="grid-2">
                            <div>
                                <label className="text-sm block mb-1">Hcp Index</label>
                                <input
                                    type="number"
                                    value={player.handicapIndex}
                                    onChange={(e) => updatePlayer(player.id, 'handicapIndex', parseFloat(e.target.value))}
                                    step="0.1"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div>
                                <label className="text-sm block mb-1">Barras</label>
                                <select
                                    value={player.teeBox?.name}
                                    onChange={(e) => {
                                        const tee = selectedCourse.tees.find(t => t.name === e.target.value);
                                        updatePlayer(player.id, 'teeBox', tee);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        background: '#333',
                                        border: '1px solid #444',
                                        color: 'white',
                                        borderRadius: '4px'
                                    }}
                                >
                                    {selectedCourse.tees.map(tee => (
                                        <option key={tee.name} value={tee.name}>{tee.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={addPlayer} className="btn btn-secondary mb-4">
                    + Añadir Jugador
                </button>
            </div>

            <button onClick={handleStart} className="btn btn-primary">
                Empezar Partida ({players.length} Jugadores)
            </button>
        </div>
    );
}
