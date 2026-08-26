import React, { useState } from "react";
import { Modal, Select, Group, Text, Button } from "@mantine/core";
import { gradeOptions } from "../../account/type/options";
import { updateCurrentUser } from "../../setting/apis";
import { toast } from "react-toastify/unstyled";
import { TFunction } from "i18next";

interface GradePopUpProps {
    opened: boolean;
    onClose: () => void;
    t: TFunction<"translation", undefined>;
}

const GradePopUp: React.FC<GradePopUpProps> = ({ opened, onClose, t }) => {
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        try {
            setLoading(true);
            await updateCurrentUser({ grade: selectedGrade! });
            toast.success(t("Account details updated successfully"));
            onClose();
        } catch (error) {
            console.error("Error updating account details:", error);
            toast.error(t("Failed to update account details"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={() => {}} // Disable close if not closable
            size="sm"
            radius="lg"
            closeOnClickOutside={false} // Disable click outside to close
            closeOnEscape={false} // Disable escape key to close
            withCloseButton={false} // Hide close button if not closable
        >
            <div className="p-4">
                <Text size="lg" fw={600} mb="md" className="text-center">
                    Select Your Grade
                </Text>

                <Text size="sm" c="dimmed" mb="md" className="text-center">
                    Please select your grade to continue
                </Text>

                <Select
                    label="Input your grade"
                    placeholder="Choose your grade"
                    data={gradeOptions}
                    value={selectedGrade}
                    onChange={setSelectedGrade}
                    searchable
                    clearable
                    size="md"
                    classNames={{ label: "text-ace-text-primary-gray mb-1" }}
                />

                <Group justify="flex-end" mt="lg">
                    <Button
                        variant="filled"
                        color="blue"
                        onClick={handleSubmit}
                        disabled={!selectedGrade || loading}
                        loading={loading}
                    >
                        Confirm
                    </Button>
                </Group>
            </div>
        </Modal>
    );
};

export default GradePopUp;
