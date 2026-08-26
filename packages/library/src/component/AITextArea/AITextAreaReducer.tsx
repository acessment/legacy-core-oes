import type { Level } from "@lib/types";
import type { GeneratorParams } from "./types/generatorParams";

type ActionType =
    | { type: "SET_CATEGORY"; payload: string }
    | { type: "SET_LEVEL"; payload: Level | string }
    | { type: "SET_THEME"; payload: string }
    | { type: "SET_TOTAL_NUM_OF_Q"; payload: number }
    | { type: "SET_PROMPT"; payload: string }
    | { type: "TOGGLE_MODEL" }
    | { type: "SET_QUESTION_TYPES"; payload: string[] }
    | { type: "SET_WORD_COUNT"; payload: number }
    | { type: "SET_SPEED"; payload: number }
    | { type: "SET_TENSES"; payload: number[] }
    | { type: "SET_SELECTED_EXERCISE_ID"; payload: number | string };

export function AITextAreaReducer(draft: GeneratorParams, action: ActionType) {
    switch (action.type) {
        case "SET_CATEGORY":
            draft.category = action.payload;
            break;
        case "SET_LEVEL":
            draft.level = action.payload as Level;
            break;
        case "SET_THEME":
            draft.theme = action.payload;
            break;
        case "SET_TOTAL_NUM_OF_Q":
            draft.totalNumOfQ = action.payload;
            break;
        case "SET_PROMPT":
            draft.prompt = action.payload;
            break;
        case "TOGGLE_MODEL":
            draft.model = draft.model === "gpt-4o" ? "sonar" : "gpt-4o";
            break;
        case "SET_QUESTION_TYPES":
            draft.questionTypes = action.payload;
            draft.hasTFNG = action.payload.includes("tfng");
            draft.hasSQ = action.payload.includes("sq");
            draft.hasFitB = action.payload.includes("fitb");
            break;
        case "SET_WORD_COUNT":
            draft.word_count = action.payload;
            break;
        case "SET_SPEED":
            draft.speed = action.payload;
            break;
        case "SET_TENSES":
            console.log("Setting tenses to:", action.payload);
            draft.tenses = action.payload;
            break;
        case "SET_SELECTED_EXERCISE_ID":
            draft.selected_exercise_id = action.payload;
            break;
        default:
            return draft;
    }
}
