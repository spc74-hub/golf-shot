'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/lib/store';
import { MOCK_COURSES } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function RoundSetup() {
    const router = useRouter();
    const { startRound, currentRound } = useGame();
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);

    const [step, setStep] = useState(1);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [gameMode, setGameMode] = useState('stableford');
    const [useHandicap, setUseHandicap] = useState(true);
    const [handicapPercentage, setHandicapPercentage] = useState(100);
    const [sindicatoPoints, setSindicatoPoints] = useState([4, 2, 1, 0]); // Puntos por posición (1º, 2º, 3º, 4º)
    const [teamMode, setTeamMode] = useState('bestBall'); // 'bestBall' o 'goodBadBall'
    const [bestBallPoints, setBestBallPoints] = useState(2);
    const [worstBallPoints, setWorstBallPoints] = useState(1);
    const [roundDate, setRoundDate] = useState(new Date().toISOString().split('T')[0]); // Fecha de la partida
    const [courseLength, setCourseLength] = useState('18'); // '18', 'front9', 'back9'
    const [players, setPlayers] = useState([
        { id: 'p1', name: 'Jugador 1', handicapIndex: 18.0, teeBox: null, team: 'A', playingHandicap: null }
    ]);

    // Load courses from Firestore
    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            if (coursesSnapshot.empty) {
                // If no courses in Firestore, use mock data
                setCourses(MOCK_COURSES);
            } else {
                const coursesData = coursesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCourses(coursesData);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            // Fallback to mock data on error
            setCourses(MOCK_COURSES);
        } finally {
            setCoursesLoading(false);
        }
    };

    // Si ya hay partida activa, redirigir al juego
    useEffect(() => {
        if (currentRound && currentRound.players && currentRound.players.length > 0) {
            router.push('/round/play');
        }
    }, [currentRound, router]);

    // Calculate Playing Handicap (HDJ)
    const calculatePlayingHandicap = (handicapIndex, slope) => {
        return Math.round((handicapIndex * slope) / 113);
    };

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        // Set default tee box for first player - Blancas for Las Lomas, Amarillas for others
        const defaultTeeName = course.name === 'Las Lomas Bosque' ? 'Blancas' : 'Amarillas';
        const defaultTee = course.tees.find(t => t.name === defaultTeeName) || course.tees[0];
        setPlayers(prev => prev.map(p => {
            const playingHcp = calculatePlayingHandicap(p.handicapIndex, defaultTee.slope);
            return { ...p, teeBox: defaultTee, team: p.team || 'A', playingHandicap: playingHcp };
        }));
        setStep(2);
    };

    const addPlayer = () => {
        const newId = `p${players.length + 1}`;
        const defaultTeeName = selectedCourse.name === 'Las Lomas Bosque' ? 'Blancas' : 'Amarillas';
        const defaultTee = selectedCourse.tees.find(t => t.name === defaultTeeName) || selectedCourse.tees[0];
        // Alternate team assignment by default
        const defaultTeam = players.length % 2 === 0 ? 'A' : 'B';
        const playingHcp = calculatePlayingHandicap(24.0, defaultTee.slope);
        setPlayers([...players, { id: newId, name: `Jugador ${players.length + 1}`, handicapIndex: 24.0, teeBox: defaultTee, team: defaultTeam, playingHandicap: playingHcp }]);
    };

    const updatePlayer = (id, field, value) => {
        setPlayers(players.map(p => {
            if (p.id !== id) return p;

            const updated = { ...p, [field]: value };

            // Recalculate playing handicap if handicapIndex or teeBox changed
            if (field === 'handicapIndex' || field === 'teeBox') {
                const hcpIndex = field === 'handicapIndex' ? value : p.handicapIndex;
                const tee = field === 'teeBox' ? value : p.teeBox;
                if (hcpIndex && tee && tee.slope) {
                    updated.playingHandicap = calculatePlayingHandicap(hcpIndex, tee.slope);
                }
            }

            return updated;
        }));
    };

    const handleStart = () => {
        const settings = { gameMode, useHandicap, handicapPercentage, roundDate, courseLength };
        if (gameMode === 'sindicato') {
            settings.sindicatoPoints = sindicatoPoints.slice(0, players.length);
        }
        if (gameMode === 'team') {
            settings.teamMode = teamMode;
            settings.bestBallPoints = bestBallPoints;
            settings.worstBallPoints = worstBallPoints;
        }
        startRound(selectedCourse, players, settings);
        router.push('/round/play');
    };

    if (step === 1) {
        return (
            <div>
                <h1 className="mb-8">Selecciona Campo</h1>
                {coursesLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Cargando campos...</div>
                ) : courses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <p>No hay campos disponibles.</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                            Contacta con el administrador para añadir campos.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {courses.map(course => (
                            <div key={course.id} className="card" onClick={() => handleCourseSelect(course)} style={{ cursor: 'pointer' }}>
                                <h3 className="text-xl mb-2">{course.name}</h3>
                                <p className="text-sm">{course.holes} Hoyos • Par {course.par}</p>
                            </div>
                        ))}
                    </div>
                )}
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

            {/* Date Selection */}
            <div className="card mb-6">
                <label className="text-sm text-secondary mb-2 block">Fecha de la Partida</label>
                <input
                    type="date"
                    value={roundDate}
                    onChange={(e) => setRoundDate(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: '#333',
                        color: 'white'
                    }}
                />
            </div>

            {/* Course Length Selection */}
            <div className="card mb-6">
                <label className="text-sm text-secondary mb-2 block">Recorrido</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className={`btn ${courseLength === '18' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setCourseLength('18')}
                        style={{ flex: 1 }}
                    >
                        18 Hoyos
                    </button>
                    <button
                        className={`btn ${courseLength === 'front9' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setCourseLength('front9')}
                        style={{ flex: 1 }}
                    >
                        Front 9
                    </button>
                    <button
                        className={`btn ${courseLength === 'back9' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setCourseLength('back9')}
                        style={{ flex: 1 }}
                    >
                        Back 9
                    </button>
                </div>
            </div>

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
                        <option value="team">Equipos</option>
                    </select>
                </div>

                {/* Handicap toggle */}
                <div className="mb-4">
                    <label className="text-sm text-secondary mb-2 block">Handicap</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className={`btn ${useHandicap ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setUseHandicap(true)}
                            style={{ flex: 1 }}
                        >
                            Con Handicap
                        </button>
                        <button
                            className={`btn ${!useHandicap ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setUseHandicap(false)}
                            style={{ flex: 1 }}
                        >
                            Sin Handicap
                        </button>
                    </div>
                </div>

                {/* Handicap percentage (only if useHandicap) */}
                {useHandicap && (
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

                {/* Sindicato points config */}
                {gameMode === 'sindicato' && (
                    <div className="mt-4">
                        <label className="text-sm text-secondary mb-2 block">Puntos por posición en cada hoyo</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {players.map((_, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span className="text-xs mb-1">{idx + 1}º</span>
                                    <input
                                        type="number"
                                        value={sindicatoPoints[idx] || 0}
                                        onChange={(e) => {
                                            const newPoints = [...sindicatoPoints];
                                            newPoints[idx] = parseInt(e.target.value) || 0;
                                            setSindicatoPoints(newPoints);
                                        }}
                                        style={{ width: '50px', padding: '8px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ddd' }}
                                        min={0}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team mode config */}
                {gameMode === 'team' && (
                    <div className="mt-4">
                        <label className="text-sm text-secondary mb-2 block">Tipo de Juego por Equipos</label>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <button
                                className={`btn ${teamMode === 'bestBall' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setTeamMode('bestBall')}
                                style={{ flex: 1 }}
                            >
                                Best Ball
                            </button>
                            <button
                                className={`btn ${teamMode === 'goodBadBall' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setTeamMode('goodBadBall')}
                                style={{ flex: 1 }}
                            >
                                Good/Bad Ball
                            </button>
                        </div>

                        {teamMode === 'bestBall' && (
                            <p className="text-sm text-secondary">El equipo ganador recibe 1 punto por hoyo</p>
                        )}

                        {teamMode === 'goodBadBall' && (
                            <div>
                                <label className="text-sm text-secondary mb-2 block">Puntos por hoyo</label>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="text-xs block mb-1">Mejor Bola</label>
                                        <input
                                            type="number"
                                            value={bestBallPoints}
                                            onChange={(e) => setBestBallPoints(parseInt(e.target.value) || 0)}
                                            style={{ width: '100%', padding: '8px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ddd' }}
                                            min={0}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label className="text-xs block mb-1">Peor Bola</label>
                                        <input
                                            type="number"
                                            value={worstBallPoints}
                                            onChange={(e) => setWorstBallPoints(parseInt(e.target.value) || 0)}
                                            style={{ width: '100%', padding: '8px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ddd' }}
                                            min={0}
                                        />
                                    </div>
                                    <div style={{ padding: '0 8px', marginTop: '20px' }}>
                                        <span className="text-sm text-secondary">Total: {bestBallPoints + worstBallPoints}</span>
                                    </div>
                                </div>
                            </div>
                        )}
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

                        {/* Playing Handicap (HDJ) - Calculated and Editable */}
                        <div className="mt-4" style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label className="text-sm block" style={{ color: '#333' }}>
                                    <strong>Handicap de Juego (HDJ)</strong>
                                </label>
                                <span className="text-xs" style={{ color: '#666' }}>
                                    Slope: {player.teeBox?.slope || '-'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    value={player.playingHandicap || 0}
                                    onChange={(e) => updatePlayer(player.id, 'playingHandicap', parseInt(e.target.value) || 0)}
                                    style={{
                                        width: '80px',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '2px solid #1976d2',
                                        background: 'white',
                                        color: '#333',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                    }}
                                />
                                <span className="text-xs" style={{ color: '#666', flex: 1 }}>
                                    (Editable - calculado automáticamente)
                                </span>
                            </div>
                        </div>

                        {gameMode === 'team' && (
                            <div className="mt-4">
                                <label className="text-sm block mb-1">Equipo</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => updatePlayer(player.id, 'team', 'A')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: player.team === 'A' ? '2px solid #1976d2' : '1px solid #ccc',
                                            background: player.team === 'A' ? '#1976d2' : 'white',
                                            color: player.team === 'A' ? 'white' : '#333',
                                            fontWeight: player.team === 'A' ? 'bold' : 'normal',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Equipo A (Azul)
                                    </button>
                                    <button
                                        onClick={() => updatePlayer(player.id, 'team', 'B')}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '6px',
                                            border: player.team === 'B' ? '2px solid #d32f2f' : '1px solid #ccc',
                                            background: player.team === 'B' ? '#d32f2f' : 'white',
                                            color: player.team === 'B' ? 'white' : '#333',
                                            fontWeight: player.team === 'B' ? 'bold' : 'normal',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Equipo B (Rojo)
                                    </button>
                                </div>
                            </div>
                        )}
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
