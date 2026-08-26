import { createContext } from "react";

export type MaintenanceContextType = {
    isMaintenanceMode: boolean;
    message: string;
};

export const MaintenanceContext = createContext<MaintenanceContextType>({ isMaintenanceMode: false, message: "" });