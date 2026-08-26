import customAxios from "../../../api/customAxios";
import { IMarkingDetailResponse, markingRequest } from "../type";

const getMarkingDetail = async (homeworkId: string): Promise<IMarkingDetailResponse> => {
    const response = await customAxios.get<IMarkingDetailResponse>(`/homeworks/${homeworkId}/marking`);
    return response.data;
};

const updateMarking = async (homeworkId: string, markingData: markingRequest): Promise<IMarkingDetailResponse> => {
    const response = await customAxios.put<IMarkingDetailResponse>(`/homeworks/${homeworkId}/marking`, markingData);
    return response.data;
};
export { getMarkingDetail, updateMarking };
