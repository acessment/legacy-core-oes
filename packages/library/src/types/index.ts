// Local fallback type for pagination (if not globally available)
type IPagination<T> = {
    content: T[];
    pageable?: any;
    totalPages: number;
    totalElements: number;
    last?: boolean;
    numberOfElements?: number;
    first?: boolean;
    size: number;
    number: number;
    sort?: any;
    empty?: boolean;
};

export type { IPagination };

export type Level = "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6";

// OptionType represents a single option with a value and label
export type OptionType = {
  value: string;
  label: string;
};

// OptionTypeArray is an array of OptionType
export type OptionTypeArray = OptionType[];

export const categoryOptions = [
    { value: "reading", label: "Reading" },
    { value: "listening", label: "Listening" },
    { value: "grammar-templates", label: "Grammar Templates" },
    { value: "grammar-mixed-tenses", label: "Grammar Mixed Tenses" },
    { value: "freestyle", label: "Freestyle/Exercise Cloning" },
] as const;

export type CategoryValue = (typeof categoryOptions)[number]["value"];

export const questionTypeOptions = [
    { value: "mcq", label: "MCQ", disabled: true },
    { value: "sq", label: "Long Question" },
    { value: "tfng", label: "True False Not Given" },
    { value: "fitb", label: "Fill in the Blanks" },
] as const;

export type QuestionTypeValue = (typeof questionTypeOptions)[number]["value"];
