import { useTranslation } from "react-i18next";
import { Modal, Button } from "@mantine/core";
import { IAccountSummary } from "../type";
import { updateUserList } from "@/feature/account/api";
import { toast } from "react-toastify/unstyled";
import { useContext } from "react";
import { AccountSummaryPluginContext } from "@/feature/account/plugins/context/AccountTablePluginContext";

interface ActivateUserDialogProps {
    open?: boolean;
    handleClose?: () => void;
    title: string;
    isDeactivate: boolean;
}

const ActivateUserDialog = ({ open = false, handleClose, title, isDeactivate }: ActivateUserDialogProps) => {
    const context = useContext(AccountSummaryPluginContext);
    const fetchData = context?.fetchData;
    const searchQuery = context?.searchQuery || {
        schools: "",
        grades: "",
        classGroups: "",
        status: "",
        page: 0,
        size: 25,
        keyword: "",
    };
    const selectedStudents = context?.selectedItems || [];

    const { t } = useTranslation();

    const handleSubmit = async (selectedStudents: IAccountSummary[]) => {
        const updatedSelectedStudents = selectedStudents.map((student) => ({
            id: student.id,
            username: student.username,
            school: student.school?.schoolId,
            classGroups: student.classGroups.map((group) => group.classGroupId),
            status: isDeactivate ? "INACTIVE" : "ACTIVATED",
            grade: student.grade,
            contact: student.contact,
        }));
        try {
            await updateUserList(updatedSelectedStudents);
            toast.success(t(`Selected students ${isDeactivate ? "deactivated" : "activated"} successfully`));
            if (fetchData) await fetchData(searchQuery);
        } catch (error) {
            console.error(`Error ${isDeactivate ? "deactivating" : "activating"} students:`, error);
            toast.error(t(`Failed to ${isDeactivate ? "deactivate" : "activate"} selected students`));
        } finally {
            handleClose && handleClose();
        }
    };

    return (
        <Modal
            opened={open}
            onClose={handleClose || (() => {})}
            title={title}
            size="sm"
            classNames={{ title: "text-xl! font-semibold!" }}
        >
            <div className="min-w-[320px]">
                <div>
                    <span className="text-gray-600 mb-4">{t("Selected students:")}</span>

                    {selectedStudents.length > 0 ? (
                        <span className="text-gray-800">
                            {selectedStudents.map((row: IAccountSummary) => row.username).join(", ")}
                        </span>
                    ) : (
                        <span className="text-gray-800">{t("No students selected")}</span>
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button variant="default" onClick={handleClose} size="sm" radius="sm">
                        {t("Cancel")}
                    </Button>
                    <Button color="aceBlue" onClick={() => handleSubmit(selectedStudents)} size="sm" radius="sm">
                        {t("Confirm")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ActivateUserDialog;
