import { IExerciseContentJsonData, IFitBQuestion, IMcqQuestion, ISqQuestion, ITfngQuestion } from "../type";
import QuestionTypeEnum from "../enum/QuestionTypeEnum";
import { totalQuestionCount } from "./calculateQuestionNumber";


const makeMarkingJson = (data: IExerciseContentJsonData): IExerciseContentJsonData => {
    const updatedData = { ...data };
    let score = 0;
    
    updatedData.questions = data.questions.map(question => {
        switch (question.type) {
            case QuestionTypeEnum.FITB:
                const fitbQuestion = question as IFitBQuestion;
                if (!fitbQuestion.is_example) {
                    return {
                        ...fitbQuestion,
                        question: fitbQuestion.question.map(seq => {
                            if (!seq.is_example && seq.type === "blank") {
                                // Below we replace non-breaking spaces with regular spaces
                                const trimmedAnswer = seq.student_answer?.trim().replace(" "," ") ?? "";
                                const isCorrect = trimmedAnswer ? 
                                    trimmedAnswer === seq.text.replace(" "," ") : false;
                                if (isCorrect) score++;
                                return {
                                    ...seq,
                                    student_answer: trimmedAnswer,
                                    is_correct: isCorrect
                                };
                            }
                            return seq;
                        })
                    };
                }
                return fitbQuestion;
                
            case QuestionTypeEnum.MCQ:
                const mcqQuestion = question as IMcqQuestion;
                if (!mcqQuestion.is_example) {
                    const trimmedAnswer = mcqQuestion.student_answer?.trim() ?? "";
                    const isCorrect = trimmedAnswer ? 
                        trimmedAnswer.toLowerCase() === mcqQuestion.answer?.toLowerCase() : false;
                    if (isCorrect) score++;
                    return {
                        ...mcqQuestion,
                        student_answer: trimmedAnswer,
                        is_correct: isCorrect
                    };
                }
                return mcqQuestion;
                
            case QuestionTypeEnum.SQ:
                const sqQuestion = question as ISqQuestion;
                if (!sqQuestion.is_example) {
                    const trimmedAnswer = sqQuestion.student_answer?.trim().replace(" "," ") ?? "(No answer)";
                    const isCorrect = trimmedAnswer ? 
                        trimmedAnswer === sqQuestion.answer.replace(" "," ") : false;
                    if (isCorrect) score++;
                    return {
                        ...sqQuestion,
                        student_answer: trimmedAnswer || "",
                        is_correct: isCorrect
                    };
                }
                return sqQuestion;
                
            case QuestionTypeEnum.TFNG:
                const tfngQuestion = question as ITfngQuestion;
                return {
                    ...tfngQuestion,
                    statements: tfngQuestion.statements.map(statement => {
                        if (!statement.is_example) {
                            const trimmedAnswer = statement.student_answer?.trim() ?? "";
                            const isCorrect = trimmedAnswer ? 
                                trimmedAnswer === statement.answer : false;
                            if (isCorrect) score++;
                            return {
                                ...statement,
                                student_answer: trimmedAnswer,
                                is_correct: isCorrect
                            };
                        }
                        return statement;
                    })
                };
                
            default:
                return question;
        }
    });
    
    // Get the total question count and add both score and maxScore fields to the exercise data
    const maxScore = totalQuestionCount(data);
    updatedData.score = score;
    updatedData.maxScore = maxScore;
    updatedData.is_correction = true;
    
    return updatedData;
};

const getScore = (data: IExerciseContentJsonData): number => {
    let score = 0;
    
    if (!data || !data.questions) {
        return 0;
    }
    
    data.questions.forEach(question => {
        switch (question.type) {
            case QuestionTypeEnum.FITB:
                const fitbQuestion = question as IFitBQuestion;
                if (!fitbQuestion.is_example) {
                    fitbQuestion.question.forEach(seq => {
                        if (!seq.is_example && seq.type === "blank") {
                            const isCorrect = seq.is_correct || false;
                            if (isCorrect) score++;
                        }
                    });
                }
                break;
                
            case QuestionTypeEnum.MCQ:
                const mcqQuestion = question as IMcqQuestion;
                if (!mcqQuestion.is_example) {
                    const isCorrect = mcqQuestion.is_correct || false;
                    if (isCorrect) score++;
                }
                break;
                
            case QuestionTypeEnum.SQ:
                const sqQuestion = question as ISqQuestion;
                if (!sqQuestion.is_example) {
                    const isCorrect = sqQuestion.is_correct || false;
                    if (isCorrect) score++;
                }
                break;
                
            case QuestionTypeEnum.TFNG:
                const tfngQuestion = question as ITfngQuestion;
                tfngQuestion.statements.forEach(statement => {
                    if (!statement.is_example) {
                        const isCorrect = statement.is_correct || false;
                        if (isCorrect) score++;
                    }
                });
                break;
                
            default:
                break;
        }
    });
    
    return score;
};

export default makeMarkingJson;
export { getScore };
