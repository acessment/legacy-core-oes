import customAxios from "../../../api/customAxios";
import { IAccountSummary } from "../../account/type";
import { IUserHomeworkDto } from "../types";

interface GetUserHomeworkParams {
    startDate: string;
    expiryDate: string;
    page?: number;
    limit?: number;
    excludeFutureHomework?: boolean;
}

interface PaginatedHomeworkResponse {
    data: IUserHomeworkDto[];
    page: number;
    limit: number;
    hasMore: boolean;
    total?: number;
    totalPages?: number;
}

const getUserCurrentHomeworkList = async (params: GetUserHomeworkParams) => {
    const response = await customAxios.get<PaginatedHomeworkResponse>("/homeworks/user/current", {
        params: params,
    });
    return response.data;
};

const getCurrentUserDetail = async () => {
    const response = await customAxios.get<IAccountSummary>("/users/current/detail");
    return response.data;
};

export { getUserCurrentHomeworkList, getCurrentUserDetail };
