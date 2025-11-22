'use client';

import { useGame } from '@/lib/store';
import ScorecardTable from '@/components/ScorecardTable';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function HistoryDetailContent() {
    const { history } = useGame();
    const searchParams = useSearchParams();
    const roundId = searchParams.get('id');

    const round = history.find(r => r.id === roundId);

    if (!round) {
        return (
            <div className="text-center mt-8">
                <p>Ronda no encontrada.</p>
                <Link href="/history" className="btn btn-primary mt-4">Volver al Historial</Link>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '80px' }}>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-xl">{round.courseName}</h1>
                <Link href="/history" className="btn btn-secondary" style={{ width: 'auto' }}>
                    Volver
                </Link>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-500">
                    {new Date(round.date).toLocaleDateString()} • {round.players.length} Jugadores
                </p>
            </div>

            <ScorecardTable round={round} />
        </div>
    );
}

export default function HistoryDetail() {
    return (
        <Suspense fallback={<div className="text-center mt-8">Cargando...</div>}>
            <HistoryDetailContent />
        </Suspense>
    );
}
