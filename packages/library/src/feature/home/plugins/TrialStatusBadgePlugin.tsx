import { AntiPaywallGate } from "@/feature/payment";
import { Badge } from "@mantine/core";

export const TrialStatusBadgePlugin = () => {
    return (
        <AntiPaywallGate
            productIndex={[0]}
            subscribedComponent={
                <Badge size="lg" variant="gradient" gradient={{ from: "indigo", to: "grape", deg: 90 }}>
                    Premium
                </Badge>
            }
        >
            <Badge variant="light" color="red" size="lg" radius={12}>
                FREE
            </Badge>
        </AntiPaywallGate>
    );
    return null;
};
