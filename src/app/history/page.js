'use client';

import { useGame } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function History() {
    const router = useRouter();
    const { history, deleteRound, continueRound, reopenFinishedRound } = useGame();

    if (!history || history.length === 0) {
        return (
            <div className="text-center" style={{ marginTop: '40px' }}>
                <h1 className="mb-4">Historial</h1>
                <p className="mb-8">No has jugado ninguna ronda aún.</p>
                <Link href="/" className="btn btn-primary">
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="mb-8">
                <h1>Historial</h1>
                <Link href="/" className="text-sm text-primary">Volver</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {history.map(round => {
                    const date = new Date(round.date).toLocaleDateString();
                    const isFinished = round.isFinished !== false; // Default to finished if not specified

                    return (
                        <div key={round.id} className="card">
                            {/* Status Badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h3 className="text-xl">{round.courseName}</h3>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    background: isFinished ? '#4caf50' : '#ff9800',
                                    color: 'white'
                                }}>
                                    {isFinished ? 'Finalizada' : 'En Progreso'}
                                </span>
                            </div>

                            <p className="text-sm mb-4">{date} • {round.players.length} Jugadores</p>

                            {/* Players Scores */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                {round.players.map(p => {
                                    // Only count strokes from confirmed holes
                                    const totalStrokes = round.holes.reduce((acc, hole) => {
                                        if (round.completedHoles?.includes(hole.number)) {
                                            const score = p.scores[hole.number];
                                            return acc + (score?.strokes || 0);
                                        }
                                        return acc;
                                    }, 0);
                                    return (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                                            <span>{p.name}</span>
                                            <span className="font-bold">{totalStrokes || '-'}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'grid', gridTemplateColumns: isFinished ? '1fr 1fr 1fr' : '1fr 1fr', gap: '8px' }}>
                                <Link
                                    href={`/history/detail?id=${round.id}`}
                                    style={{
                                        padding: '10px',
                                        background: '#2196F3',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        textDecoration: 'none',
                                        display: 'block'
                                    }}
                                >
                                    Ver Detalle
                                </Link>

                                {!isFinished ? (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            continueRound(round);
                                            router.push('/round/play');
                                        }}
                                        style={{
                                            padding: '10px',
                                            background: '#4caf50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Continuar
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (confirm('¿Reabrir esta partida para editarla?')) {
                                                reopenFinishedRound(round);
                                                router.push('/round/play');
                                            }
                                        }}
                                        style={{
                                            padding: '10px',
                                            background: '#ff9800',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Editar
                                    </button>
                                )}

                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm('¿Estás seguro de eliminar esta partida?')) {
                                            deleteRound(round.id, round.firestoreId);
                                        }
                                    }}
                                    style={{
                                        padding: '10px',
                                        background: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
