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
        <div style={{ paddingBottom: '80px' }}>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-xl">{currentRound.courseName}</h1>
                <Link href="/round/play" className="btn btn-secondary" style={{ width: 'auto' }}>
                    Volver al Juego
                </Link>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-500">
                    {new Date(currentRound.date).toLocaleDateString()} • {currentRound.players.length} Jugadores
                </p>
            </div>

            <ScorecardTable round={currentRound} />
        </div>
    );
}
