import customAxios from "@/api/customAxios";
import { IAuditTrail } from "../types";

const fetchAuditTrail = async (params: any): Promise<IPagination<IAuditTrail>> => {
    const response = await customAxios.get<IPagination<IAuditTrail>>("/audit-trails", {
        params,
    });
    return response.data;
    // Implementation for fetching audit trail data from the server
};
export { fetchAuditTrail };
