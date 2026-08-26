import { UploadImageMarkingDialog } from "@/feature/homework/component/UploadImageMarkingDialog";
import { Button } from "@mantine/core";
import { IconLibraryPhoto } from "@tabler/icons-react";
import { Context, useContext, useState } from "react";
import { sanitizeMarkingResults, verifyMarkingResults } from "@/feature/marking/utils/verifyMarkingResults";
import { jsonDecrypt } from "@/utils/jsonEncryptionUtils";
import { toast } from "react-toastify/unstyled";
import { markingV2 } from "@/feature/homework/api";
import { IExerciseContentJsonData } from "@acessment/generator-panel";
import { FileWithPath } from "@mantine/dropzone";
import { OCRPluginContextValue } from "./types/PluginContextTypes";

export interface OCRPluginProps<T extends OCRPluginContextValue> {
    pluginContext: Context<T | undefined>;
    buttonText?: string;
    buttonProps?: {
        variant?: string;
        color?: string;
        size?: string;
    };
}

export const OCRPlugin = <T extends OCRPluginContextValue>({ 
    pluginContext, 
    buttonText = "Upload Image",
    buttonProps = {
        variant: "filled",
        color: "aceBlue",
        size: "md"
    }
}: OCRPluginProps<T>) => {
    const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false);
    const context = useContext(pluginContext);
    
    if (!context) {
        console.error("OCRPlugin: Context not found. Make sure the component is wrapped with the appropriate context provider.");
        return null;
    }

    const { jsonContent, jsonDispatch } = context;

    const makeMarkingJsonWithImages = async (files: FileWithPath[], json: IExerciseContentJsonData) => {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append("files", file, file.name);
            });
            formData.append("exercise_json", JSON.stringify([json]));
            formData.append("skip_double_encode", "true");
            const response = await markingV2(formData);

            const res = await response;
            const decryptedRes = jsonDecrypt(res); // the whole res is decrypted in double base64
            if (verifyMarkingResults(decryptedRes.payload[0], jsonContent)) {
                toast.info("Please check if the results are correct before submitting your homework.");
                const sanitizedResults = sanitizeMarkingResults(decryptedRes.payload[0], jsonContent);
                jsonDispatch({ type: "SET_EXERCISE_CONTENT", payload: sanitizedResults });
            } else {
                toast.error(
                    "Failed to verify marking results. Please check if you are uploading the correct images/pdfs for this exercise."
                );
            }
        } catch (error) {
            console.error("Error in makeMarkingJsonWithImages:", error);
            throw error;
        }
    };

    return (
        <>
            <Button
                variant={buttonProps.variant}
                color={buttonProps.color}
                size={buttonProps.size}
                leftSection={<IconLibraryPhoto size={16} />}
                onClick={() => setUploadImageDialogOpen(true)}
            >
                {buttonText}
            </Button>
            <UploadImageMarkingDialog
                open={uploadImageDialogOpen}
                handleClose={() => setUploadImageDialogOpen(false)}
                onSubmit={(files) => makeMarkingJsonWithImages(files, jsonContent)}
            />
        </>
    );
};