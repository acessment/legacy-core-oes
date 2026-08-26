type ICurrentUser = {
    id: string;
    username: string;
    roles: string[];
    institutionId: string;
    grade: string;
    contact: string;
    school: string;
    status: string;
    classGroups: string[];
};

export type { ICurrentUser };
