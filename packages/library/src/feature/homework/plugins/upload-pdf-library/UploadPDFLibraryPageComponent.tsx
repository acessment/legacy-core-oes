import { Badge } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { UploadPDFLibraryContext } from "../context/UploadPDFLibraryPluginContext";
import { useContext } from "react";

export const UploadPDFLibraryPageComponent = () => {
    const { t } = useTranslation();
    const context = useContext(UploadPDFLibraryContext);
    
    if (!context) {
        throw new Error("UploadPDFLibraryPageComponent must be used within UploadPDFLibraryProvider");
    }
    
    const { uploadPDFLibrary } = context;

    if (!uploadPDFLibrary) {
        return null;
    }

    return (
        <Badge color="violet" variant="light" size="md">
            {t("In PDF Library")}
        </Badge>
    );
};
