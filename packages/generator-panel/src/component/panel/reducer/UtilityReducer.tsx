import { produce } from "immer";
import { UtilityAction } from "./actionTypes";
import QuestionTypeEnum from "../enum/QuestionTypeEnum";
import PanelDataUpdateHandler from "../utils/panelDataHandler";
import makeMarkingJson from "../utils/makeMarkingJson";

// Helper function to calculate question numbers
const calculateQuestionNumbers = (questions: any[]): void => {
    let questionCount = 0;

    for (const question of questions) {
        if (
            question.type === QuestionTypeEnum.MCQ ||
            question.type === QuestionTypeEnum.SQ
        ) {
            questionCount++;
            question._questionNumber = questionCount;
        } else if (question.type === QuestionTypeEnum.TFNG) {
            for (let i = 0; i < question.statements.length; i++) {
                questionCount++;
                // Store the question number in the statement
                question.statements[i]._questionNumber = questionCount;
            }
        } else if (
            question.type.toLowerCase() ===
                QuestionTypeEnum.FITB.toLowerCase() ||
            question.type === QuestionTypeEnum.SELFITB ||
            question.type === QuestionTypeEnum.ARTFITB
        ) {
            for (let i = 0; i < question.question.length; i++) {
                if (question.question[i].type === "blank") {
                    questionCount++;
                    // Store the question number in the blank
                    question.question[i]._questionNumber = questionCount;
                }
            }
        }
        // Instruction text doesn't get a question number
    }
};

