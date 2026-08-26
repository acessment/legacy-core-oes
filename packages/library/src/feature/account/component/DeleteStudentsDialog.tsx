import { ConfirmDialog } from "@/component/dialog/confirm_dialog";
import { deleteUserList } from "@/feature/account/api";
import { AccountSummaryPluginContext } from "@/feature/account/plugins/context/AccountTablePluginContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify/unstyled";

interface DeleteStudentsDialogProps {
    open?: boolean;
    handleClose?: () => void;
}

export const DeleteStudentsDialog = ({ open = false, handleClose = () => {} }: DeleteStudentsDialogProps) => {
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
    const handleDelete = async () => {
        try {
            await deleteUserList(selectedStudents.map((s) => s.id));
            toast.success("Selected students deleted successfully");
            if (fetchData) fetchData(searchQuery);
        } catch (error) {
            console.error("Error deleting students:", error);
            toast.error(t("Failed to delete selected students"));
            throw error;
        }
        finally {
            handleClose();
        }
    };
    return (
        <ConfirmDialog
            title="Delete Students (This action cannot be undone)"
            open={open}
            handleClose={handleClose}
            onSubmit={handleDelete}
            data={selectedStudents}
        />
    );
};
