import { Modal, Button, Group, Text, rem, ActionIcon, Stack } from "@mantine/core";
import { Dropzone, FileWithPath, FileRejection } from "@mantine/dropzone";
import { IconPhoto, IconX, IconUpload, IconFile } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "react-toastify/unstyled";

// Dynamic import to avoid SSR issues with pdfjs
let pdfjs: typeof import("react-pdf").pdfjs | null = null;

// Initialize PDF.js only on client-side
if (typeof window !== "undefined") {
    import("react-pdf").then((module) => {
        pdfjs = module.pdfjs;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/build/pdf.worker.min.mjs",
            import.meta.url
        ).toString();
    });
}

interface UploadHwImgDialogProps {
    open: boolean;
    handleClose: () => void;
    onSubmit?: (files: FileWithPath[]) => void;
}

export const UploadImageMarkingDialog = ({ open, handleClose, onSubmit }: UploadHwImgDialogProps) => {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [uploading, setUploading] = useState(false);
    const [converting, setConverting] = useState(false);

    const MAX_FILES = 10;

    const convertPdfToImages = async (pdfFile: File): Promise<FileWithPath[]> => {
        // Ensure pdfjs is loaded (client-side only)
        if (!pdfjs) {
            const module = await import("react-pdf");
            pdfjs = module.pdfjs;
            pdfjs.GlobalWorkerOptions.workerSrc = new URL(
                "pdfjs-dist/build/pdf.worker.min.mjs",
                import.meta.url
            ).toString();
        }

        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const images: FileWithPath[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1.2 }); // Higher scale for better quality

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise;

            // Convert canvas to blob
            let blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob(
                    (blob) => {
                        resolve(blob!);
                    },
                    "image/jpeg",
                    0.75
                );
            });

            // Check if file size exceeds 10MB, if yes retry with lower quality
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
            if (blob.size > MAX_FILE_SIZE) {
                console.log(
                    `Image size ${(blob.size / 1024 / 1024).toFixed(2)}MB exceeds 10MB, retrying with lower quality...`
                );
                blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob(
                        (blob) => {
                            resolve(blob!);
                        },
                        "image/jpeg",
                        0.3
                    );
                });
                console.log(`Reduced image size to ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
            }

            // Create FileWithPath object
            const fileName = `${pdfFile.name.replace(".pdf", "")}_page_${pageNumber}.jpg`;
            const imageFile = new File([blob], fileName, { type: "image/jpeg" }) as FileWithPath;
            Object.defineProperty(imageFile, "path", {
                value: fileName,
                writable: false,
                enumerable: true,
                configurable: true,
            });

            images.push(imageFile);
        }

        return images;
    };

    const handleDrop = async (acceptedFiles: FileWithPath[]) => {
        setConverting(true);
        try {
            const processedFiles: FileWithPath[] = [];

            for (const file of acceptedFiles) {
                if (file.type === "application/pdf") {
                    toast.info(`Converting PDF "${file.name}" to images...`);
                    const pdfImages = await convertPdfToImages(file);
                    processedFiles.push(...pdfImages);
                    toast.success(`Converted PDF "${file.name}" to ${pdfImages.length} image(s)`);
                } else {
                    processedFiles.push(file);
                }
            }

            const totalFiles = files.length + processedFiles.length;

            if (totalFiles > MAX_FILES) {
                const allowedFiles = processedFiles.slice(0, MAX_FILES - files.length);
                const rejectedCount = processedFiles.length - allowedFiles.length;

                setFiles((prev) => [...prev, ...allowedFiles]);

                if (rejectedCount > 0) {
                    toast.warning(
                        `Maximum ${MAX_FILES} files allowed. Added ${allowedFiles.length} file(s), rejected ${rejectedCount} file(s).`
                    );
                }
            } else {
                setFiles((prev) => [...prev, ...processedFiles]);
            }
        } catch (error) {
            console.error("Error processing files:", error);
            toast.error("Error processing PDF files. Please try again.");
        } finally {
            setConverting(false);
        }
    };

    const handleReject = (fileRejections: FileRejection[]) => {
        const errorMessages = fileRejections.flatMap((rejection) => rejection.errors.map((error) => error.message));
        toast.error(`Some files were rejected: ${errorMessages.join(", ")}`);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error("Please select at least one file to upload");
            return;
        }

        setUploading(true);
        try {
            // Call the onSubmit prop with the files
            if (onSubmit) {
                await onSubmit(files);
            }
            setFiles([]);
            handleClose();
        } catch (error) {
            toast.error("Failed to upload files. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <Modal
            title="Upload Homework Images & PDFs"
            opened={open}
            onClose={handleClose}
            classNames={{ title: "text-xl! font-semibold!" }}
            size="xl"
        >
            <Stack gap="md">
                <Dropzone
                    onDrop={handleDrop}
                    onReject={handleReject}
                    maxSize={10 * 1024 ** 2} // 10MB
                    accept={{
                        "image/*": [],
                        "application/pdf": [".pdf"],
                    }}
                    multiple
                    disabled={uploading || converting || files.length >= MAX_FILES}
                    classNames={{
                        root: `border-2 border-dashed transition-colors ${
                            files.length >= MAX_FILES
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 hover:border-blue-400"
                        }`,
                        inner: "p-8",
                    }}
                >
                    <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: "none" }}>
                        <Dropzone.Accept>
                            <IconUpload
                                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }}
                                stroke={1.5}
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX
                                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }}
                                stroke={1.5}
                            />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <div className="relative">
                                <IconPhoto
                                    style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }}
                                    stroke={1.5}
                                />
                                {files.length > 0 && (
                                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                        {files.length}
                                    </div>
                                )}
                            </div>
                        </Dropzone.Idle>

                        <div>
                            <Text size="xl" inline>
                                {converting
                                    ? "Converting PDF files..."
                                    : files.length >= MAX_FILES
                                    ? `Maximum ${MAX_FILES} files reached`
                                    : "Drag images or PDFs here or click to select files"}
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                {converting
                                    ? "Please wait while PDFs are converted to images"
                                    : files.length >= MAX_FILES
                                    ? `You have selected the maximum of ${MAX_FILES} files`
                                    : `Attach homework images or PDFs (${files.length}/${MAX_FILES}), each file should not exceed 10MB. PDFs will be automatically converted to images.`}
                            </Text>
                        </div>
                    </Group>
                </Dropzone>

                {files.length > 0 && (
                    <div>
                        <Text size="sm" fw={500} mb="sm">
                            Selected Files ({files.length}/{MAX_FILES}):
                            {files.length >= MAX_FILES && (
                                <Text size="xs" c="red" span ml="xs">
                                    Maximum limit reached
                                </Text>
                            )}
                        </Text>
                        <div className="flex flex-col gap-3 overflow-y-auto max-h-60">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                                            {file.name.toLowerCase().includes("_page_") &&
                                            file.name.toLowerCase().endsWith(".jpg") ? (
                                                <IconFile size={24} color="#3b82f6" />
                                            ) : (
                                                <IconPhoto size={24} color="#3b82f6" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <Text size="sm" fw={500} truncate>
                                            {file.name}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {formatFileSize(file.size)}
                                        </Text>
                                    </div>

                                    <ActionIcon
                                        color="red"
                                        variant="light"
                                        size="sm"
                                        onClick={() => removeFile(index)}
                                        disabled={uploading}
                                    >
                                        <IconX size={16} />
                                    </ActionIcon>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Group justify="flex-end" mt="md">
                    <Button variant="light" onClick={handleClose} disabled={uploading || converting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        loading={uploading || converting}
                        disabled={files.length === 0}
                        leftSection={<IconUpload size={16} />}
                        color="aceBlue"
                    >
                        {converting
                            ? "Converting PDFs..."
                            : uploading
                            ? "Uploading..."
                            : `Upload ${files.length || ""} File${files.length === 1 ? "" : "s"}`}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};
