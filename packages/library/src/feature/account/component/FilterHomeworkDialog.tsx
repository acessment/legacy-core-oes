import { useState } from "react";
import { Modal, Button, MultiSelect, Select } from "@mantine/core";
import ACETag from "../../../component/buttons/ACETag";
import { categoryOptions, HOMEWORK_STATUS_OPTIONS } from "../type/options";
import { IUserHomeworkFilterParams } from "../type";
import { DatePickerInput } from "@mantine/dates";
import { tidyDateRange } from "@/utils/dateFormator";

type DialogOption = {
    label: string;
    value: string;
};

interface IFilterHomeworkDialogProps {
    onFilterClick: (params: IUserHomeworkFilterParams) => void;
    open: boolean;
    handleClose: () => void;
}

const FilterHomeworkDialog = ({ onFilterClick, open, handleClose }: IFilterHomeworkDialogProps) => {
    const [categoryValue, setCategoryValue] = useState<DialogOption[]>([]);
    const [statusValue, setStatusValue] = useState<DialogOption | null>(null);
    const [dateValue, setDateValue] = useState<[string | null, string | null]>([null, null]);

    const handleFilterClick = () => {
        const filterParams: IUserHomeworkFilterParams = {
            categories: categoryValue?.map((option) => option.value).join(",") ?? "",
            submissionStatus: statusValue?.value ?? "",
            startDate: dateValue[0] ?? "",
            expiryDate: dateValue[1] ?? "",
        };
        onFilterClick(filterParams);
    };

    return (
        <Modal opened={open} onClose={handleClose} title="Filter Homework" size="md">
            <div className="flex flex-col gap-4 overflow-y-scroll">
                <div>
                    <MultiSelect
                        label="Category"
                        placeholder="Select Categories"
                        data={categoryOptions.map((option) => ({ value: option.value, label: option.label }))}
                        value={categoryValue.map((option) => option.value)}
                        onChange={(values) => {
                            const selectedOptions = values
                                .map((value) => categoryOptions.find((option) => option.value === value))
                                .filter(Boolean) as DialogOption[];
                            setCategoryValue(selectedOptions);
                        }}
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                        searchable
                        clearable
                    />
                </div>

                <div className="mt-2">
                    <p className="font-medium text-ace-text-primary-gray text-sm">Homework Deadline</p>
                    <DatePickerInput
                        label="Homework Date Range"
                        type="range"
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                        allowSingleDateInRange
                        onChange={(newValue: [string | null, string | null] | null) => {
                            tidyDateRange(newValue, setDateValue);
                        }}
                    />
                </div>

                <div className="mt-2">
                    <Select
                        label="Status"
                        placeholder="Select Status"
                        data={HOMEWORK_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                        value={statusValue?.value ?? null}
                        onChange={(value) => {
                            const selectedOption = HOMEWORK_STATUS_OPTIONS.find((option) => option.value === value);
                            setStatusValue(selectedOption || null);
                        }}
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                        clearable
                        renderOption={({ option }) => (
                            <ACETag
                                showDot={true}
                                color={
                                    option.value === "Submitted"
                                        ? "green"
                                        : option.value === "Pending"
                                        ? "yellow"
                                        : "red"
                                }
                            >
                                {option.label}
                            </ACETag>
                        )}
                    />
                </div>

                <Button size="sm" radius="sm" variant="filled" color="aceBlue" onClick={handleFilterClick}>
                    Filter Homework
                </Button>
            </div>
        </Modal>
    );
};
export default FilterHomeworkDialog;
