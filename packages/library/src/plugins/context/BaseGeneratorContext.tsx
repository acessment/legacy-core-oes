import { createContext } from "react";
import { IExerciseContentJsonData, UtilityAction } from "@acessment/generator-panel";
import { useImmerReducer } from "use-immer";

export interface BaseGeneratorContextValue {
    jsonContent: IExerciseContentJsonData;
    jsonDispatch: ReturnType<typeof useImmerReducer<IExerciseContentJsonData, UtilityAction>>[1];
}

export const BaseGeneratorContext = createContext<BaseGeneratorContextValue | undefined>(undefined);
