import { DatePickerInput } from "@mantine/dates";
import { useTranslation } from "react-i18next";
import { useAutoAssign } from "./context/AutoAssignPluginContext";

interface AutoAssignPluginProps {
    showInDialog?: boolean;
}

/**
 * AutoAssign Plugin Component
 *
 * Uses AutoAssignContext for shared state management.
 * Can be used in multiple places (page and dialog) with synchronized state.
 *
 * Auto-assignment is enabled when assignDate is set (not null).
 *
 * Usage with context:
 * ```tsx
 * <AutoAssignProvider initialAssignDate={null}>
 *   <AutoAssignPlugin /> // Shows on page
 *   <ExerciseInfoDialog autoAssignPlugin={<AutoAssignPlugin showInDialog />} />
 * </AutoAssignProvider>
 * ```
 */
export const AutoAssignPlugin: React.FC<AutoAssignPluginProps> = ({ showInDialog = false }) => {
    const { t } = useTranslation();
    const { assignDate, setAssignDate } = useAutoAssign();

    return (
        <div className={showInDialog ? "mt-4 p-4 border border-gray-200 rounded-md bg-gray-50" : "mt-4"}>
            <DatePickerInput
                label={t("Auto Assignment Date")}
                placeholder={t("Select assignment date or leave empty to disable")}
                value={assignDate}
                onChange={(value) => {
                    // Handle both Date and string types from DatePickerInput
                    if (!value) {
                        setAssignDate(null);
                    } else if (typeof value === "string") {
                        setAssignDate(new Date(value));
                    } else {
                        setAssignDate(value);
                    }
                }}
                size="sm"
                radius="sm"
                //next day
                defaultDate={assignDate || new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
                description={t(
                    "Exercise will be automatically assigned to subscribed users on the selected date at 00:00 HKT. Users must have active 3-in-1 subscription and matching grade level."
                )}
                //next day
                minDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
                clearable
            />
        </div>
    );
};

export default AutoAssignPlugin;
