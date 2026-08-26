import customAxios from "../../../api/customAxios";
// Update company setting (multipart/form-data)
const updateCompanySetting = async (formData: FormData) => {
    const response = await customAxios.put(`/company-settings/current`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

const getCompanySettings = async () => {
    const response = await customAxios.get(`/company-settings/current`);
    return response.data;
};

const resetCurrentUserPassword = async (newPassword: string) => {
    const response = await customAxios.put(`/users/current/password`, {
        newPassword,
    });
    return response.data;
};

const updateCurrentUser = async (data: { contact?: string; grade?: string }) => {
    const response = await customAxios.put(`/users/current`, data);
    return response.data;
};
export { updateCompanySetting, getCompanySettings, resetCurrentUserPassword, updateCurrentUser };
