import { TFunction } from "i18next";

// Import icons from centralized index
import {
    EventUpcomingIcon,
    DeleteIcon
} from "../../../assets/image/google_mui_icons";


interface ExercisePageMenuItemProps {
    t: TFunction<"translation", undefined>;
    onAssignSelected: (selectedExercises: []) => void;
    onDeleteSelected: (selectedExercises: []) => void;
}
const ExercisePageMenuItem = (props: ExercisePageMenuItemProps) => {
    const {
        t,
        onAssignSelected,
        onDeleteSelected,
    } = props;

    return [
        {
            label: t("Assign Selected Exercises"),
            onClick: onAssignSelected,
            icon: EventUpcomingIcon,
        },
        {
            label: t("Delete Selected"),
            onClick: onDeleteSelected,
            icon: DeleteIcon,
        }
    ];
};
export default ExercisePageMenuItem;
