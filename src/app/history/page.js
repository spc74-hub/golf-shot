'use client';

import { useGame } from '@/lib/store';
import Link from 'next/link';

export default function History() {
    const { history } = useGame();

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

                    return (
                        <Link key={round.id} href={`/history/detail?id=${round.id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                            <h3 className="text-xl mb-2">{round.courseName}</h3>
                            <p className="text-sm mb-4">{date} • {round.players.length} Jugadores</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {round.players.map(p => {
                                    const totalStrokes = Object.values(p.scores).reduce((acc, s) => acc + s.strokes, 0);
                                    return (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                                            <span>{p.name}</span>
                                            <span className="font-bold">{totalStrokes}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
