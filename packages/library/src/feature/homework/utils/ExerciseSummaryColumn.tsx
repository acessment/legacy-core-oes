import { TFunction } from "i18next";

interface Props {
    t: TFunction<"translation", undefined>;
    assignDateColumn?: any;
    uploadPDFLibraryColumn?: any;
}
const ExerciseSummaryColumn = (props: Props) => {
    const { t, assignDateColumn, uploadPDFLibraryColumn } = props;

    const columns = [
        { title: t("Title"), accessor: "title", width: "45%" },
        { title: t("Category"), accessor: "category", width: "20%" },
        { title: t("Grade"), accessor: "grade", width: "15%" },
        {
            title: t("Created at"),
            accessor: "createdAt",
            width: "20%",
            render: (row: any) => {
                const d = new Date(row.createdAt);

                // Check if current timezone is Hong Kong, if not adjust to Hong Kong time
                const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const adjustedDate =
                    currentTimezone === "Asia/Hong_Kong"
                        ? d
                        : new Date(d.toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" }));

                const pad = (n: number) => n.toString().padStart(2, "0");
                return `${adjustedDate.getFullYear()}-${pad(adjustedDate.getMonth() + 1)}-${pad(
                    adjustedDate.getDate()
                )} ${pad(adjustedDate.getHours())}:${pad(adjustedDate.getMinutes())}`;
            },
        },
    ];

    // Add assignDateColumn if provided
    if (assignDateColumn) {
        columns.push(assignDateColumn);
    }

    // Add uploadPDFLibraryColumn if provided
    if (uploadPDFLibraryColumn) {
        columns.push(uploadPDFLibraryColumn);
    }

    return columns;
};
export default ExerciseSummaryColumn;
