import { TFunction } from "i18next";

interface Props {
    t: TFunction<"translation", undefined>;
}
const StudentHomeworkColumn = (props: Props) => {
    const { t } = props;

    return [
        { title: t("Title"), accessor: "title", width: "25%" },
        { title: t("Category"), accessor: "category", width: "10%" },
        { title: t("Grade"), accessor: "grade", width: "10%" },
        { title: t("Class/Group"), accessor: "classGroup", width: "10%" },
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
        { title: t("Submission Status"), accessor: "submissionStatus", width: "10%" },
        {
            title: t("Score"),
            accessor: "percentageScore",
            width: "10%",
            render: (row: any) => {
                const score = row.percentageScore;
                return score != null ? Number(score).toFixed(1) : "";
            },
        },
        { title: t("Marking Status"), accessor: "markingStatus", width: "10%" },
    ];
};
export default StudentHomeworkColumn;
