import axios from "axios";
import customAxios from "./customAxios";

export async function getCurrentUser() {
    const response = await customAxios.get("/users/current");
    return response;
}

export async function logout() {
    const response = await axios.post(`${import.meta.env.VITE_APIDOMAIN}/auth/logout`, {
        withCredentials: true,
    });
    return response;
}
