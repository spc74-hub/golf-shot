'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function Login() {
    const router = useRouter();
    const { user, login, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email || !password) {
            setError('Por favor completa todos los campos');
            setIsLoading(false);
            return;
        }

        const result = await login(email, password);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error);
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Cargando...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: '#f5f5f5' }}>
            <div style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {/* Logo/Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '8px' }}>⛳ Golf Shot</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Inicia sesión para continuar</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#ffebee',
                        color: '#c62828',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#333' }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: isLoading ? '#ccc' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            marginBottom: '16px'
                        }}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* Register Link */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
