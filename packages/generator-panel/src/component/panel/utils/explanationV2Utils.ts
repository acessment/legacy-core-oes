import { IExerciseContentJsonData, IQuestion, ITfngQuestion, ITfngQuestionSeq } from "../type";
import QuestionTypeEnum from "../enum/QuestionTypeEnum";

type ExtractedQuestion = IQuestion | ITfngQuestionSeq;

export const questionExtractor = (jsonContent: IExerciseContentJsonData): ExtractedQuestion[] => {
    // extract all questions (TFNG statements are treated as individual questions here)
    // the whole fitB consider as one single question
    const extractedQuestions: ExtractedQuestion[] = [];

    for (const question of jsonContent.questions) {
        if (question.type === QuestionTypeEnum.TFNG) {
            const tfngQuestion = question as ITfngQuestion;
            extractedQuestions.push(...tfngQuestion.statements);
        } else {
            extractedQuestions.push(question);
        }
    }
    return extractedQuestions;
};

export const pushExplanationToJson = (jsonContent: IExerciseContentJsonData, explanation: string[]) => {
    // adding explanation back to json content
    const newJsonContent = JSON.parse(JSON.stringify(jsonContent));
    const explanationCopy = [...explanation];

    for (const question of newJsonContent.questions) {
        if (question.type === "tfng") {
            const tfngQuestion = question as ITfngQuestion
            tfngQuestion.statements.forEach((statement) => {
                statement.explanation_text = explanationCopy.shift() || "";
            });
        } else {
            question.explanation_text = explanationCopy.shift() || "";
        }
    }
    return newJsonContent;
};
