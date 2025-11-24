'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function HistoryLayout({ children }) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}
