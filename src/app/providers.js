'use client';

import { GameProvider } from '@/lib/store';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({ children }) {
    return (
        <AuthProvider>
            <GameProvider>
                {children}
            </GameProvider>
        </AuthProvider>
    );
}
