import { HomeworkSummariesParams, HomeworkSummaryView } from "@/feature/homework/type";
import { ICurrentUser } from "@/provider/types";
import { createContext } from "react";

// Base interface for plugin contexts
export interface BasePluginContextValue {
    selectedItems?: unknown[];
    dialogDispatch?: React.Dispatch<{ type: string; [key: string]: unknown }>;
    [key: string]: unknown; // Allow additional properties
}

export type HomeworkPluginContextValue = BasePluginContextValue & {
    selectedItems: HomeworkSummaryView[];
    dialogDispatch: React.Dispatch<{ type: string; [key: string]: unknown }>;
    fetchData: (params: HomeworkSummariesParams) => Promise<void>;
    user: ICurrentUser | null;
    searchQuery: HomeworkSummariesParams;
    dialogState: Record<string, boolean>;
};

export const HomeworkPluginContext = createContext<HomeworkPluginContextValue | undefined>(undefined);