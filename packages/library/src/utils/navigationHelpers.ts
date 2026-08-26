import { RoleEnum } from "@/enum/RoleEnum";
import type { ICurrentUser } from "@/provider/types";

/**
 * Get the appropriate student detail URL based on user role
 * @param studentId - The student ID
 * @param user - The current user with roles
 * @returns The URL path for the student detail page
 */
export const getStudentUrl = (studentId: string, user?: ICurrentUser | null): string => {
    if (!user) return "/";

    if (user.roles?.includes(RoleEnum.ADMIN)) {
        return `/admin/student/${studentId}`;
    }

    if (user.roles?.includes(RoleEnum.TEACHER)) {
        return `/teacher/student/${studentId}`;
    }

    return `/user`; // fallback for regular users
};

/**
 * Get the appropriate document detail URL based on user role
 * @param documentId - The document ID
 * @param user - The current user with roles
 * @returns The URL path for the document detail page
 */
export const getDocumentUrl = (documentId: string, user?: ICurrentUser | null): string => {
    if (!user) return "/";

    if (user.roles?.includes(RoleEnum.ADMIN)) {
        return `/admin/document/${documentId}`;
    }

    if (user.roles?.includes(RoleEnum.TEACHER)) {
        return `/teacher/document/${documentId}`;
    }

    return `/user`; // fallback for regular users
};

/**
 * Get the appropriate marking panel URL based on user role
 * @param markingId - The marking/homework ID
 * @param user - The current user with roles
 * @returns The URL path for the marking panel page
 */
export const getMarkingPanelUrl = (markingId: string, user?: ICurrentUser | null): string => {
    if (!user) return "/";

    if (user.roles?.includes(RoleEnum.ADMIN)) {
        return `/admin/marking/${markingId}/panel`;
    }

    if (user.roles?.includes(RoleEnum.TEACHER)) {
        return `/teacher/marking/${markingId}/panel`;
    }

    return `/user`; // fallback for regular users
};

/**
 * Get the base URL prefix based on user role
 * @param user - The current user with roles
 * @returns The base URL prefix (/admin, /teacher, or /user)
 */
export const getBaseUrlPrefix = (user?: ICurrentUser | null): string => {
    if (!user) return "/";

    if (user.roles?.includes(RoleEnum.ADMIN)) {
        return "/admin";
    }

    if (user.roles?.includes(RoleEnum.TEACHER)) {
        return "/teacher";
    }

    return "/user";
};
