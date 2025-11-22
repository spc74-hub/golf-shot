'use client';

import { useGame } from '@/lib/store';
import ScorecardTable from '@/components/ScorecardTable';
import Link from 'next/link';

export default function CardView() {
    const { currentRound } = useGame();

    if (!currentRound) {
        return (
            <div className="text-center mt-8">
                <p>No hay partida activa.</p>
                <Link href="/" className="btn btn-primary mt-4">Volver</Link>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '80px', width: '100%' }}>
            <div className="mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h1 className="text-xl">{currentRound.courseName}</h1>
                    <Link href="/round/play" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}>
                        Volver al Juego
                    </Link>
                </div>
                <p className="text-sm text-gray-500">
                    {new Date(currentRound.date).toLocaleDateString()} • {currentRound.players.length} Jugadores
                </p>
            </div>

            <div style={{
                marginBottom: '12px',
                padding: '8px 12px',
                background: '#e3f2fd',
                borderRadius: '8px',
                fontSize: '0.85rem',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
            }}>
                <span style={{ fontSize: '1.2rem' }}>👉</span>
                <span>Desliza horizontalmente para ver toda la tarjeta</span>
            </div>

            <ScorecardTable round={currentRound} />
        </div>
    );
}
