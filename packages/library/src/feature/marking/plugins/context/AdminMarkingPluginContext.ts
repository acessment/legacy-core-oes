import { IExerciseContentJsonData } from "@acessment/generator-panel";
import { createContext } from "react";

export type AdminMarkingPluginContextValue = {
    jsonContent: IExerciseContentJsonData;
    jsonDispatch: React.Dispatch<any>;
};

export const AdminMarkingPluginContext = createContext<AdminMarkingPluginContextValue | undefined>(undefined);