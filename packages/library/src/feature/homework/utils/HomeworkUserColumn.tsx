import { TFunction } from "i18next";

interface Props {
    t: TFunction<"translation", undefined>;
}
const HomeworkUserColumn = (props: Props) => {
    const { t } = props;

    return [
        { title: t("Title"), accessor: "title", width: "25%" },
        { title: t("Category"), accessor: "category", width: "15%" },

        {
            title: t("Deadline"),
            width: "20%",
            accessor: "expiryDate",
            render: ({ expiryDate }) => {
                if (!expiryDate) {
                    return "-";
                }
                const date = new Date(expiryDate);
                return date.toDateString();
            },
        },
        { title: t("Submission Status"), accessor: "submissionStatus", width: "15%" },
        { title: t("Submission Date"), accessor: "submissionDate", width: "20%" },
        {
            title: t("Score"),
            accessor: "percentageScore",
            width: "10%",
            render: (row: any) => {
                // Only show score if marking status is "marked"
                if (row.markingStatus?.toLowerCase() === "marked") {
                    return `${Math.round(row.percentageScore)}%`;
                }
                return "-";
            },
        },
        { title: t("Marking Status"), accessor: "markingStatus", width: "15%" },
    ];
};
export default HomeworkUserColumn;
