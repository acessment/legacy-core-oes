import customAxios from "../../../api/customAxios";
import DateObject from "react-date-object";
import {
    HomeworkSummariesParams,
    HomeworkSummaryView,
    IExerciseFilter,
    IExerciseResponse,
    IExerciseSummary,
    IHomeworkDetail,
    ISubmitHomeworkRequest,
    IUpdateExerciseReq,
} from "../type";
import { CreateHomeworkRequest } from "../../account/type";
import { swrFetcher } from "@/api/httpClient";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify/unstyled";
import { t } from "i18next";

const getMLSummary = async (userId: string, date?: DateObject | null) => {
    let dateString = "";
    if (date) {
        dateString = `?date=${date.format("YYYY-MM-DD")}`;
    }
    const res = await customAxios.get(`/homework/summary/${userId}${dateString}`);
    return res.data;
};

const getRecommendExercise = async (userId: string) => {
    const res = await customAxios.get(`/exercise/recommend?id=${userId}`);
    return res.data;
};

const getTopExercise = async () => {
    const res = await customAxios.get(`/exercise/top`);
    return res.data;
};

const getBookmarkedExercise = async (userId: string) => {
    const res = await customAxios.get(`/exercise/bookmark?userId=${userId}`);
    return res.data;
};

const getHomeworkList = async (userId: string, date?: DateObject | null) => {
    let dateString = "";
    if (date) {
        dateString = `?date=${date.format("YYYY-MM-DD")}`;
    }

    const res = await customAxios.get(`/homework/list/${userId}${dateString}`);
    return res.data;
};

const fetchExerciseSummary = async (params: IExerciseFilter) => {
    const res = await customAxios.get<IPagination<IExerciseSummary>>("/exercises/summary", {
        params,
    });
    return res.data;
};

const fetchStudentOptions = async (params: {
    schoolIds: string;
    classGroupIds: string;
    grades: string;
    subscriptions?: string;
}) => {
    const res = await customAxios.get("/users/options", {
        params,
    });
    return res.data;
};

const createHomework = async (data: CreateHomeworkRequest[]) => {
    const response = await customAxios.post("/homeworks/list", data);
    return response.data;
};

const fetchHomeworkSummaries = async (params: HomeworkSummariesParams) => {
    const response = await customAxios.get<IPagination<HomeworkSummaryView[]>>("/homeworks/summaries", {
        params,
    });
    return response.data;
};

const deleteHomeworkList = async (homeworkIds: string[]) => {
    const response = await customAxios.delete(`/homeworks/list`, {
        data: homeworkIds,
    });
    return response.data;
};

const getHomework = async (homeworkId: string) => {
    const res = await customAxios.get<IHomeworkDetail>(`/homeworks/${homeworkId}`);
    return res.data;
};
const submitHomework = async (data: ISubmitHomeworkRequest) => {
    const res = await customAxios.put(`/homeworks/submit`, data);
    return res.data;
};

const getExercise = async (exerciseId: string) => {
    const res = await customAxios.get<IExerciseResponse>(`/exercises/${exerciseId}`);
    return res.data;
};
const updateExercise = async (exerciseId: string, data: IUpdateExerciseReq) => {
    const res = await customAxios.put(`/exercises/${exerciseId}`, data);
    return res.data;
};

const deleteExercise = async (exerciseId: string) => {
    const res = await customAxios.delete(`/exercises/${exerciseId}`);
    return res.data;
};

const useDeleteExerciseList = () => {
    const deleteExerciseListFetcher = async (url: string, { arg }: { arg: { exerciseIds: string[] } }) => {
        return await swrFetcher.delete(url, { data: { exerciseIds: arg.exerciseIds } });
    };

    const { trigger, isMutating, error, data } = useSWRMutation<void, Error, string, { exerciseIds: string[] }>(
        "/exercises/list",
        deleteExerciseListFetcher,
        {
            onSuccess: () => {
                toast.success(t("Selected exercises deleted successfully"));
            },
            onError: (error) => {
                toast.error(t("Failed to delete exercises: ") + error.message);
            },
        }
    );

    return {
        deleteExerciseList: trigger,
        isDeleting: isMutating,
        error,
        data,
    };
};

const markingV2 = async (req: FormData) => {
    const response = await customAxios.post("/generate/marking/v2", req, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        timeout: 1000 * 600,
    });
    return response.data;
};
export {
    getMLSummary,
    getRecommendExercise,
    getTopExercise,
    getBookmarkedExercise,
    getHomeworkList,
    fetchExerciseSummary,
    fetchStudentOptions,
    createHomework,
    fetchHomeworkSummaries,
    deleteHomeworkList,
    getHomework,
    submitHomework,
    getExercise,
    updateExercise,
    deleteExercise,
    useDeleteExerciseList,
    markingV2,
};
