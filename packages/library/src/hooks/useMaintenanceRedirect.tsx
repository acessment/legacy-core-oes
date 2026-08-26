import { MaintenanceContext } from "@/feature/maintenance/MaintenanceContext";
import { Loader } from "@mantine/core";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";

export const useMaintenanceRedirect = () => {
    const { isMaintenanceMode } = useContext(MaintenanceContext);
    const navigate = useNavigate();
    useEffect(() => {
        if (isMaintenanceMode) {
            navigate("/");
        }
    }, [isMaintenanceMode, navigate]);

    if (isMaintenanceMode) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader color="aceBlue" type="bars" />
            </div>
        );
    }
};
