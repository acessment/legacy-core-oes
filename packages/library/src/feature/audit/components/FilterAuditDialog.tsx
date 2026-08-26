import { useState } from "react";
import { Modal, Button, MultiSelect } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { optionsType } from "../../../utils/model";
import { tidyDateRange } from "@/utils/dateFormator";
import { AuditEntityType } from "@/enum/AuditEntityType.enum";
import { useTranslation } from "react-i18next";
import { IAuditTrailDialogFilterParams } from "../types";

interface IAssignHomeworkDialogProps {
    open: boolean;
    handleClose: () => void;
    onSubmit: (data: IAuditTrailDialogFilterParams) => void;
    studentOptions: optionsType[];
}

interface IFilterQueryParams {
    entityTypes: string[];
    students: string[];
}

const FilterAuditDialog = ({ open, handleClose, onSubmit, studentOptions }: IAssignHomeworkDialogProps) => {
    // Grouped state for selected values - updated for Mantine components
    const [selected, setSelected] = useState<{
        entityTypes: string[];
        students: string[];
    }>({
        entityTypes: [],
        students: [],
    });
    const { t } = useTranslation();

    // Date range
    const [dateValue, setDateValue] = useState<[string | null, string | null]>([null, null]);

    const handleAssignClick = async () => {
        onSubmit({
            entityTypes: selected.entityTypes,
            studentIds: selected.students,
            startDate: dateValue[0] || "",
            endDate: dateValue[1] || "",
        });
    };

    const onStudentChange = (value: string[]) => {
        setSelected((prev) => ({ ...prev, students: value }));
    };

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            size="lg"
            padding="lg"
            title="Filter Audit Trails"
            classNames={{ title: "text-xl! font-semibold!" }}
        >
            <div className="flex flex-col gap-4 bg-white">
                <div className="mt-2">
                    <MultiSelect
                        label="Entity Type"
                        placeholder="Select Entity Types"
                        value={selected.entityTypes}
                        onChange={(value) => setSelected((prev) => ({ ...prev, entityTypes: value }))}
                        data={Object.values(AuditEntityType).map((type) => ({ value: type, label: type }))}
                        searchable
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                    />
                </div>

                <div className="mt-2">
                    <MultiSelect
                        label="Student"
                        placeholder="Select Students"
                        value={selected.students}
                        onChange={onStudentChange}
                        data={studentOptions}
                        searchable
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                    />
                </div>
                <DatePickerInput
                    allowSingleDateInRange
                    label="Select Date Range"
                    type="range"
                    onChange={(newValue: [string | null, string | null] | null) =>
                        tidyDateRange(newValue, setDateValue)
                    }
                />

                <Button size="sm" radius="sm" variant="filled" color="aceBlue" onClick={handleAssignClick} mt="md">
                    {t("Apply Filters")}
                </Button>
            </div>
        </Modal>
    );
};
export default FilterAuditDialog;
