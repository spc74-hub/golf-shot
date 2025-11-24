'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRounds: 0,
        totalCourses: 0,
        roundsThisMonth: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Get total users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const totalUsers = usersSnapshot.size;

            // Get total rounds
            const roundsSnapshot = await getDocs(collection(db, 'rounds'));
            const totalRounds = roundsSnapshot.size;

            // Get rounds this month
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const roundsThisMonthQuery = query(
                collection(db, 'rounds'),
                where('date', '>=', firstDayOfMonth)
            );
            const roundsThisMonthSnapshot = await getDocs(roundsThisMonthQuery);
            const roundsThisMonth = roundsThisMonthSnapshot.size;

            // Get total courses (from mock data or Firestore)
            let totalCourses = 0;
            try {
                const coursesSnapshot = await getDocs(collection(db, 'courses'));
                totalCourses = coursesSnapshot.size;
            } catch (error) {
                console.log('Courses collection does not exist yet');
            }

            setStats({
                totalUsers,
                totalRounds,
                totalCourses,
                roundsThisMonth
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, link }) => (
        <Link href={link} style={{ textDecoration: 'none' }}>
            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                border: `3px solid ${color}`
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
            >
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>{title}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color }}>{value}</div>
            </div>
        </Link>
    );

    if (loading) {
        return <div>Cargando estadísticas...</div>;
    }

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '32px', color: '#333' }}>
                Dashboard
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <StatCard
                    title="Total Usuarios"
                    value={stats.totalUsers}
                    icon="👥"
                    color="var(--primary)"
                    link="/admin/users"
                />
                <StatCard
                    title="Total Partidas"
                    value={stats.totalRounds}
                    icon="🏌️"
                    color="#2196F3"
                    link="/admin"
                />
                <StatCard
                    title="Partidas Este Mes"
                    value={stats.roundsThisMonth}
                    icon="📅"
                    color="#FF9800"
                    link="/admin"
                />
                <StatCard
                    title="Campos de Golf"
                    value={stats.totalCourses}
                    icon="⛳"
                    color="#4CAF50"
                    link="/admin/courses"
                />
            </div>

            <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#333' }}>Acciones Rápidas</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                }}>
                    <Link
                        href="/admin/users"
                        className="btn btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '14px 20px',
                            fontSize: '1rem'
                        }}
                    >
                        <span>👥</span>
                        <span>Gestionar Usuarios</span>
                    </Link>
                    <Link
                        href="/admin/courses"
                        className="btn btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '14px 20px',
                            fontSize: '1rem'
                        }}
                    >
                        <span>⛳</span>
                        <span>Gestionar Campos</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
