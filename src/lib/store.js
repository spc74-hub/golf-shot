'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
    const [currentRound, setCurrentRound] = useState(null);
    const [history, setHistory] = useState([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        try {
            const savedRound = localStorage.getItem('currentRound');
            const savedHistory = localStorage.getItem('roundHistory');

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

            if (savedHistory) {
                const parsedHistory = JSON.parse(savedHistory);
                // Optional: Filter out old history items if needed, or just keep them
                // For now, we'll keep history as it might not crash the app immediately unless viewed
                setHistory(parsedHistory);
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
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
            // Calculate playing handicap for each player
            let playingHandicap = 0;

            if (useHandicap) {
                // Formula: (HcpIndex * (Slope/113)) + (Rating - Par)
                playingHandicap = Math.round(
                    (p.handicapIndex * (p.teeBox.slope / 113)) + (p.teeBox.rating - course.par)
                );

                // Apply handicap percentage
                if (handicapPercentage !== 100) {
                    playingHandicap = Math.round(playingHandicap * (handicapPercentage / 100));
                }
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

    const finishRound = () => {
        if (!currentRound) return;
        setHistory(prev => [currentRound, ...prev]);
        setCurrentRound(null);
    };

    const abandonRound = () => {
        setCurrentRound(null);
    };

    return (
        <GameContext.Provider value={{ currentRound, startRound, updateScore, finishRound, confirmHole, reopenHole, abandonRound, history }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    return useContext(GameContext);
}
