import { useContext } from "react";
import { toast } from "react-toastify/unstyled";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/component/dialog/confirm_dialog";
import { HomeworkPluginContext } from "@/feature/homework/plugins/context/HomeworkTablePluginContext";
import { deleteHomeworkList } from "@/feature/homework/api";
import { HomeworkSummaryView } from "@/feature/homework/type";

interface UnassignHomeworkDialogProps {
    open?: boolean;
    handleClose?: () => void;
}

export const UnassignHomeworkDialog = ({
    open = false,
    handleClose = () => {},
}: UnassignHomeworkDialogProps) => {
    const { t } = useTranslation();
    const context = useContext(HomeworkPluginContext);
    const selectedHomework = (context?.selectedItems || []) as HomeworkSummaryView[];

    const handleConfirm = async () => {
        try {
            const homeworkIds = selectedHomework.map((homework) => homework.id);
            await deleteHomeworkList(homeworkIds);
            console.log("Unassigning homework with IDs:", homeworkIds);
            
            toast.success(t("Homework unassigned successfully!"));
            
            // Refresh the data after deletion
            if (context?.fetchData && context?.searchQuery) {
                await context.fetchData(context.searchQuery);
            }
            
            handleClose();
        } catch (error) {
            console.error("Error unassigning homework:", error);
            toast.error(t("Failed to unassign homework."));
        }
    };

    const getDialogTitle = () => {
        const count = selectedHomework.length;
        if (count === 0) {
            return t("No Homework Selected");
        } else if (count === 1) {
            return t("Confirm Unassign");
        } else {
            return t("Confirm Unassign ({{count}} items)", { count });
        }
    };

    return (
        <ConfirmDialog
            open={open}
            handleClose={handleClose}
            title={getDialogTitle()}
            onSubmit={handleConfirm}
        />
    );
};

export default UnassignHomeworkDialog;