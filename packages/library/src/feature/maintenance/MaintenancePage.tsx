import React, { useContext } from "react";
import { Alert, Container } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { MaintenanceContext } from "@/feature/maintenance/MaintenanceContext";


export const MaintenancePage = () => {
    const { message } = useContext(MaintenanceContext);
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Container size="md" className="px-4">
                <Alert
                    variant="light"
                    color="orange"
                    title="System Maintenance"
                    icon={<IconInfoCircle />}
                    className="text-center"
                >
                    {message}
                </Alert>
            </Container>
        </div>
    );
};

export default MaintenancePage;
