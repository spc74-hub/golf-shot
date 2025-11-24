'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import app from './firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const register = async (email, password, displayName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update profile with display name
            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }

            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Error en registro:', error);
            let message = 'Error al registrar usuario';

            if (error.code === 'auth/email-already-in-use') {
                message = 'Este email ya está registrado';
            } else if (error.code === 'auth/weak-password') {
                message = 'La contraseña debe tener al menos 6 caracteres';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Email inválido';
            }

            return { success: false, error: message };
        }
    };

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Error en login:', error);
            let message = 'Error al iniciar sesión';

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = 'Email o contraseña incorrectos';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Email inválido';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Demasiados intentos fallidos. Intenta más tarde';
            }

            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Error en logout:', error);
            return { success: false, error: 'Error al cerrar sesión' };
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}
