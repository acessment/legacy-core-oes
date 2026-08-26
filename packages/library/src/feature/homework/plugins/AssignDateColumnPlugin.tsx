import { TFunction } from "i18next";

interface Props {
    t: TFunction<"translation", undefined>;
}

/**
 * Plugin to add Assignment Date column to Exercise table
 *
 * Returns a DataTable column definition for displaying exercise assignment dates
 */
export const getAssignDateColumn = (props: Props): any => {
    const { t } = props;

    return {
        title: t("Assignment Date"),
        accessor: "assignDate",
        width: "15%",
        render: (row: any) => {
            if (!row.assignDate) {
                return <span className="text-gray-400">-</span>;
            }

            const d = new Date(row.assignDate);

            // Check if current timezone is Hong Kong, if not adjust to Hong Kong time
            const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const adjustedDate =
                currentTimezone === "Asia/Hong_Kong"
                    ? d
                    : new Date(d.toLocaleString("en-US", { timeZone: "Asia/Hong_Kong" }));

            const pad = (n: number) => n.toString().padStart(2, "0");
            return `${adjustedDate.getFullYear()}-${pad(adjustedDate.getMonth() + 1)}-${pad(adjustedDate.getDate())}`;
        },
    };
};

export default getAssignDateColumn;
