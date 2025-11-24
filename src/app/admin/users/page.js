'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = [];

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();

                // Get user's rounds count
                const roundsQuery = query(
                    collection(db, 'rounds'),
                    where('userId', '==', userDoc.id)
                );
                const roundsSnapshot = await getDocs(roundsQuery);

                usersData.push({
                    id: userDoc.id,
                    ...userData,
                    roundsCount: roundsSnapshot.size
                });
            }

            setUsers(usersData);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserRole = async (userId, currentRole) => {
        if (!confirm(`¿Cambiar rol de usuario ${currentRole === 'admin' ? 'admin' : 'normal'} a ${currentRole === 'admin' ? 'normal' : 'admin'}?`)) {
            return;
        }

        try {
            const userRef = doc(db, 'users', userId);
            const newRole = currentRole === 'admin' ? 'user' : 'admin';

            await setDoc(userRef, {
                role: newRole,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            alert('Rol actualizado correctamente');
            loadUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Error al actualizar el rol: ' + error.message);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        if (!confirm(`¿${currentStatus === 'active' ? 'Desactivar' : 'Activar'} este usuario?`)) {
            return;
        }

        try {
            const userRef = doc(db, 'users', userId);
            const newStatus = currentStatus === 'active' ? 'disabled' : 'active';

            await setDoc(userRef, {
                status: newStatus,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            alert('Estado actualizado correctamente');
            loadUsers();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar el estado: ' + error.message);
        }
    };

    const deleteUser = async (userId, email) => {
        if (!confirm(`¿Eliminar usuario ${email}? Esta acción eliminará también todas sus partidas y NO se puede deshacer.`)) {
            return;
        }

        if (!confirm('¿Estás completamente seguro? Esta acción es IRREVERSIBLE.')) {
            return;
        }

        try {
            // Delete user's rounds
            const roundsQuery = query(collection(db, 'rounds'), where('userId', '==', userId));
            const roundsSnapshot = await getDocs(roundsQuery);

            for (const roundDoc of roundsSnapshot.docs) {
                await deleteDoc(doc(db, 'rounds', roundDoc.id));
            }

            // Delete user document
            await deleteDoc(doc(db, 'users', userId));

            alert(`Usuario eliminado. Se eliminaron ${roundsSnapshot.size} partidas asociadas.`);
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error al eliminar el usuario: ' + error.message);
        }
    };

    if (loading) {
        return <div>Cargando usuarios...</div>;
    }

    return (
        <div>
            <style jsx>{`
                .scroll-hint {
                    text-align: center;
                    padding: 8px;
                    background: #fff3cd;
                    color: #856404;
                    font-size: 0.85rem;
                    border-radius: 8px 8px 0 0;
                    display: none;
                }

                .users-table-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    overflow-x: auto;
                    position: relative;
                }

                .users-table-container::after {
                    content: '→';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    background: linear-gradient(to right, transparent, white);
                    padding: 20px 10px;
                    font-size: 1.5rem;
                    color: #999;
                    pointer-events: none;
                }

                .users-table {
                    width: 100%;
                    border-collapse: collapse;
                    display: table;
                    min-width: 1100px;
                }

                .users-table th {
                    padding: 16px 12px;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.9rem;
                    background: #f5f5f5;
                    border-bottom: 2px solid #ddd;
                    white-space: nowrap;
                }

                .users-table td {
                    padding: 16px 12px;
                    vertical-align: middle;
                    font-size: 0.9rem;
                }

                .action-btn {
                    padding: 8px 12px;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    white-space: nowrap;
                    transition: opacity 0.2s, transform 0.1s;
                }

                .action-btn:hover {
                    opacity: 0.85;
                    transform: translateY(-1px);
                }

                .action-btn:active {
                    transform: translateY(0);
                }

                .actions-cell {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    flex-wrap: nowrap;
                    min-width: 380px;
                }

                @media (min-width: 1400px) {
                    .users-table {
                        min-width: auto;
                    }

                    .users-table-container::after {
                        display: none;
                    }
                }

                @media (max-width: 1200px) {
                    .scroll-hint {
                        display: block;
                    }

                    .action-btn {
                        padding: 6px 10px;
                        font-size: 0.8rem;
                    }

                    .actions-cell {
                        min-width: 340px;
                    }
                }

                @media (max-width: 768px) {
                    .users-table-container {
                        overflow-x: visible;
                    }

                    .users-table {
                        display: block;
                        min-width: 0;
                    }

                    .users-table thead {
                        display: none;
                    }

                    .users-table tbody {
                        display: block;
                    }

                    .users-table tr {
                        display: block;
                        margin-bottom: 16px;
                        border: 1px solid #eee;
                        border-radius: 8px;
                        padding: 16px;
                        background: #fafafa;
                    }

                    .users-table td {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0 !important;
                        border: none;
                        align-items: center;
                    }

                    .users-table td::before {
                        content: attr(data-label);
                        font-weight: 600;
                        color: #666;
                        margin-right: 10px;
                    }

                    .users-table td:last-child {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .users-table td:last-child::before {
                        margin-bottom: 8px;
                    }

                    .actions-cell {
                        flex-direction: column;
                        width: 100%;
                    }

                    .action-btn {
                        width: 100%;
                        justify-content: center;
                        padding: 10px;
                    }
                }
            `}</style>

            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#333' }}>
                    Gestión de Usuarios
                </h1>
                <p style={{ color: '#666' }}>Total de usuarios: {users.length}</p>
            </div>

            <div className="scroll-hint">
                ← Desliza horizontalmente para ver todas las columnas →
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Nombre</th>
                            <th style={{ textAlign: 'center' }}>Rol</th>
                            <th style={{ textAlign: 'center' }}>Estado</th>
                            <th style={{ textAlign: 'center' }}>Partidas</th>
                            <th style={{ textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td data-label="Email">{user.email}</td>
                                <td data-label="Nombre">{user.displayName || '-'}</td>
                                <td data-label="Rol" style={{ textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        background: user.role === 'admin' ? '#ff9800' : '#e0e0e0',
                                        color: user.role === 'admin' ? 'white' : '#666',
                                        display: 'inline-block'
                                    }}>
                                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                                    </span>
                                </td>
                                <td data-label="Estado" style={{ textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        background: user.status === 'disabled' ? '#f44336' : '#4caf50',
                                        color: 'white',
                                        display: 'inline-block'
                                    }}>
                                        {user.status === 'disabled' ? 'Desactivado' : 'Activo'}
                                    </span>
                                </td>
                                <td data-label="Partidas" style={{ textAlign: 'center' }}>
                                    <strong>{user.roundsCount}</strong>
                                </td>
                                <td data-label="Acciones">
                                    <div className="actions-cell">
                                        <button
                                            onClick={() => toggleUserRole(user.id, user.role)}
                                            className="action-btn"
                                            style={{ background: '#2196F3' }}
                                            title={user.role === 'admin' ? 'Quitar permisos de admin' : 'Hacer administrador'}
                                        >
                                            {user.role === 'admin' ? '👤 Quitar Admin' : '⭐ Hacer Admin'}
                                        </button>
                                        <button
                                            onClick={() => toggleUserStatus(user.id, user.status)}
                                            className="action-btn"
                                            style={{ background: user.status === 'disabled' ? '#4caf50' : '#ff9800' }}
                                            title={user.status === 'disabled' ? 'Activar usuario' : 'Desactivar usuario'}
                                        >
                                            {user.status === 'disabled' ? '✓ Activar' : '✕ Desactivar'}
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id, user.email)}
                                            className="action-btn"
                                            style={{ background: '#f44336' }}
                                            title="Eliminar usuario y todas sus partidas"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        No hay usuarios registrados
                    </div>
                )}
            </div>
        </div>
    );
}
