import { IconX, IconPlaylistAdd } from "@tabler/icons-react";
import { TableMenuItem } from "@/feature/account/type/TableMenuItem";
import { UnassignHomeworkDialog } from "../component/UnassignHomeworkDialog";
import { addAllHomeworkToMarkingQueue } from "@/utils/markingQueueUtils";
import { HomeworkSummaryView } from "@/feature/homework/type";

export const HOMEWORK_TABLE_MENU_ITEMS_ADD_ALL: TableMenuItem[] = [
    {
        label: "Unassign Homework",
        icon: IconX,
        onClick: () => {}, // Handled by plugin - opens dialog
        dialog: <UnassignHomeworkDialog />,
    },
    {
        label: "Add to Marking Queue", 
        icon: IconPlaylistAdd,
        onClick: ({ selectedItems }) => {
            // Direct action - no dialog needed
            addAllHomeworkToMarkingQueue(selectedItems as HomeworkSummaryView[]);
        },
        // No dialog property - direct action only
    }
];
