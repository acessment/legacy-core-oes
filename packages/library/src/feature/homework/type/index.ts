import { IExerciseContentJsonData } from "@acessment/generator-panel";

interface ExerciseInfoDto {
    title: string;
    category: string;
    grades: string[]; // List<Grade> in Java
    welcomeExercise: boolean;
    autoAssigned?: boolean;
    assignDate?: Date | null;
}
// Type for submitHomeworkRequest Java record
interface ISubmitHomeworkRequest {
    homeworkId: string;
    submittedJson: any;
    markingJson: any;
    score: number;
    maxScore: number;
}
interface IMLSummary {
    homeworkCount: number;
    submitedHomeworkCount: number;
    assignedDate: string;
    homeworkStatus: string;
    homeworkItems: IHomeworkItemStatus[];
}

interface IHomeworkItemStatus {
    exerciseId: string;
    status: string;
    category: string;
    title: string;
}

// New Homework Type according to the database schema in the meeting notes repo
interface IHomework {
    id: string;
    exercise_id: string;
    start_date: string;
    expiry_date: string;
    title: string;
    category: string;
    grade: string;
    username: string;
    score: number;
    submission_status: string;
    submitted_json: string;
    submission_time: string;
}

interface IHomeworkDetail {
    id: string;
    title: string;
    category: string; // or Category if you have an enum/type
    grade: string[]; // List<Grade> in Java
    startDate: string; // ISO date string (LocalDate)
    expiryDate: string; // ISO date string (LocalDate)
    username: string;
    score: number;
    maxScore: number;
    audioSrc?: string; // optional, if applicable
    contentJson: any; // Object in Java
    submittedDate: string; // ISO date-time string (LocalDateTime)
    submissionStatus: string; // or HomeworkSubmissionStatus if you have an enum/type
    markingStatus: "Marked" | "Pending";
}

interface IExerciseFilter {
    categories: string;
    grades: string;
    createdStartedAt: string;
    createdEndedAt: string;
    keyword: string;
    page: number;
    size: number;
    welcomeExercise?: boolean; // Optional, to filter welcome exercises
    assignStartedAt?: string;
    assignEndedAt?: string;
    uploadPDFLibrary?: boolean; // Optional, to filter exercises enabled for PDF Library
}

interface FIlterExerciseDialogProps {
    categories: string;
    grades: string;
    createdStartedAt: string;
    createdEndedAt: string;
    welcomeExercise: boolean;
    assignStartedAt?: string;
    assignEndedAt?: string;
    uploadPDFLibrary?: boolean;
}
interface IExerciseSummary {
    id: string;
    title: string;
    category: string;
    grade: string[];
    createdAt: string;
    uploadPDFLibrary?: boolean; // exercises enabled for PDFLibrary
}
interface HomeworkSummariesParams {
    classGroups: string; // comma-separated IDs
    keyword: string;
    schools: string; // comma-separated IDs
    grades: string; // comma-separated values
    categories: string; // comma-separated values
    submissionStatus: string;
    markingStatus: string;
    startDate: string; // ISO date string
    expiryDate: string; // ISO date string
    page: number; // Optional pagination
    size: number; // Optional page size
}
interface HomeworkSummaryView {
    id: string;
    title: string;
    category: string;
    grade: string;
    startDate: string;
    expiryDate: string;
    username: string;
    assignedStudentId: string;
    percentageScore: number;
    submissionStatus: string;
    markingStatus: string;
}
interface filterHomeworkParams {
    categories: string;
    grades: string;
    schools: string;
    classGroups: string;
    submissionStatus: string;
    markingStatus: string;
    startDate: string;
    expiryDate: string;
}
// Type for ExerciseResponse Java class
interface IExerciseResponse {
    id: string;
    title: string;
    grade: string[]; // List<Grade> in Java
    category: string; // or Category if you have an enum/type
    audioSrc: string;
    content: any;
    updatedAt: string; // ISO date string
    welcomeExercise: boolean;
    assignDate?: string | null; // ISO date string or null
    autoAssigned?: boolean;
    uploadPDFLibrary?: boolean; // Marks exercises from PDFLibrary migration
}

interface IUpdateExerciseReq {
    title: string;
    grade: string[]; // List<Grade> in Java
    category: string; // or Category if you have an enum/type
    content: any;
    welcomeExercise?: boolean; // Optional, if applicable
    uploadPDFLibrary?: boolean; // Optional, marks exercises from PDFLibrary migration
}

interface IMarkingV2Req {
    image_b64s: string[];
    exercise_json: IExerciseContentJsonData[];
    skip_double_encode?: boolean;
}
export type {
    IMarkingV2Req,
    IMLSummary,
    IHomeworkItemStatus,
    IHomework,
    IExerciseFilter,
    IExerciseSummary,
    FIlterExerciseDialogProps,
    HomeworkSummariesParams,
    HomeworkSummaryView,
    filterHomeworkParams,
    IHomeworkDetail,
    ISubmitHomeworkRequest,
    IExerciseResponse,
    IUpdateExerciseReq,
    ExerciseInfoDto,
};
