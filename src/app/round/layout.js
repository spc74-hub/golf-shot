'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function RoundLayout({ children }) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}
