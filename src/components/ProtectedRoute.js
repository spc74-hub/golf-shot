'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function ProtectedRoute({ children }) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '12px' }}>⛳</div>
                    <div style={{ fontSize: '1rem', color: '#666' }}>Cargando...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to login
    }

    return children;
}
