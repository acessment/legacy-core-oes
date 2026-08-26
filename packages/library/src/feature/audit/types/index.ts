interface IAuditTrail {
    createdAt: string;
    username: string;
    entity: string;
    actionType: string;
    action: string;
}

interface IAuditTrailFilterParams {
    entityTypes: string; // comma-separated values
    studentIds: string; // comma-separated IDs
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    keyword?: string;
    page: number;
    size: number;
}

interface IAuditTrailDialogFilterParams {
    entityTypes: string[];
    studentIds: string[];
    startDate: string;
    endDate: string;
}

export type { IAuditTrail, IAuditTrailFilterParams, IAuditTrailDialogFilterParams };
