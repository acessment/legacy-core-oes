import { Level } from "@/types";

interface ReadingRequest {
    prompt: string;
    model: string;
    word_count: number;
    hasFitB: boolean;
    hasSQ: boolean;
    hasTFNG: boolean;
    level: string;
    totalNumOfQ: number;
}
interface ReadingExerciseRequest {
    title: string;
    article: string;
    hasFitB: boolean;
    hasSQ: boolean;
    hasTFNG: boolean;
    level: string;
    totalNumOfQ: number;
}

interface DiyRequest {
    prompt: string;
}

interface ReadingArticleRequest {
    prompt: string;
    model: string;
    word_count: number;
    level: string;
}

interface ListeningScriptRequest {
    prompt: string;
    model: string;
    word_count: number;
    level: string;
}

interface ListeningRequest {
    prompt: string;
    model: string;
    word_count: number;
    gender: string[];
    speed: number;
    level: string;
    intro: boolean;
    autogender: boolean;
}

interface ListeningExerciseRequest {
    script: string;
    level: string;
}

interface GrammarExerciseRequest {
    selected_exercise_id: number;
    prompt: string;
    remarks: string;
    tenses?: number[];
    totalNumOfQ: number;
    hasExample: boolean;
}

interface ListeningAudioRequest {
    script: string;
    gender: string[];
    speed: number;
    intro: boolean;
    autogender: boolean;
}

interface GeneratePdfRequest {
    exercise_json: string;
    is_solution: boolean;
    show_index: boolean;
}

// Define category interface
interface ExerciseCategory {
    id: string;
    name: string;
    description: string;
}

// Define AI model interface
interface AIModel {
    id: string;
    name: string;
    description: string;
}

// Define grammar template interface
interface GrammarTemplate {
    id: number;
    value: string;
    label: string;
}

interface GeneratorTokenRes {
    token: string;
    maxToken: string;
    lastUpdatedAt: string;
}

interface CreateExerciseRequest {
    title: string; // must not be null, max 255 chars
    grade: string[]; // must not be null
    category: string; // must not be null
    audioSrc?: string; // optional
    content: string; // must not be null
    thumbnailSrc: string; // optional
    welcomeExercise: boolean; // optional, default false
}

interface ExplanationV2Request {
    context: string;
    question: string;
}


export type GeneratorParams = {
    category: string;
    level: Level | string;
    theme: string;
    hasTFNG: boolean;
    hasSQ: boolean;
    hasFitB: boolean;
    model: "gpt-4o" | "sonar";
    script: string;
    speed: number;
    selected_exercise_id: number | string;
    totalNumOfQ: number;
    hasExample: boolean;
    word_count: number;
    prompt: string;
    article: string;
    questionTypes: string[];
    tenses?: number[];
    remarks: string;
};

export type {
    ReadingExerciseRequest,
    DiyRequest,
    ReadingArticleRequest,
    ListeningScriptRequest,
    ListeningExerciseRequest,
    ListeningAudioRequest,
    CreateExerciseRequest,
    GrammarExerciseRequest,
    GeneratePdfRequest,
    ExerciseCategory,
    AIModel,
    GrammarTemplate,
    GeneratorTokenRes,
    ReadingRequest,
    ListeningRequest,
    ExplanationV2Request,
};
