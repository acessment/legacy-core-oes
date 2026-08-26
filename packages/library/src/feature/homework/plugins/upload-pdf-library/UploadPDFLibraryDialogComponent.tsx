import { Checkbox } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { UploadPDFLibraryContext } from "../context/UploadPDFLibraryPluginContext";
import { useContext } from "react";

export const UploadPDFLibraryDialogComponent = () => {
    const { t } = useTranslation();
    const context = useContext(UploadPDFLibraryContext);
    
    if (!context) {
        throw new Error("UploadPDFLibraryDialogComponent must be used within UploadPDFLibraryProvider");
    }
    
    const { uploadPDFLibrary, setUploadPDFLibrary } = context;

    return (
        <div className="mt-4">
            <Checkbox
                label={t("Upload to Exercise Library")}
                checked={uploadPDFLibrary}
                onChange={(event) => setUploadPDFLibrary(event.currentTarget.checked)}
                description={t("Show this exercise in Exercise Library")}
            />
        </div>
    );
};
