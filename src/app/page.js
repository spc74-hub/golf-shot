'use client';

import Link from 'next/link';
import { useGame } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function HomePage() {
  const { currentRound, abandonRound } = useGame();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm('¿Cerrar sesión?')) {
      await logout();
    }
  };

  const handleNewRound = () => {
    if (currentRound) {
      if (confirm('Tienes una partida en curso. ¿Abandonarla y crear una nueva?')) {
        abandonRound();
        return true;
      }
      return false;
    }
    return true;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      {/* User Header with Logout */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#666' }}>Hola,</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {user?.displayName || user?.email}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          Salir
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-xl mb-4">⛳ Golf Shot</h1>
        <p className="text-sm">Tu caddie digital personal</p>
      </div>

      {/* Partida en curso */}
      {currentRound && (
        <div className="card mb-4" style={{ background: '#e8f5e9', border: '2px solid var(--primary)' }}>
          <h2 className="mb-2" style={{ color: 'var(--primary)' }}>Partida en Curso</h2>
          <p className="text-sm mb-4">{currentRound.courseName}</p>
          <p className="text-xs mb-4" style={{ color: '#666' }}>
            Hoyos completados: {currentRound.completedHoles?.length || 0} / 18
          </p>
          <div className="grid-2">
            <Link href="/round/play" className="btn btn-primary">
              Continuar
            </Link>
            <button
              onClick={() => {
                if (confirm('¿Abandonar partida? Se perderán los datos.')) {
                  abandonRound();
                }
              }}
              className="btn btn-secondary"
              style={{ background: '#c62828', color: 'white', borderColor: '#c62828' }}
            >
              Abandonar
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="mb-4">Acciones Rápidas</h2>
        <div className="grid-2">
          {currentRound ? (
            <button
              onClick={() => {
                if (handleNewRound()) {
                  window.location.href = '/round/setup';
                }
              }}
              className="btn btn-secondary"
            >
              Nueva Ronda
            </button>
          ) : (
            <Link href="/round/setup" className="btn btn-primary">
              Nueva Ronda
            </Link>
          )}
          <Link href="/history" className="btn btn-secondary">
            Historial
          </Link>
        </div>
      </div>

      {/* Admin Panel Link - Only for admins */}
      {isAdmin && (
        <div className="card" style={{ marginTop: '16px', background: '#fff3e0', border: '2px solid #ff9800' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ marginBottom: '4px', color: '#ff9800' }}>Panel de Administración</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                Gestiona usuarios y campos de golf
              </p>
            </div>
            <Link
              href="/admin"
              style={{
                padding: '10px 20px',
                background: '#ff9800',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              Ir al Admin →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
