import { TFunction } from "i18next";

interface Props {
    t: TFunction<"translation", undefined>;
}
const HomeworkSummaryColumn = (props: Props) => {
    const { t } = props;

    return [
        { title: t("Title"), accessor: "title", width: "35%" },
        { title: t("Category"), accessor: "category", width: "10%" },
        { title: t("Grade"), accessor: "grade", width: "5%" },
        { title: t("Student"), accessor: "username", width: "10%" },
        {
            title: t("School"),
            accessor: "school",
            width: "10%",
            render: (row: any) => {
                return <div>{row.school?.name || ""}</div>;
            },
        },
        {
            title: t("Class/group"),
            accessor: "classes",
            width: "10%",
            render: (row: any) => {
                return <div>{row.classGroups?.map((group: { name: any }) => group.name).join(", ") ?? ""}</div>;
            },
        },

        {
            title: t("Date Range"),
            width: "15%",
            accessor: "startDate",
            render: (row: any) => {
                const formatDate = (dateStr: string) => {
                    const d = new Date(dateStr);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                };
                return <div>{formatDate(row.startDate) + " - " + formatDate(row.expiryDate)}</div>;
            },
        },
        { title: t("Submission Status"), accessor: "submissionStatus", width: "5%" },
        {
            title: t("Score"),
            accessor: "percentageScore",
            width: "5%",
            render: (row: any) => {
                // round to int
                return <div>{Math.round(row.percentageScore)}%</div>;
            },
        },
        { title: t("Marking Status"), accessor: "markingStatus", width: "5%" },
    ];
};
export default HomeworkSummaryColumn;
