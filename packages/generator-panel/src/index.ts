// Import CSS styles
import './component/panel/css/template.css';

// Main entry point for the package
export { default as MainPanelWrapper } from './component/panel/component/MainPanelWrapper';
export { default as ExerciseContentTemplate } from './component/panel/component/desktop/exerciseContentTemplate';
export { default as MExerciseContentTemplate } from './component/panel/component/mobile/MExerciseContentTemplate';
export { default as utilityReducer } from './component/panel/reducer/UtilityReducer';

// Export SSR-safe ReactQuill wrapper
export { ReactQuillClient } from './component/panel/component/ReactQuillClient';
export type { ReactQuillClientProps } from './component/panel/component/ReactQuillClient';

// Export all types
export type {
  IExerciseContentJsonData,
  IQuestion,
  IFitBQuestion,
  IMcqQuestion,
  ISqQuestion,
  ITfngQuestion,
  IInstruction,
  IFitBQuestionSeq,
  ITfngQuestionSeq,
  IMQuestionProps
} from './component/panel/type/index';

// Export QuestionTypeEnum
export { default as QuestionTypeEnum } from './component/panel/enum/QuestionTypeEnum';

// Export action types
export type { UtilityAction } from './component/panel/reducer/actionTypes';

// Export utility functions
export { default as PanelDataUpdateHandler } from './component/panel/utils/panelDataHandler';
export { calculateQuestionNumbers, totalQuestionCount } from './component/panel/utils/calculateQuestionNumber';
export { default as makeMarkingJson, getScore } from './component/panel/utils/makeMarkingJson';
export { pushExplanationToJson, questionExtractor} from './component/panel/utils/explanationV2Utils';
