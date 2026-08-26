import { IExerciseContentJsonData, QuestionTypeEnum } from "../type";

// General setter
export const SET_EXERCISE_CONTENT = "SET_EXERCISE_CONTENT";
export const UPDATE_CONTENT = "UPDATE_CONTENT";

// General question action types
export const ADD_QUESTION = "ADD_QUESTION";
export const DELETE_QUESTION = "DELETE_QUESTION";
export const REORDER_QUESTIONS = "REORDER_QUESTIONS";
export const MARK_QUESTION = "MARK_QUESTION";
export const SET_ANSWER = "SET_ANSWER";
export const CALCULATE_QUESTION_NUMBERS = "CALCULATE_QUESTION_NUMBERS";
export const TOGGLE_EXAMPLE = "TOGGLE_EXAMPLE";

// MCQ specific action types
export const CHANGE_MCQ_OPTION = "CHANGE_MCQ_OPTION";
export const ADD_MCQ_OPTION = "ADD_MCQ_OPTION";
export const DELETE_MCQ_OPTION = "DELETE_MCQ_OPTION";

// TFNG specific action types
export const ADD_TFNG_STATEMENT = "ADD_TFNG_STATEMENT";
export const DELETE_TFNG_STATEMENT = "DELETE_TFNG_STATEMENT";
export const CHANGE_TFNG_OPTION = "CHANGE_TFNG_OPTION";
export const TOGGLE_TFNG_STATEMENT_EXAMPLE = "TOGGLE_TFNG_STATEMENT_EXAMPLE";

// FitB specific action types
export const ADD_FITB_COMPONENT = "ADD_FITB_COMPONENT";
export const DELETE_FITB_COMPONENT = "DELETE_FITB_COMPONENT";
export const CHANGE_FITB_BLANK = "CHANGE_FITB_BLANK";
export const TOGGLE_FITB_BLANK_EXAMPLE = "TOGGLE_FITB_BLANK_EXAMPLE";

interface SetExerciseContent {
    type: typeof SET_EXERCISE_CONTENT;
    payload: IExerciseContentJsonData;
}

interface UpdateContent {
    type: typeof UPDATE_CONTENT;
    payload: {
        id: string;
        value: string;
    };
}

interface AddQuestion {
    type: typeof ADD_QUESTION;
    payload: {
        questionIndex: number;
        questionType: QuestionTypeEnum;
    };
}

interface DeleteQuestion {
    type: typeof DELETE_QUESTION;
    payload: {
        questionIndex: number;
    };
}

interface ReorderQuestions {
    type: typeof REORDER_QUESTIONS;
    payload: {
        sourceIndex: number;
        destinationIndex: number;
    };
}

interface MarkQuestion {
    type: typeof MARK_QUESTION;
    payload: {
        tracingId: string;
        isCorrect: boolean;
    };
}

interface SetAnswer {
    type: typeof SET_ANSWER;
    payload: {
        tracingId: string;
        student_answer: string;
    };
}

interface CalculateQuestionNumbers {
    type: typeof CALCULATE_QUESTION_NUMBERS;
    payload?: never; // No payload needed for this action
}

interface ChangeMcqOptionAction {
    type: typeof CHANGE_MCQ_OPTION;
    payload: {
        mcqIndex: number;
        answer: string;
    };
}

interface AddMcqOption {
    type: typeof ADD_MCQ_OPTION;
    payload: {
        mcqIndex: number;
    };
}

interface DeleteMcqOptionAction {
    type: typeof DELETE_MCQ_OPTION;
    payload: {
        mcqIndex: number;
        optionIndex: string;
    };
}

interface AddTfngStatement {
    type: typeof ADD_TFNG_STATEMENT;
    payload: {
        tfngIndex: number;
    };
}

interface DeleteTfngStatement {
    type: typeof DELETE_TFNG_STATEMENT;
    payload: {
        tfngIndex: number;
        statementIndex: number;
    };
}

interface ChangeTfngOption {
    type: typeof CHANGE_TFNG_OPTION;
    payload: {
        tfngIndex: number;
        statementIndex: number;
        answer: string;
    };
}

interface AddFitbComponent {
    type: typeof ADD_FITB_COMPONENT;
    payload: {
        fitbIndex: number;
        position: number;
        componentType: "text" | "blank";
    };
}

interface DeleteFitbComponent {
    type: typeof DELETE_FITB_COMPONENT;
    payload: {
        fitbIndex: number;
        position: number;
    };
}

interface ToggleFitbBlankExample {
    type: typeof TOGGLE_FITB_BLANK_EXAMPLE;
    payload: {
        fitbIndex: number;
        position: number;
    };
}

interface ToggleExample {
    type: typeof TOGGLE_EXAMPLE;
    payload: {
        questionIndex: number;
    };
}

interface ToggleTfngStatementExample {
    type: typeof TOGGLE_TFNG_STATEMENT_EXAMPLE;
    payload: {
        tfngIndex: number;
        statementIndex: number;
    };
}

export type UtilityAction =
| SetExerciseContent
| UpdateContent
| AddQuestion
| DeleteQuestion
| ReorderQuestions
| MarkQuestion
| SetAnswer
| CalculateQuestionNumbers
| ChangeMcqOptionAction
| AddMcqOption
| DeleteMcqOptionAction
| AddTfngStatement
| DeleteTfngStatement
| ChangeTfngOption
| AddFitbComponent
| DeleteFitbComponent
| ToggleFitbBlankExample
| ToggleExample
| ToggleTfngStatementExample
;
