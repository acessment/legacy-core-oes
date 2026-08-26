import React from "react";
import { FileInput, Textarea, Button, TextInput, Modal } from "@mantine/core";
import { updateCompanySetting } from "../apis";
import { toast } from "react-toastify/unstyled";

interface UploadFileDialogProps {
    open: boolean;
    handleClose: () => void;
    data?: ICompanySettings;
    onUploadClick: () => void;
}

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({
    open,
    handleClose,
    data,

    onUploadClick,
}) => {
    const [file, setFile] = React.useState<File | null>(null);

    const [header, setHeader] = React.useState<string>(data?.footerText ?? "");
    const [description, setDescription] = React.useState<string>(data?.description ?? "");

    const [loading, setLoading] = React.useState<boolean>(false);

    const accept = ".png,.jpg,.jpeg,.svg";

    const onSubmit = () => async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            if (file) {
                formData.append("icon", file);
            }
            formData.append("footerText", header);
            formData.append("description", description);
            await updateCompanySetting(formData);
            toast.success("Pdf profile settings updated successfully.");
            onUploadClick();
            handleClose();
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Failed to upload file. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Modal
            opened={open}
            onClose={handleClose}
            title="Change Logo and Header Text"
            size="md"
            classNames={{ title: "text-xl! font-semibold!" }}
        >
            <div className="p-4">
                <FileInput
                    label="Upload Logo"
                    placeholder="Click here to upload a logo file"
                    value={file}
                    onChange={setFile}
                    classNames={{
                        wrapper: "w-full",
                        label: "text-ace-text-gray font-medium",
                        description: "text-sm text-gray-500",
                        input: "text-sm text-gray-500",
                    }}
                    description={"Upload a logo file (PNG, JPG, SVG)"}
                    accept={accept}
                />
                <div className="mt-4">
                    <TextInput
                        label="Header Text"
                        placeholder="Enter header text"
                        value={header}
                        onChange={(event) => setHeader(event.currentTarget.value)}
                        className="w-full mt-2"
                    />
                </div>
                <div className="mt-4">
                    <Textarea
                        label="Description"
                        value={description}
                        onChange={(event) => setDescription(event.currentTarget.value)}
                        className="w-full mt-2"
                        minRows={3}
                    />
                </div>
                <Button
                    className="mt-4"
                    variant="filled"
                    color="aceBlue"
                    disabled={loading}
                    loading={loading}
                    onClick={onSubmit()}
                >
                    Update
                </Button>
            </div>
        </Modal>
    );
};

export default UploadFileDialog;
