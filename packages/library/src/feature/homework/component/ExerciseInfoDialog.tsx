import React, { useState } from "react";
import { Modal, Group, Checkbox, Button, TextInput, MultiSelect, Select } from "@mantine/core";
import { TFunction } from "i18next";
import { ExerciseInfoDto } from "../type";
import { grade_options } from "../../../utils/options/grade_options";
import { toast } from "react-toastify/unstyled";
import { UploadPDFLibraryDialogComponent } from "../plugins/upload-pdf-library";

interface ExerciseInfoDialogProps {
    opened: boolean;
    onClose: () => void;
    data: ExerciseInfoDto;
    t: TFunction<"translation", undefined>;
    onSubmit: (data: ExerciseInfoDto) => void;
    isCreating?: boolean;
    autoAssignPlugin?: React.ReactNode;
    enableUploadPDFLibraryPlugin?: boolean;
}

const ExerciseInfoDialog: React.FC<ExerciseInfoDialogProps> = ({
    opened,
    onClose,
    t,
    data,
    onSubmit,
    isCreating = false,
    autoAssignPlugin,
    enableUploadPDFLibraryPlugin,
}) => {
    const [modalData, setModalData] = useState<ExerciseInfoDto>(data);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        if (!modalData.title || !modalData.category) {
            toast.error(t("Title and Category are required"));
            return;
        }
        if (modalData.grades.length === 0 && modalData.welcomeExercise) {
            toast.error(t("Please select at least one grade for the welcome exercise"));
            return;
        }
        setLoading(true);
        try {
            // Simulate API call
            await onSubmit(modalData);
        } catch (error) {
            console.error("Error submitting exercise info:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose} // Disable close if not closable
            size="lg"
            radius="lg"
            closeOnClickOutside={true} // Disable click outside to close
            closeOnEscape={true} // Disable escape key to close
            withCloseButton={true} // Hide close button if not closable
        >
            <div className="p-4">
                <p className="text-lg font-semibold mb-4 text-center">
                    {t(`${!isCreating ? "Edit" : "Submit"} Exercise Information`)}
                </p>

                <TextInput
                    label={t("Title")}
                    value={modalData.title}
                    onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                    placeholder="Enter exercise title"
                    required
                    disabled
                    size="sm"
                    radius="sm"
                />

                <Select
                    label={t("Category")}
                    value={modalData.category}
                    placeholder="Enter exercise category"
                    data={["grammar", "listening", "combined", "reading", "writing"]}
                    onChange={(value) => setModalData({ ...modalData, category: value || "" })}
                    required
                    mt="md"
                    size="sm"
                    radius="sm"
                />
                <div className="mt-4">
                    <MultiSelect
                        label="Grade"
                        placeholder="Select Grades: P1, P2..."
                        value={modalData.grades || []}
                        onChange={(value) => setModalData({ ...modalData, grades: value })}
                        data={grade_options}
                        searchable
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                    />
                </div>

                <Checkbox
                    label={t("Welcome Exercise")}
                    checked={modalData.welcomeExercise}
                    onChange={(event) => setModalData({ ...modalData, welcomeExercise: event.currentTarget.checked })}
                    mt="xl"
                />

                {autoAssignPlugin}

                {enableUploadPDFLibraryPlugin && <UploadPDFLibraryDialogComponent />}

                <Group justify="flex-end" mt="lg">
                    <Button
                        size="sm"
                        radius="sm"
                        variant="filled"
                        color="aceBlue"
                        onClick={handleSubmit}
                        loading={loading}
                    >
                        {!isCreating ? t("Save Draft") : t("Submit")}
                    </Button>
                </Group>
            </div>
        </Modal>
    );
};

export default ExerciseInfoDialog;
