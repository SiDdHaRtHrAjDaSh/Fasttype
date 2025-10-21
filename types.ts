
export enum GameMode {
    Reaction = 'reaction',
    Word = 'word',
    Paragraph = 'paragraph'
}

export enum Difficulty {
    Easy = 'easy',
    Medium = 'medium',
    Hard = 'hard'
}

export enum GameState {
    Setup = 'setup',
    Playing = 'playing',
    Finished = 'finished'
}

export interface GameStats {
    time: number;
    correct: number;
    errors: number;
    missed: number;
    accuracy: number;
    wpm: number;
    reactionTimes: number[];
    avgReactionTime: number;
    totalWords: number;
    totalChars: number;
}
