// return the subscription column
export const getSubscriptionColumn = (
    t: any,
    config?: { premiumPlanId?: string; plusPlanId?: string; threeInOnePlanId?: string }
) => {
    const planMapping = [
        { productId: config?.premiumPlanId, name: "PREMIUM" },
        { productId: config?.plusPlanId, name: "PLUS" },
        { productId: config?.threeInOnePlanId, name: "3-IN-1" },
    ];

    const getSubscriptionPlanName = (productId: string) => {
        const plan = planMapping.find((p) => p.productId === productId);
        return plan?.name || productId;
    };

    return {
        title: t("Subscriptions"),
        width: "15%",
        accessor: "subscriptionStatus",
        render: (row: any) => {
            const subscriptions = row.subscriptions;

            if (!subscriptions || subscriptions.length === 0) {
                return <div>-</div>;
            }

            // Display product IDs and status for each subscription
            const subscriptionDetails = subscriptions
                .map((sub: any) => {
                    const productIds = getSubscriptionPlanName(sub.productIds[0]);
                    const status = sub.status || "";
                    return productIds && status ? `${productIds} (${status})` : productIds || status;
                })
                .filter(Boolean);

            const subscriptionStr = subscriptionDetails.length > 0 ? subscriptionDetails.join(", ") : "-";

            return <div>{subscriptionStr}</div>;
        },
    };
};
