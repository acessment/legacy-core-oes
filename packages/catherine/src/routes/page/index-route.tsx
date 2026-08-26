import { useContext } from "react";
import { AuthPage, MaintenancePage, MaintenanceContext } from "@acessment/core-oes";

export default function IndexRoute() {
    const { isMaintenanceMode } = useContext(MaintenanceContext);
    
    return isMaintenanceMode ? <MaintenancePage /> : <AuthPage />;
}
