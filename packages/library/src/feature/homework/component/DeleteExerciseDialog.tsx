import { ConfirmDialog } from "@/component/dialog/confirm_dialog";
import { useDeleteExerciseList } from "@/feature/homework/api";
import { ExercisePluginContext } from "@/feature/homework/plugins/context/ExerciseTablePluginContext";
import { IExerciseSummary } from "@/feature/homework/type";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify/unstyled";

interface DeleteExerciseDialogProps {
    open?: boolean;
    handleClose?: () => void;
}

export const DeleteExerciseDialog = ({ open = false, handleClose = () => {} }: DeleteExerciseDialogProps) => {
    const context = useContext(ExercisePluginContext);
    const fetchData = context?.fetchData;
    const searchQuery = context?.searchQuery || {
        categories: "",
        grades: "",
        createdStartedAt: "",
        createdEndedAt: "",
        keyword: "",
        page: 0,
        size: 25,
    };
    const selectedExercises = (context?.selectedItems || []) as IExerciseSummary[];
    const { deleteExerciseList } = useDeleteExerciseList();

    const { t } = useTranslation();
    
    const handleDelete = async () => {
        try {
            if (selectedExercises.length === 0) {
                toast.warning(t("Please select exercises to delete"));
                return;
            }
            
            const exerciseIds = selectedExercises.map((exercise: IExerciseSummary) => exercise.id);
            await deleteExerciseList({ exerciseIds });            
            if (fetchData) {
                await fetchData(searchQuery);
            }
        } catch (error) {
            console.error("Error deleting exercises:", error);
            throw error;
        } finally {
            handleClose();
        }
    };

    return (
        <ConfirmDialog
            title="Delete Exercises (This action cannot be undone)"
            open={open}
            handleClose={handleClose}
            onSubmit={handleDelete}
            data={selectedExercises}
        />
    );
};