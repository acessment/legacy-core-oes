// Import users from Excel file
const importStudentsFromFile = async (formData: FormData) => {
    const response = await customAxios.post("/users/excel", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // Set timeout to 60 seconds
    });
    return response.data;
};
import reactRouterAxios from "@/api/reactRouterAxios";
import customAxios from "../../../api/customAxios";
import { HomeworkSummaryView } from "../../homework/type";
import {
    CommonNameReq,
    IAccountSummary,
    IAccountSummaryParams,
    ICreateUserRequest,
    IUserHomeworkParams,
    IUserRequest,
} from "../type";

const fetchAccountSummary = async (params: IAccountSummaryParams): Promise<IPagination<IAccountSummary>> => {
    const response = await customAxios.get<IPagination<IAccountSummary>>("/users/summary", {
        params,
    });
    return response.data;
};

const createSchool = async (data: CommonNameReq) => {
    const response = await customAxios.post("/schools", data);
    return response.data;
};

const createClassGroup = async (data: CommonNameReq) => {
    const response = await customAxios.post("/class-groups", data);
    return response.data;
};
const fetchInstitutionSchools = async () => {
    const response = await customAxios.get("/schools");
    return response.data;
};

const fetchInstitutionClassGroups = async () => {
    const response = await customAxios.get("/class-groups");
    return response.data;
};

const updateUserList = async (data: IUserRequest[]) => {
    const response = await customAxios.put("/users/list", data);
    return response.data;
};

const createUser = async (data: ICreateUserRequest) => {
    const response = await customAxios.post("/users/", data);
    return response.data;
};

const getUserAccountById = async (userId: string) => {
    const response = await customAxios.get<IAccountSummary>(`/users/${userId}`);
    return response.data;
};

const getUserHomework = async (params: IUserHomeworkParams, userId: string) => {
    const response = await customAxios.get<IPagination<HomeworkSummaryView>>(`/homeworks/user/${userId}/summaries`, {
        params,
    });
    return response.data;
};

const deleteUserList = async (userIds: string[]) => {
    const response = await customAxios.delete("/users/list", {
        data: { userIds },
    });
    return response.data;
};

// Download user account Excel summary
const downloadUserAccountExcel = async () => {
    const response = await customAxios.get("/users/excel", {
        responseType: "blob",
    });
    return response.data;
};
// Download user import Excel template
const downloadUserTemplate = async () => {
    const response = await customAxios.get("/users/excel/template", {
        responseType: "blob",
    });
    return response.data;
};

const adminResetPasswordSubmit = async (data: {
    newPassword: string;
    userId: string; // Assuming userId is needed to identify which user's password to reset
}) => {
    const response = await customAxios.put(`/users/admin/password`, data);
    return response.data;
};

const updateUserRole = async (data: { userId: string; roles: string[] }) => {
    const response = await reactRouterAxios.put(`/users/role`, data);
    return response.data;
};

export {
    fetchAccountSummary,
    createSchool,
    createClassGroup,
    fetchInstitutionClassGroups,
    updateUserList,
    createUser,
    fetchInstitutionSchools,
    getUserAccountById,
    getUserHomework,
    deleteUserList,
    downloadUserTemplate,
    downloadUserAccountExcel,
    importStudentsFromFile,
    adminResetPasswordSubmit,
    updateUserRole,
};
