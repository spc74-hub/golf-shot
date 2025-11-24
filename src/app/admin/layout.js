'use client';

import { AdminRoute } from '@/components/admin/AdminRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/users', label: 'Usuarios', icon: '👥' },
        { href: '/admin/courses', label: 'Campos', icon: '⛳' }
    ];

    return (
        <AdminRoute>
            <style jsx>{`
                .admin-layout {
                    display: flex;
                    min-height: 100vh;
                }

                .sidebar {
                    width: 280px;
                    background: var(--primary);
                    color: white;
                    padding: 24px;
                    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    overflow-y: auto;
                }

                .main-content {
                    flex: 1;
                    padding: 32px;
                    background: #f5f5f5;
                    overflow-y: auto;
                    margin-left: 280px;
                    width: calc(100% - 280px);
                }

                .mobile-header {
                    display: none;
                }

                .mobile-menu-btn {
                    display: none;
                }

                @media (max-width: 1024px) {
                    .sidebar {
                        width: 240px;
                    }
                    .main-content {
                        margin-left: 240px;
                        width: calc(100% - 240px);
                        padding: 24px;
                    }
                }

                @media (max-width: 768px) {
                    .mobile-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 16px;
                        background: var(--primary);
                        color: white;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }

                    .mobile-menu-btn {
                        display: block;
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 8px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 1.2rem;
                    }

                    .sidebar {
                        position: fixed;
                        left: ${mobileMenuOpen ? '0' : '-100%'};
                        top: 0;
                        width: 280px;
                        z-index: 200;
                        transition: left 0.3s ease;
                    }

                    .sidebar-overlay {
                        display: ${mobileMenuOpen ? 'block' : 'none'};
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.5);
                        z-index: 150;
                    }

                    .main-content {
                        margin-left: 0;
                        width: 100%;
                        padding: 16px;
                    }
                }
            `}</style>

            <div className="admin-layout">
                {/* Mobile Header */}
                <div className="mobile-header">
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>⛳ Golf Shot</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Admin</div>
                    </div>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Sidebar Overlay for mobile */}
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Sidebar */}
                <aside className="sidebar">
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⛳ Golf Shot</h2>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Panel de Administración</p>
                    </div>

                    <nav style={{ flex: 1 }}>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        marginBottom: '8px',
                                        borderRadius: '8px',
                                        background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                        color: 'white',
                                        textDecoration: 'none',
                                        transition: 'background 0.2s',
                                        fontSize: '1rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}
                        >
                            <span>←</span>
                            <span>Volver a la App</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    {children}
                </main>
            </div>
        </AdminRoute>
    );
}
