'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const GameContext = createContext();

export function GameProvider({ children }) {
    const [currentRound, setCurrentRound] = useState(null);
    const [history, setHistory] = useState([]);

    // Load from LocalStorage and Firestore on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load current round from LocalStorage
                const savedRound = localStorage.getItem('currentRound');
                if (savedRound) {
                    const parsedRound = JSON.parse(savedRound);
                    // Validation: Check if it has the new 'players' structure
                    if (parsedRound.players && Array.isArray(parsedRound.players)) {
                        setCurrentRound(parsedRound);
                    } else {
                        // Old data format detected, clearing to avoid crash
                        console.warn('Old round data format detected. Clearing current round.');
                        localStorage.removeItem('currentRound');
                    }
                }

                // Load history from Firestore
                try {
                    const roundsQuery = query(
                        collection(db, 'rounds'),
                        orderBy('date', 'desc'),
                        limit(50) // Limit to last 50 rounds
                    );
                    const querySnapshot = await getDocs(roundsQuery);
                    const firestoreHistory = [];
                    querySnapshot.forEach((doc) => {
                        firestoreHistory.push({ ...doc.data(), firestoreId: doc.id });
                    });

                    if (firestoreHistory.length > 0) {
                        setHistory(firestoreHistory);
                        // Also save to localStorage as backup
                        localStorage.setItem('roundHistory', JSON.stringify(firestoreHistory));
                    } else {
                        // Fallback to LocalStorage if Firestore is empty
                        const savedHistory = localStorage.getItem('roundHistory');
                        if (savedHistory) {
                            const parsedHistory = JSON.parse(savedHistory);
                            setHistory(parsedHistory);
                        }
                    }
                } catch (firestoreError) {
                    console.error('Error loading from Firestore, using localStorage fallback:', firestoreError);
                    // Fallback to LocalStorage if Firestore fails
                    const savedHistory = localStorage.getItem('roundHistory');
                    if (savedHistory) {
                        const parsedHistory = JSON.parse(savedHistory);
                        setHistory(parsedHistory);
                    }
                }
            } catch (e) {
                console.error('Error loading data:', e);
            }
        };

        loadData();
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        if (currentRound) {
            localStorage.setItem('currentRound', JSON.stringify(currentRound));
        } else {
            localStorage.removeItem('currentRound');
        }
    }, [currentRound]);

    useEffect(() => {
        localStorage.setItem('roundHistory', JSON.stringify(history));
    }, [history]);

    const startRound = (course, players, settings = {}) => {
        const { gameMode = 'stableford', useHandicap = true, handicapPercentage = 100, roundDate, courseLength = '18' } = settings;

        // Filter holes based on course length selection
        let selectedHoles = course.data;
        let adjustedPar = course.par;

        if (courseLength === 'front9') {
            selectedHoles = course.data.slice(0, 9);
            adjustedPar = selectedHoles.reduce((sum, hole) => sum + hole.par, 0);
        } else if (courseLength === 'back9') {
            selectedHoles = course.data.slice(9, 18);
            adjustedPar = selectedHoles.reduce((sum, hole) => sum + hole.par, 0);
        }

        const playersWithHandicap = players.map(p => {
            // Use the playing handicap calculated in setup (already includes slope)
            // Apply handicap percentage if needed
            let playingHandicap = p.playingHandicap || 0;

            if (useHandicap && handicapPercentage !== 100) {
                playingHandicap = Math.round(playingHandicap * (handicapPercentage / 100));
            } else if (!useHandicap) {
                playingHandicap = 0;
            }

            // Pre-llenar scores con valores por defecto solo para los hoyos seleccionados
            const scores = {};
            selectedHoles.forEach(hole => {
                scores[hole.number] = { strokes: hole.par, putts: 2 };
            });

            return {
                ...p,
                playingHandicap,
                scores
            };
        });

        const newRound = {
            id: Date.now().toString(),
            date: roundDate || new Date().toISOString().split('T')[0],
            courseId: course.id,
            courseName: course.name,
            coursePar: adjustedPar,
            holes: selectedHoles,
            players: playersWithHandicap,
            settings: settings, // Guardar todos los settings (incluye courseLength)
            completedHoles: [], // Array of hole numbers that are finished
            isFinished: false,
        };
        setCurrentRound(newRound);
    };

    const updateScore = (playerId, holeNumber, type, value) => {
        setCurrentRound(prev => {
            if (!prev) return null;

            const updatedPlayers = prev.players.map(p => {
                if (p.id !== playerId) return p;

                const currentHoleScore = p.scores[holeNumber] || { strokes: 0, putts: 0 };
                return {
                    ...p,
                    scores: {
                        ...p.scores,
                        [holeNumber]: {
                            ...currentHoleScore,
                            [type]: value
                        }
                    }
                };
            });

            return {
                ...prev,
                players: updatedPlayers
            };
        });
    };

    const confirmHole = (holeNumber) => {
        setCurrentRound(prev => {
            if (!prev) return null;
            if (prev.completedHoles.includes(holeNumber)) return prev;
            return {
                ...prev,
                completedHoles: [...prev.completedHoles, holeNumber]
            };
        });
    };

    const reopenHole = (holeNumber) => {
        setCurrentRound(prev => {
            if (!prev) return null;
            return {
                ...prev,
                completedHoles: prev.completedHoles.filter(h => h !== holeNumber)
            };
        });
    };

    const saveProgress = async () => {
        if (!currentRound) return;

        try {
            const roundData = {
                ...currentRound,
                isFinished: false,
                lastSaved: new Date().toISOString()
            };

            let firestoreId = currentRound.firestoreId;

            // If already has a firestoreId, update the existing document
            if (firestoreId) {
                const { updateDoc, doc } = await import('firebase/firestore');
                await updateDoc(doc(db, 'rounds', firestoreId), roundData);
                console.log('Progress updated in Firestore with ID:', firestoreId);
            } else {
                // Otherwise, create a new document
                const docRef = await addDoc(collection(db, 'rounds'), roundData);
                firestoreId = docRef.id;
                console.log('Progress saved to Firestore with new ID:', firestoreId);
            }

            // Update currentRound with firestoreId
            setCurrentRound({
                ...currentRound,
                firestoreId,
                lastSaved: new Date().toISOString()
            });

            // Update or add to history
            const roundWithFirestoreId = {
                ...currentRound,
                firestoreId,
                isFinished: false,
                lastSaved: new Date().toISOString()
            };

            setHistory(prev => {
                // Check if this round already exists in history
                const existingIndex = prev.findIndex(r => r.firestoreId === firestoreId);
                if (existingIndex !== -1) {
                    // Update existing entry
                    const updated = [...prev];
                    updated[existingIndex] = roundWithFirestoreId;
                    return updated;
                } else {
                    // Add new entry
                    return [roundWithFirestoreId, ...prev];
                }
            });

            alert('Progreso guardado correctamente');

        } catch (error) {
            console.error('Error saving progress to Firestore:', error);
            alert('Error al guardar progreso');
        }
    };

    const finishRound = async () => {
        if (!currentRound) return;

        try {
            const roundData = {
                ...currentRound,
                isFinished: true,
                completedAt: new Date().toISOString()
            };

            let firestoreId = currentRound.firestoreId;

            // If already has a firestoreId, update the existing document
            if (firestoreId) {
                const { updateDoc, doc } = await import('firebase/firestore');
                await updateDoc(doc(db, 'rounds', firestoreId), roundData);
                console.log('Round finished and updated in Firestore with ID:', firestoreId);
            } else {
                // Otherwise, create a new document
                const docRef = await addDoc(collection(db, 'rounds'), roundData);
                firestoreId = docRef.id;
                console.log('Round saved to Firestore with new ID:', firestoreId);
            }

            // Update or add to history
            const roundWithFirestoreId = {
                ...currentRound,
                firestoreId,
                isFinished: true,
                completedAt: new Date().toISOString()
            };

            setHistory(prev => {
                // Check if this round already exists in history
                const existingIndex = prev.findIndex(r => r.firestoreId === firestoreId);
                if (existingIndex !== -1) {
                    // Update existing entry
                    const updated = [...prev];
                    updated[existingIndex] = roundWithFirestoreId;
                    return updated;
                } else {
                    // Add new entry
                    return [roundWithFirestoreId, ...prev];
                }
            });
            setCurrentRound(null);

        } catch (error) {
            console.error('Error saving to Firestore, saving to localStorage only:', error);
            // Fallback to localStorage only if Firestore fails
            const finishedRound = { ...currentRound, isFinished: true, completedAt: new Date().toISOString() };
            setHistory(prev => [finishedRound, ...prev]);
            setCurrentRound(null);
        }
    };

    const abandonRound = () => {
        setCurrentRound(null);
    };

    const deleteRound = async (roundId, firestoreId) => {
        try {
            // Delete from Firestore if it has a firestoreId
            if (firestoreId) {
                const { deleteDoc, doc } = await import('firebase/firestore');
                await deleteDoc(doc(db, 'rounds', firestoreId));
                console.log('Round deleted from Firestore');
            }

            // Remove from local history - use firestoreId if available to avoid deleting wrong entry
            setHistory(prev => prev.filter(r => {
                // If both have firestoreId, compare by firestoreId (more accurate)
                if (r.firestoreId && firestoreId) {
                    return r.firestoreId !== firestoreId;
                }
                // Otherwise, fallback to id comparison
                return r.id !== roundId;
            }));
            alert('Partida eliminada correctamente');
        } catch (error) {
            console.error('Error deleting round:', error);
            alert('Error al eliminar la partida');
        }
    };

    const continueRound = (round) => {
        // Resume a saved round
        setCurrentRound(round);
        // Remove from history since it's now active - use firestoreId for accuracy
        setHistory(prev => prev.filter(r => {
            if (r.firestoreId && round.firestoreId) {
                return r.firestoreId !== round.firestoreId;
            }
            return r.id !== round.id;
        }));
    };

    const reopenFinishedRound = (round) => {
        // Reopen a finished round for editing
        const reopenedRound = {
            ...round,
            isFinished: false
        };
        setCurrentRound(reopenedRound);
        // Remove from history since it's now active - use firestoreId for accuracy
        setHistory(prev => prev.filter(r => {
            if (r.firestoreId && round.firestoreId) {
                return r.firestoreId !== round.firestoreId;
            }
            return r.id !== round.id;
        }));
    };

    return (
        <GameContext.Provider value={{
            currentRound,
            startRound,
            updateScore,
            finishRound,
            saveProgress,
            confirmHole,
            reopenHole,
            abandonRound,
            deleteRound,
            continueRound,
            reopenFinishedRound,
            history
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}
