import { IExerciseContentJsonData } from "@acessment/generator-panel";
import { createContext } from "react";

export type SingleHomeworkPluginContextValue = {
    jsonContent: IExerciseContentJsonData;
    jsonDispatch: React.Dispatch<{ type: string; payload?: IExerciseContentJsonData; [key: string]: unknown }>;
};

export const SingleHomeworkPluginContext = createContext<SingleHomeworkPluginContextValue | undefined>(undefined);