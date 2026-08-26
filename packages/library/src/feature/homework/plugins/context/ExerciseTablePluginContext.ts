import { IExerciseFilter, IExerciseSummary } from "@/feature/homework/type";
import { ICurrentUser } from "@/provider/types";
import { createContext } from "react";

// Base interface for plugin contexts
export interface BasePluginContextValue {
    selectedItems?: unknown[];
    dialogDispatch?: React.Dispatch<{ type: string; [key: string]: unknown }>;
    [key: string]: unknown; // Allow additional properties
}

export type ExercisePluginContextValue = BasePluginContextValue & {
    selectedItems: IExerciseSummary[];
    dialogDispatch: React.Dispatch<{ type: string; [key: string]: unknown }>;
    user: ICurrentUser | null;
    searchQuery: IExerciseFilter;
    dialogState: Record<string, boolean>;
};

export const ExercisePluginContext = createContext<ExercisePluginContextValue | undefined>(undefined);