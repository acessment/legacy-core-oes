import { useTranslation } from "react-i18next";
import { Modal } from "@mantine/core";
import { useState, useCallback, useEffect } from "react";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { Button, Group, Text, rem } from "@mantine/core";
import { UploadIcon, CloseIcon, DownloadIcon } from "../../../assets/image/google_mui_icons";
import { downloadUserTemplate } from "../api";
import { toast } from "react-toastify/unstyled";
import "@mantine/dropzone/styles.css";

interface ImportStudentDialogProps {
    open: boolean;
    handleClose: () => void;
    onImport?: (files: FileWithPath[]) => void;
    fetchData: () => void;
}

const ImportStudentDialog = ({ open, handleClose, onImport, fetchData }: ImportStudentDialogProps) => {
    const { t } = useTranslation();
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [loadingExcel, setLoadingExcel] = useState(false);

    const handleDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        setFiles(acceptedFiles);
    }, []);

    const handleImport = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        try {
            if (onImport) {
                await onImport(files);
            }
            // Reset state after successful import
            setFiles([]);
            handleClose();
        } catch (error) {
            console.error("Error importing files:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        setFiles([]);
        handleClose();
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };
    const onDownloadTemplate = async () => {
        try {
            setLoadingExcel(true); // Set loading state for Excel download
            const response = await downloadUserTemplate();
            // Create a link and trigger download
            const url = window.URL.createObjectURL(response);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "user_template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading user template:", error);
            toast.error(t("Failed to download user template"));
        } finally {
            setLoadingExcel(false); // Reset loading state
            fetchData();
        }
    };

    return (
        <Modal
            opened={open}
            onClose={handleCancel}
            title={t("Import Students")}
            size="lg"
            padding={"lg"}
            classNames={{ title: "text-2xl! font-semibold!" }}
        >
            <div className="overflow-y-auto">
                <div className="mb-6">
                    <p className="text-xl font-medium">{t("Upload an Excel file containing student data")}</p>
                    <Button onClick={onDownloadTemplate} disabled={loadingExcel} size="sm" radius="sm" color="aceBlue">
                        {t("Template")}
                    </Button>
                </div>

                <div className="mb-6">
                    <Dropzone
                        onDrop={handleDrop}
                        onReject={(files) => console.log("rejected files", files)}
                        accept={[
                            "application/vnd.ms-excel",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        ]}
                        multiple={false}
                    >
                        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
                            <Dropzone.Accept>
                                <UploadIcon
                                    style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <CloseIcon
                                    style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <DownloadIcon
                                    style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }}
                                />
                            </Dropzone.Idle>

                            <div>
                                <Text size="xl" inline className="text-center">
                                    {t("Drag and drop your file here, or click to select")}
                                </Text>
                                <Text size="sm" c="dimmed" inline mt={7} className="text-center block">
                                    {t(
                                        "Supported formats: XLS, XLSX (max 5MB), each user should have its own username and password"
                                    )}
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                </div>

                {files.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3 text-ace-text-primary-gray">{t("Selected Files")}</h3>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                            <DownloadIcon width={16} height={16} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        disabled={isUploading}
                                    >
                                        <CloseIcon width={16} height={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <Button variant="default" onClick={handleCancel} size="sm" radius="sm" disabled={isUploading}>
                        {t("Cancel")}
                    </Button>
                    <Button
                        color="aceBlue"
                        onClick={handleImport}
                        size="sm"
                        radius="sm"
                        disabled={files.length === 0 || isUploading}
                    >
                        {isUploading ? t("Importing...") : t("Import")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportStudentDialog;
