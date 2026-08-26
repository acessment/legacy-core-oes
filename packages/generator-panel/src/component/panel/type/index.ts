import QuestionTypeEnum from "../enum/QuestionTypeEnum";
interface IExerciseContentJsonData {
    title: string;
    instruction: string;
    tags?: string[];
    reading: string;
    options: string[];
    examples?: {
        type: string;
        question: IFitBQuestionSeq[];
        answer: string;
    }[];

    questions: IQuestion[];
    questions_str?: string;
    exercise_id: string;
    exercise_type_id?: string;
    is_correction?: boolean;
    category?: string;
    timestamp?: string;
    score?: string | number;
    maxScore?: string | number;
    script?: string;
}

interface IQuestion {
    type: QuestionTypeEnum;
    explanation_text?: string;
    is_example?: boolean;
}

interface IFitBQuestion extends IQuestion {
    question: IFitBQuestionSeq[];
    inline_explanation?: string;
    is_example?: boolean;
    is_correct?: boolean;
    answer?: string;
    explanation_text?: string;
    images?: string[];
    student_answer: string;
    // options?: Record<"a" | "b" | "c" | "d", string>;
}

interface IMcqQuestion extends IQuestion {
    question: string;
    options: Record<"a" | "b" | "c" | "d", string>;
    answer: string;
    student_answer: string;
    is_correct?: boolean;
    is_example?: boolean;
}

interface IInstruction extends IQuestion {
    text: string;
}

interface ISqQuestion extends IQuestion {
    question: string;
    answer: string;
    student_answer: string;
    is_correct?: boolean;
    is_example?: boolean;
}

interface ITfngQuestion extends IQuestion {
    instruction: string;
    statements: ITfngQuestionSeq[];
    paragraph: string;
}

interface ITfngQuestionSeq {
    statement: string;
    answer: string;
    student_answer: "T" | "F" | "NG" | "";
    is_correct?: boolean;
    is_example?: boolean;
    explanation_text?:string
}

interface IFitBQuestionSeq {
    type: string;
    text: string;
    is_correct?: boolean;
    student_answer?: string;
    explanation_text?: string;
    explanation?: string;
    is_example?: boolean;
}

interface IMQuestionProps {
    question:
        | IFitBQuestion
        | IMcqQuestion
        | ISqQuestion
        | ITfngQuestion
        | IInstruction;
    showUtility: boolean;
    showMarkingUtility: boolean;
    isExerciseView: boolean;
}

export type { IExerciseContentJsonData, IQuestion, IFitBQuestionSeq, ITfngQuestionSeq, QuestionTypeEnum, IFitBQuestion, IInstruction ,IMcqQuestion, ISqQuestion, ITfngQuestion, IMQuestionProps };
