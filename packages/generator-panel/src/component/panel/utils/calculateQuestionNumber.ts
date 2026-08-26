import QuestionTypeEnum from "../enum/QuestionTypeEnum";
import { IExerciseContentJsonData } from "../type";

export const calculateQuestionNumbers = (
    jsonData: IExerciseContentJsonData
): IExerciseContentJsonData => {
    let questionCount = 0;

    if (!jsonData || !jsonData.questions) {
        return jsonData || { questions: [] };
    }

    // Modify the original data in-place instead of creating a copy
    for (const question of jsonData.questions) {
        if (
            question.type === QuestionTypeEnum.MCQ ||
            question.type === QuestionTypeEnum.SQ
        ) {
            questionCount++;
            question._questionNumber = questionCount;
        } else if (question.type === QuestionTypeEnum.TFNG) {
            for (let i = 0; i < question.statements.length; i++) {
                questionCount++;
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
                    question.question[i]._questionNumber = questionCount;
                }
            }
        }
    }

    return jsonData; // Return the same reference
};

export const totalQuestionCount = (
    jsonData: IExerciseContentJsonData
): number => {
    // counting valid questions, not including examples

    let questionCount = 0;

    if (!jsonData || !jsonData.questions) {
        return 0;
    }

    // Count questions without modifying the data
    for (const question of jsonData.questions) {
        if (
            (question.type === QuestionTypeEnum.MCQ ||
            question.type === QuestionTypeEnum.SQ) && !question.is_example
        ) {
            questionCount++;
        } else if (question.type === QuestionTypeEnum.TFNG) {
            const tfngQuestion = question as any;
            questionCount += tfngQuestion.statements.length;
            questionCount -= tfngQuestion.statements.filter((s: any) => s.is_example).length;
        } else if (
            question.type.toLowerCase() ===
                QuestionTypeEnum.FITB.toLowerCase() ||
            question.type === QuestionTypeEnum.SELFITB ||
            question.type === QuestionTypeEnum.ARTFITB
        ) {
            const fitbQuestion = question as any;
            for (let i = 0; i < fitbQuestion.question.length; i++) {
                if (fitbQuestion.question[i].type === "blank" && !fitbQuestion.question[i].is_example) {
                    questionCount++;
                }
            }
        }
    }

    return questionCount;
};