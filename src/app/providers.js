'use client';

import { GameProvider } from '@/lib/store';

export function Providers({ children }) {
    return (
        <GameProvider>
            {children}
        </GameProvider>
    );
}
