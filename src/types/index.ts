export interface Option {
    label: string;
    text: string;
    trait: 'D' | 'C' | 'A' | 'S';
}

export interface Question {
    id: number;
    text: string;
    options: Option[];
}

export type Trait = 'D' | 'C' | 'A' | 'S';

export interface Scores {
    D: number;
    C: number;
    A: number;
    S: number;
}

export interface TraitResult {
    trait: Trait;
    score: number;
    level: 'Low' | 'Moderate' | 'High';
    label: string;
    description: string;
}
