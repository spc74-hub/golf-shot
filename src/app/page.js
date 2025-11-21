import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div className="text-center mb-8">
        <h1 className="text-xl mb-4">Golf Tracker</h1>
        <p className="text-sm">Tu caddie digital personal</p>
      </div>

      <div className="card">
        <h2 className="mb-4">Acciones Rápidas</h2>
        <div className="grid-2">
          <Link href="/round/setup" className="btn btn-primary">
            Nueva Ronda
          </Link>
          <Link href="/history" className="btn btn-secondary">
            Historial
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4">Estadísticas Recientes</h2>
        <p className="text-sm text-center">No hay rondas registradas aún.</p>
      </div>
    </div>
  );
}
