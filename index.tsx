import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { GameMode, Difficulty, GameState, GameStats } from './types';
import { CHAR_SETS, WORD_LIST } from './constants';

// --- UTILS ---

const getRandomChar = (difficulty: Difficulty): string => {
    const charSet = CHAR_SETS[difficulty];
    return charSet[Math.floor(Math.random() * charSet.length)];
};

const getRandomWord = (difficulty: Difficulty): string => {
    const charSet = CHAR_SETS[difficulty];
    const filteredWords = WORD_LIST.filter(word =>
        word.split('').every(char => charSet.toLowerCase().includes(char.toLowerCase()))
    );
    const list = filteredWords.length > 0 ? filteredWords : WORD_LIST;
    return list[Math.floor(Math.random() * list.length)];
};

export const getRandomParagraph = (difficulty: Difficulty, wordCount = 30): string => {
    let paragraph = '';
    for (let i = 0; i < wordCount; i++) {
        paragraph += getRandomWord(difficulty) + ' ';
    }
    return paragraph.trim() + '.';
};


// --- COMPONENTS ---

const StatCard: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'text-slate-100' }) => (
    <div className="bg-slate-700 p-4 rounded-lg">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const Results: React.FC<{ stats: GameStats; onPlayAgain: () => void; }> = ({ stats, onPlayAgain }) => {
    return (
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl animate-fade-in text-center">
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Game Over!</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-lg mb-8">
                <StatCard label="Time Taken" value={`${stats.time.toFixed(2)}s`} />
                {stats.wpm > 0 && <StatCard label="WPM" value={stats.wpm.toFixed(0)} />}
                <StatCard label="Accuracy" value={`${stats.accuracy.toFixed(2)}%`} />
                {stats.avgReactionTime > 0 && <StatCard label="Avg. Reaction" value={`${stats.avgReactionTime.toFixed(0)}ms`} />}
                <StatCard label="Correct" value={stats.correct.toString()} color="text-green-400" />
                <StatCard label="Errors" value={stats.errors.toString()} color="text-red-400" />
                {stats.missed > 0 && <StatCard label="Missed Words" value={stats.missed.toString()} color="text-yellow-400" />}
                {stats.totalWords > 0 && <StatCard label="Total Words" value={stats.totalWords.toString()} />}
                {stats.totalChars > 0 && <StatCard label="Total Chars" value={stats.totalChars.toString()} />}
            </div>
            <button
                onClick={onPlayAgain}
                className="w-full max-w-xs mx-auto bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105"
            >
                Play Again
            </button>
        </div>
    );
};

const GAME_DURATION = 60;
const REACTION_TEST_LENGTH = 20;

const Game: React.FC<{
    mode: GameMode;
    difficulty: Difficulty;
    onFinish: (stats: GameStats) => void;
}> = ({ mode, difficulty, onFinish }) => {
    const [textToType, setTextToType] = useState('');
    const [userInput, setUserInput] = useState('');
    const [stats, setStats] = useState<Omit<GameStats, 'avgReactionTime' | 'wpm'>>({
        time: mode === GameMode.Reaction ? 0 : GAME_DURATION,
        correct: 0,
        errors: 0,
        missed: 0,
        accuracy: 100,
        reactionTimes: [],
        totalWords: 0,
        totalChars: 0,
    });
    
    const [charStartTime, setCharStartTime] = useState(0);
    const timerRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const finishGame = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        
        const totalTimeSeconds = mode === GameMode.Reaction ? stats.time / 1000 : GAME_DURATION;
        const correctChars = mode === GameMode.Paragraph ? userInput.split('').filter((c, i) => c === textToType[i]).length : stats.correct;
        const totalInputs = correctChars + stats.errors + stats.missed;

        const finalStats: GameStats = {
            ...stats,
            correct: correctChars,
            time: mode === GameMode.Reaction ? stats.time / 1000 : GAME_DURATION - stats.time,
            avgReactionTime: stats.reactionTimes.length > 0
                ? stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length
                : 0,
            wpm: mode !== GameMode.Reaction
                ? Math.round((correctChars / 5) / ((GAME_DURATION - stats.time) / 60))
                : 0,
            accuracy: totalInputs > 0 ? (correctChars / totalInputs) * 100 : 100,
        };
        onFinish(finalStats);
    }, [stats, onFinish, mode, userInput, textToType]);

    const generateNext = useCallback(() => {
        if (mode === GameMode.Reaction) {
            setTextToType(getRandomChar(difficulty));
            setCharStartTime(Date.now());
        } else if (mode === GameMode.Word) {
            const newWord = getRandomWord(difficulty);
            setTextToType(newWord);
            setStats(s => ({ ...s, totalWords: s.totalWords + 1 }));
        }
    }, [mode, difficulty]);

    useEffect(() => {
        if (mode === GameMode.Paragraph) {
            const paragraph = getRandomParagraph(difficulty);
            setTextToType(paragraph);
            setStats(s => ({...s, totalChars: paragraph.length, totalWords: paragraph.split(' ').length}));
        } else {
            generateNext();
        }
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (mode !== GameMode.Reaction) {
            timerRef.current = window.setInterval(() => {
                setStats(s => {
                    if (s.time <= 1) {
                        finishGame();
                        return { ...s, time: 0 };
                    }
                    return { ...s, time: s.time - 1 };
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [mode, finishGame]);

    useEffect(() => {
        if (mode === GameMode.Reaction && stats.correct >= REACTION_TEST_LENGTH) {
            finishGame();
        }
    }, [stats.correct, mode, finishGame]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (mode === GameMode.Reaction) return;
        setUserInput(value);
        if (mode === GameMode.Paragraph) {
            const correctChars = value.split('').filter((char, i) => char === textToType[i]).length;
            const errorCount = value.length - correctChars;
            setStats(s => ({...s, errors: errorCount, correct: correctChars, accuracy: value.length > 0 ? (correctChars/value.length)*100 : 100 }));
            if (value.length === textToType.length && correctChars === textToType.length) {
                finishGame();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (mode === GameMode.Reaction) {
            e.preventDefault();
            if (stats.correct >= REACTION_TEST_LENGTH) return;
            if (e.key === textToType) {
                const reactionTime = Date.now() - charStartTime;
                setStats(s => ({
                    ...s,
                    correct: s.correct + 1,
                    time: s.time + reactionTime,
                    reactionTimes: [...s.reactionTimes, reactionTime],
                }));
                if (stats.correct < REACTION_TEST_LENGTH - 1) generateNext();
            } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                setStats(s => ({ ...s, errors: s.errors + 1 }));
            }
        } else if (mode === GameMode.Word) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (userInput.trim() === textToType) {
                    setStats(s => ({ ...s, correct: s.correct + textToType.length }));
                } else {
                    setStats(s => ({ ...s, errors: s.errors + textToType.length, missed: s.missed + 1 }));
                }
                setUserInput('');
                generateNext();
            }
        }
    };
    
    const renderTextDisplay = () => {
        if (mode === GameMode.Reaction) return <span className="text-cyan-300">{textToType}</span>;
        if (mode === GameMode.Word) {
            let color = 'text-slate-400';
            if (userInput.length > 0) color = textToType.startsWith(userInput) ? 'text-green-400' : 'text-red-400';
            if (userInput === textToType) color = 'text-green-400';
            return <span className={color}>{textToType}</span>;
        }
        if (mode === GameMode.Paragraph) {
            return textToType.split('').map((char, index) => {
                let color = 'text-slate-400';
                if (index < userInput.length) color = char === userInput[index] ? 'text-green-400' : 'text-red-400';
                return <span key={index} className={char === ' ' && userInput[index] !== ' ' && index < userInput.length ? 'bg-red-900' : color}>{char}</span>;
            });
        }
    };

    return (
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl flex flex-col items-center gap-8 animate-fade-in w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-lg w-full">
                <StatCard label="Time" value={mode === GameMode.Reaction ? (stats.time / 1000).toFixed(2) + 's' : String(stats.time)} />
                <StatCard label={mode === GameMode.Reaction ? 'Correct' : 'Chars'} value={String(stats.correct)} color="text-green-400" />
                <StatCard label="Errors" value={String(stats.errors)} color="text-red-400" />
                <StatCard label="Accuracy" value={stats.accuracy.toFixed(1) + '%'} color="text-yellow-400" />
            </div>
            
            <div className="w-full text-center p-4 bg-slate-900 rounded-lg font-mono tracking-widest text-4xl min-h-[6rem] flex items-center justify-center">
                <div className={mode === GameMode.Paragraph ? "text-left text-xl leading-relaxed" : ""}>{renderTextDisplay()}</div>
            </div>

            <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-center text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck="false"
                disabled={stats.time <= 0 && mode !== GameMode.Reaction}
            />

            <button onClick={finishGame} className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors">
                End Game
            </button>
        </div>
    );
};

const Setup: React.FC<{ onStart: (mode: GameMode, difficulty: Difficulty) => void; }> = ({ onStart }) => {
    const [mode, setMode] = useState<GameMode>(GameMode.Reaction);
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);

    const ModeButton: React.FC<{ value: GameMode, label: string }> = ({ value, label }) => (
        <button onClick={() => setMode(value)} className={`px-4 py-2 rounded-md transition-colors w-full ${mode === value ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
            {label}
        </button>
    );

    const DifficultyButton: React.FC<{ value: Difficulty, label: string }> = ({ value, label }) => (
        <button onClick={() => setDifficulty(value)} className={`px-4 py-2 rounded-md transition-colors w-full ${difficulty === value ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
            {label}
        </button>
    );

    return (
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl animate-fade-in">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4 text-center">Select Game Mode</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ModeButton value={GameMode.Reaction} label="Reaction Time" />
                    <ModeButton value={GameMode.Word} label="Word Typing" />
                    <ModeButton value={GameMode.Paragraph} label="Paragraph Typing" />
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-center">Select Difficulty</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DifficultyButton value={Difficulty.Easy} label="Easy" />
                    <DifficultyButton value={Difficulty.Medium} label="Medium" />
                    <DifficultyButton value={Difficulty.Hard} label="Hard" />
                </div>
            </div>
            <button onClick={() => onStart(mode, difficulty)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105">
                Start Game
            </button>
        </div>
    );
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.Setup);
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.Reaction);
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
    const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);

    const handleGameStart = useCallback((mode: GameMode, diff: Difficulty) => {
        setGameMode(mode);
        setDifficulty(diff);
        setGameState(GameState.Playing);
    }, []);

    const handleGameFinish = useCallback((stats: GameStats) => {
        setLastGameStats(stats);
        setGameState(GameState.Finished);
    }, []);

    const handlePlayAgain = useCallback(() => {
        setLastGameStats(null);
        setGameState(GameState.Setup);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <main className="w-full max-w-4xl mx-auto flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-cyan-400">
                    Speed Typing Game
                </h1>
                {gameState === GameState.Setup && <Setup onStart={handleGameStart} />}
                {gameState === GameState.Playing && <Game mode={gameMode} difficulty={difficulty} onFinish={handleGameFinish} />}
                {gameState === GameState.Finished && lastGameStats && <Results stats={lastGameStats} onPlayAgain={handlePlayAgain} />}
            </main>
        </div>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
