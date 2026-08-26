interface IAccountSummaryParams {
    page: number;
    limit: number;
    schools: string;
    grades: string;
    classGroups: string;
    status: string;
    keyword: string;
    subscriptions?: string;
}

interface IAccountSummary {
    id: string;
    username: string;
    school: ISchool;
    grade: string;
    classGroups: IClassGroup[];
    status: string;
    totalSubmission: number;
    percentageScore: number;
    contact: string;
    roles?: string[];
}

interface ISchool {
    schoolId: string;
    name: string;
}

interface IUserBase {
    username: string;
    school: string | undefined;
    grade: string;
    classGroups: string[];
    contact: string;
    roles?: string[];
}

interface ICreateUserRequest extends IUserBase {
    password: string;
}

interface IUserRequest extends IUserBase {
    id: string;
    status: string;
}

interface FilterAccountsDialogFilterParams {
    schoolIds: string;
    grades: string;
    status: string;
    classGroupIds: string;
    subscriptions?: string;
}

interface IClassGroup {
    classGroupId: string;
    name: string;
}

interface CommonNameReq {
    name: string;
    institutionId: string;
}

interface DialogOption {
    value: string;
    label: string;
}

interface IUserHomeworkParams {
    categories: string; // Comma-separated list of categories
    submissionStatus: string;
    startDate: string; // ISO date string
    expiryDate: string; // ISO date string
    keyword: string;
    page: number;
    size: number;
    excludeFutureHomework?: boolean;
}

interface IUserHomeworkFilterParams {
    categories: string; // Comma-separated list of categories
    submissionStatus: string;
    startDate: string; // ISO date string
    expiryDate: string; // ISO date string
}

export interface CreateHomeworkRequest {
    exerciseId: string; // must not be null
    title: string; // must not be null
    category: string; // must not be null
    grade?: string[]; // optional (remove ? if must not be null)
    assignedTeacherId: string; // must not be null
    assignedStudentId: string; // must not be null
    startDate: string; // ISO date string, must not be null
    expiryDate: string; // ISO date string, must not be null
    username: string; // must not be null
}
export type {
    IAccountSummaryParams,
    IAccountSummary,
    CommonNameReq,
    IClassGroup,
    DialogOption,
    FilterAccountsDialogFilterParams,
    IUserRequest,
    ICreateUserRequest,
    IUserHomeworkParams,
    IUserHomeworkFilterParams,
};
