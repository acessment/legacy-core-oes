import { TFunction } from "i18next";

interface Props {
    t: TFunction<"translation", undefined>;
    subscriptionColumn?: any; // Optional subscription column from plugin
}
const AccountSummaryColumn = (props: Props) => {
    const { t, subscriptionColumn } = props;

    const baseColumns = [
        { title: t("Username"), accessor: "username", width: "20%" },
        {
            title: t("School"),
            accessor: "school.name",
            width: "20%",
            render: (row: any) => {
                return <div>{row.school?.name ?? "-"}</div>;
            },
        },
        { title: t("Grade"), accessor: "grade", width: "10%" },
        {
            title: t("Class/group"),
            accessor: "classes",
            width: "15%",
            render: (row: any) => {
                return <div>{row.classGroups?.map((group: { name: any }) => group.name).join(", ") ?? ""}</div>;
            },
        },
        { title: t("Status"), accessor: "status", width: "10%" },
        {
            title: t("Total Submission"),
            accessor: "submit_homework",
            width: "15%",
        },
        {
            title: t("Pending Homework"),
            accessor: "pending_homework",
            width: "15%",
        },
        { title: t("Average score(%)"), accessor: "percentage_score", width: "15%" },
    ];

    // Add subscription column at the end if provided
    if (subscriptionColumn) {
        return [...baseColumns, subscriptionColumn];
    }

    return baseColumns;
};
export default AccountSummaryColumn;
