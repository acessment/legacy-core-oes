import { TFunction } from "i18next";

// Import icons from centralized index
import {
    CancelIcon,
    PlaylistAddIcon
} from "../../../assets/image/google_mui_icons";
import { HomeworkSummaryView } from "../type";

interface HomeworkPageMenuItemProps {
    t: TFunction<"translation", undefined>;
    onUnAssignSelected: (selectedHomework: HomeworkSummaryView[]) => void;
    onAddMarkingQueue: (selectedHomework: HomeworkSummaryView[]) => void;
}
const HomeworkPageMenuItem = (props: HomeworkPageMenuItemProps) => {
    const {
        t,
        onUnAssignSelected,
        onAddMarkingQueue,
    } = props;

    return [
        {
            label: t("Unassign Selected Homework"),
            onClick: onUnAssignSelected,
            icon: CancelIcon,
        },
        {
            label: t("Add to Marking Queue"),
            onClick: onAddMarkingQueue,
            icon: PlaylistAddIcon,
        }
    ];
};
export default HomeworkPageMenuItem;
