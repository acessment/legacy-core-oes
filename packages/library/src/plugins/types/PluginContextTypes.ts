import { IExerciseContentJsonData } from "@acessment/generator-panel";

/**
 * Base interface for OCR plugin context
 * Any context that wants to use OCRPlugin must implement this interface
 */
export interface OCRPluginContextValue {
    jsonContent: IExerciseContentJsonData;
    jsonDispatch: React.Dispatch<{ type: string; payload?: IExerciseContentJsonData; [key: string]: unknown }>;
}

/**
 * Generic plugin context interface for exercise-related plugins
 * Can be extended for other plugin types in the future
 */
export interface ExercisePluginContextValue extends OCRPluginContextValue {
    // Can be extended with additional properties as needed
}