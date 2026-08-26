interface IMarkingDetailResponse {
    id: string;
    title: string;
    grade: string[]; // List<Grade> in Java
    username: string;
    score: number;
    maxScore: number;
    markingJson: any;
    submittedDate: string; // ISO date-time string (LocalDateTime)
    markedAt: string; // ISO date-time string (LocalDateTime)
    classGroups: Array<{
        classGroupId: string;
        name: string;
    }>;
    school: {
        schoolId: string;
        name: string;
    };
}

interface markingRequest {
    markingJson: any; // The JSON content for marking
    score: number; // The score given for the homework
    maxScore: number; // The maximum score possible for the homework
}

export type { IMarkingDetailResponse, markingRequest };
