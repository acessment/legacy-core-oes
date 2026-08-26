import { TFunction } from "i18next";

interface Props {
    t: TFunction<"translation", undefined>;
}

/**
 * Plugin to add Upload PDF Library column to Exercise table
 *
 * Returns a DataTable column definition for displaying whether exercises are enabled for PDF Library
 */
export const getUploadPDFLibraryColumn = (props: Props): any => {
    const { t } = props;

    return {
        title: t("PDF Library"),
        accessor: "uploadPDFLibrary",
        width: "15%",
        render: (row: any) => (row.uploadPDFLibrary ? t("True") : t("False")),
    };
};

export default getUploadPDFLibraryColumn;
