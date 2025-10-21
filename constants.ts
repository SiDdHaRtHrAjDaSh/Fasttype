
import { Difficulty } from './types';

export const CHAR_SETS: Record<Difficulty, string> = {
    [Difficulty.Easy]: 'abcdefghijklmnopqrstuvwxyz',
    [Difficulty.Medium]: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?',
    [Difficulty.Hard]: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;\':"()[]{}@#&',
};

// A larger word list would be ideal in a real application
export const WORD_LIST = [
    "ability", "able", "about", "above", "accept", "according", "account", "across", "action", "activity",
    "actually", "add", "address", "administration", "admit", "adult", "affect", "after", "again", "against",
    "agency", "agent", "ago", "agree", "agreement", "ahead", "allow", "almost", "alone", "along",
    "already", "also", "although", "always", "american", "among", "amount", "analysis", "and", "animal",
    "another", "answer", "any", "anyone", "anything", "appear", "apply", "approach", "area", "argue",
    "around", "arrive", "article", "artist", "ask", "assume", "attack", "attention", "attorney", "audience",
    "author", "authority", "available", "avoid", "away", "baby", "back", "bad", "ball", "bank",
    "beautiful", "because", "become", "before", "begin", "behavior", "behind", "believe", "benefit", "best",
    "better", "between", "beyond", "big", "bill", "billion", "black", "blood", "blue", "board",
    "body", "book", "born", "both", "box", "boy", "break", "bring", "brother", "budget",
    "build", "building", "business", "but", "buy", "call", "camera", "campaign", "can", "cancer",
    "candidate", "capital", "car", "card", "care", "career", "carry", "case", "catch", "cause",
    "cell", "center", "central", "century", "certain", "certainly", "chair", "challenge", "chance", "change",
    "character", "charge", "check", "child", "choice", "choose", "church", "citizen", "city", "civil",
    "claim", "class", "clear", "clearly", "close", "coach", "cold", "collection", "college", "color",
    "come", "commercial", "common", "community", "company", "compare", "computer", "concern", "condition", "conference",
    "congress", "consider", "consumer", "contain", "continue", "control", "cost", "could", "country", "couple",
    "course", "court", "cover"
];
