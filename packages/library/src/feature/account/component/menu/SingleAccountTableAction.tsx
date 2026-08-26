import { HomeworkSummaryView } from "@/feature/homework/type";
import { addSubmittedHomeworkToMarkingQueue, addAllHomeworkToMarkingQueue } from "@/utils/markingQueueUtils";

export type actionArgs = {
    selectedItems?: unknown[];
    dialogDispatch?: React.Dispatch<{ type: string; [key: string]: unknown }>;
};

export const handleUnassignHomework = async ({ dialogDispatch }: actionArgs) => {
    if (!dialogDispatch) return;
    dialogDispatch({
        type: "OPEN_DIALOG",
        dialogType: "unassignHomeworkDialog",
    });
};

export const handleAddSubmittedToMarkingQueue = async ({ selectedItems }: actionArgs) => {
    if (!selectedItems) return;
    console.log("Selected Items for Submitted to Marking Queue:", selectedItems);
    await addSubmittedHomeworkToMarkingQueue(selectedItems as HomeworkSummaryView[]);
};

export const handleAddAllToMarkingQueue = async ({ selectedItems }: actionArgs) => {
    if (!selectedItems) return;
    console.log("Selected Items for All to Marking Queue:", selectedItems);
    await addAllHomeworkToMarkingQueue(selectedItems as HomeworkSummaryView[]);
};