const utilityReducer = produce((draft: any, action: UtilityAction) => {
    switch (action.type) {
        case "SET_EXERCISE_CONTENT": {
            return action.payload;
        }

        case "UPDATE_CONTENT": {
            const { id, value } = action.payload;
            PanelDataUpdateHandler(draft, id, value);
            break;
        }

        case "CALCULATE_QUESTION_NUMBERS": {
            calculateQuestionNumbers(draft.questions);
            break;
        }

        case "ADD_QUESTION": {
            const { questionIndex, questionType } = action.payload;
            let newQuestion: any = { type: questionType };

            switch (questionType) {
                case "mcq":
                    newQuestion = {
                        type: questionType,
                        question: "type your question here",
                        answer: "a",
                        options: {
                            a: "type your option here",
                            b: "type your option here",
                            c: "type your option here",
                            d: "type your option here",
                        },
                    };
                    break;
                case "fitB":
                    newQuestion = {
                        type: questionType,
                        question: [
                            {
                                type: "text",
                                text: "type your text here",
                            },
                        ],
                    };
                    break;
                case "tfng":
                    newQuestion = {
                        type: questionType,
                        question: "type your question here",
                        statements: [
                            {
                                statement: "type your statement here",
                                answer: "T",
                            },
                        ],
                    };
                    break;
                case "sq":
                    newQuestion = {
                        type: questionType,
                        question: "type your question here",
                        answer: "",
                    };
                    break;
                case "instruction":
                    newQuestion = {
                        type: questionType,
                        text: "type your instruction here",
                    };
                    break;
            }

            draft.questions.splice(questionIndex + 1, 0, newQuestion);
            calculateQuestionNumbers(draft.questions);
            break;
        }

        case "DELETE_QUESTION": {
            const { questionIndex } = action.payload;
            draft.questions.splice(questionIndex, 1);
            calculateQuestionNumbers(draft.questions);
            break;
        }

        case "REORDER_QUESTIONS": {
            const { sourceIndex, destinationIndex } = action.payload;
            const [removed] = draft.questions.splice(sourceIndex, 1);
            draft.questions.splice(destinationIndex, 0, removed);
            calculateQuestionNumbers(draft.questions);
            break;
        }

        case "MARK_QUESTION": {
            const { tracingId, isCorrect } = action.payload;
            PanelDataUpdateHandler(draft, tracingId, isCorrect);
            console.log(draft);
            break;
        }

        case "SET_ANSWER": {
            const { tracingId, student_answer } = action.payload;
            PanelDataUpdateHandler(draft, tracingId, student_answer);
            break;
        }

        case "CHANGE_MCQ_OPTION": {
            const { mcqIndex, answer } = action.payload;
            draft.questions[mcqIndex].answer = answer;
            break;
        }

        case "ADD_MCQ_OPTION": {
            const { mcqIndex } = action.payload;
            const question = draft.questions[mcqIndex];
            console.log("Adding MCQ option to question:", question);
            const options = question.options;
            const keys = Object.keys(options);
            
            // Convert all keys to uppercase and sort them to find the highest letter
            const uppercaseKeys = keys.map(key => key.toUpperCase()).sort();
            const highestKey = uppercaseKeys[uppercaseKeys.length - 1];

            let nextKey = "a";
            if (highestKey) {
                const lastCharCode = highestKey.charCodeAt(0);
                if (lastCharCode >= 65 && lastCharCode < 90) {
                    nextKey = String.fromCharCode(lastCharCode + 1).toLowerCase();
                } else if (lastCharCode === 90) {
                    // Maximum options reached (Z is the last letter)
                    return;
                }
            }

            options[nextKey] = "type your option here";
            break;
        }

        case "DELETE_MCQ_OPTION": {
            const { mcqIndex, optionIndex } = action.payload;
            const question = draft.questions[mcqIndex];
            const options = question.options;
            delete options[optionIndex];

            // Get sorted keys (alphabetically) of the remaining options.
            const sortedKeys = Object.keys(options).sort();
            // Rearrange options with new consecutive keys starting from "a".
            const newOptions: { [key: string]: string } = {};
            let charCode = 97; // ASCII code for 'a'
            for (const key of sortedKeys) {
                newOptions[String.fromCharCode(charCode)] = options[key];
                charCode++;
            }
            question.options = newOptions;
            break;
        }

        case "ADD_TFNG_STATEMENT": {
            const { tfngIndex } = action.payload;
            const question = draft.questions[tfngIndex];
            const newStatement = {
                statement: "type your statement here",
                answer: "T",
            };
            question.statements.push(newStatement);
            calculateQuestionNumbers(draft.questions);
            break;
        }

        case "DELETE_TFNG_STATEMENT": {
            const { tfngIndex, statementIndex } = action.payload;
            const question = draft.questions[tfngIndex];
            question.statements.splice(statementIndex, 1);
            calculateQuestionNumbers(draft.questions);
            break;
        }

        case "CHANGE_TFNG_OPTION": {
            console.log("Changing TFNG option:", action.payload);
            const { tfngIndex, statementIndex, answer } = action.payload;
            const question = draft.questions[tfngIndex];
            question.statements[statementIndex].answer = answer;
            break;
        }

        case "ADD_FITB_COMPONENT": {
            const { fitbIndex, position, componentType } = action.payload;
            const question = draft.questions[fitbIndex].question;
            const newComponent = {
                type: componentType,
                text: "type your text here",
            };

            if (position === -1) {
                question.push(newComponent);
            } else {
                question.splice(position, 0, newComponent);
            }

            // Recalculate question numbers if adding a blank (which counts as a question)
            if (componentType === "blank") {
                calculateQuestionNumbers(draft.questions);
            }
            break;
        }

        case "DELETE_FITB_COMPONENT": {
            const { fitbIndex, position } = action.payload;
            const question = draft.questions[fitbIndex].question;
            const removedComponent = question[position];
            question.splice(position, 1);

            // Recalculate question numbers if removing a blank (which counts as a question)
            if (removedComponent.type === "blank") {
                calculateQuestionNumbers(draft.questions);
            }
            break;
        }

        case "TOGGLE_FITB_BLANK_EXAMPLE": {
            const { fitbIndex, position } = action.payload;
            const question = draft.questions[fitbIndex].question;
            const targetComponent = question[position];
            targetComponent.is_example = !targetComponent.is_example;
            break;
        }

        case "TOGGLE_EXAMPLE" : {
            const { questionIndex } = action.payload;
            const question = draft.questions[questionIndex];
            question.is_example = !question.is_example;
            console.log("Toggled is_example for question:", questionIndex, question.is_example);
            break;
        }

        case "TOGGLE_TFNG_STATEMENT_EXAMPLE": {
            const { tfngIndex, statementIndex } = action.payload;
            const question = draft.questions[tfngIndex];
            const targetStatement = question.statements[statementIndex];
            targetStatement.is_example = !targetStatement.is_example;
            break;
        }

        default:
            return draft;
    }
});

export default utilityReducer;