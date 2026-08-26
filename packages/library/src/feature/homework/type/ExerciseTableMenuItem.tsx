import { IconUserPlus, IconTrash } from "@tabler/icons-react";
import { TableMenuItem } from "@/feature/account/type/TableMenuItem";
import { DeleteExerciseDialog } from "../component/DeleteExerciseDialog";

export const EXERCISE_TABLE_MENU_ITEMS: TableMenuItem[] = [
    {
        label: "Assign Selected",
        icon: IconUserPlus,
        onClick: ({ dialogDispatch }) => {
            dialogDispatch?.({
                type: "OPEN_DIALOG",
                dialogType: "assignHomeworkDialog",
            });
        },
    },
    {
        label: "Delete Selected",
        icon: IconTrash,
        onClick: () => {}, // Empty - handled by TableDropDownPlugin
        dialog: <DeleteExerciseDialog />,
    },
];
