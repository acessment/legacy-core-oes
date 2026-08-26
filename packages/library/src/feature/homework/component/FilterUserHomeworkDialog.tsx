import { useEffect, useState } from "react";
import { Modal, Button, MultiSelect, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import ACETag from "../../../component/buttons/ACETag";
import { category_options } from "../../../utils/options/category_options";
import { DialogOption } from "../../account/type";
import { tidyDateRange } from "@/utils/dateFormator";

interface filterUserHomeworkParams {
    categories: string;
    submissionStatus: string;
    startDate: string;
    expiryDate: string;
}
interface IFilterHomeworkDialogProps {
    onFilterClick: (params: filterUserHomeworkParams) => void;
    open: boolean;
    handleClose: () => void;
}

const HOMEWORK_STATUS_OPTIONS: DialogOption[] = [
    { value: "Submitted", label: "Submitted" },
    { value: "Pending", label: "Pending" },
    { value: "Expired", label: "Expired" },
];

const FilterUserHomeworkDialog = ({ onFilterClick, open, handleClose }: IFilterHomeworkDialogProps) => {
    const [categoryValue, setCategoryValue] = useState<string[]>([]);

    const [dateValue, setDateValue] = useState<[string | null, string | null]>([null, null]);
    const [statusValue, setStatusValue] = useState<DialogOption | null>(null);

    useEffect(() => {
        if (open) {
            resetAll();
        }
    }, [open]);

    const resetAll = () => {
        setCategoryValue([]);
        setDateValue([null, null]);
        setStatusValue(null);
    };

    const handleFilterClick = () => {
        const filterParams: filterUserHomeworkParams = {
            categories: categoryValue.join(",").trim(),
            submissionStatus: statusValue ? (statusValue as DialogOption).value : "",
            startDate: dateValue[0] || "",
            expiryDate: dateValue[1] || "",
        };
        console.log("Filter Params:", filterParams);
        onFilterClick(filterParams);
    };

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            title="Filter Homework"
            size="md"
            classNames={{ title: "text-xl! font-semibold!" }}
        >
            <div className="flex flex-col gap-4">
                <div>
                    <MultiSelect
                        label="Category"
                        value={categoryValue}
                        onChange={setCategoryValue}
                        data={category_options}
                        placeholder="Select Categories"
                        size="sm"
                        radius="sm"
                    />
                </div>

                <div>
                    <DatePickerInput
                        label="Homework Date Range"
                        type="range"
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                        allowSingleDateInRange
                        maxDate={new Date()}
                        onChange={(newValue: [string | null, string | null] | null) => {
                            tidyDateRange(newValue, setDateValue);
                        }}
                    />
                </div>

                <div>
                    <Select
                        label="Submission Status"
                        value={statusValue?.value}
                        onChange={(value) => {
                            const option = HOMEWORK_STATUS_OPTIONS.find((opt) => opt.value === value);
                            setStatusValue(option || null);
                        }}
                        data={HOMEWORK_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                        placeholder="Select Status"
                        size="sm"
                        radius="sm"
                        renderOption={({ option }) => {
                            const opt = HOMEWORK_STATUS_OPTIONS.find((h) => h.value === option.value);
                            return (
                                <div className="py-1 pl-2">
                                    <ACETag
                                        showDot={true}
                                        color={
                                            opt?.value.toLowerCase() === "submitted"
                                                ? "green"
                                                : opt?.value.toLowerCase() === "pending"
                                                ? "yellow"
                                                : "red"
                                        }
                                    >
                                        {opt?.label}
                                    </ACETag>
                                </div>
                            );
                        }}
                    />
                </div>

                <Button color="aceBlue" size="sm" radius="sm" onClick={handleFilterClick}>
                    Filter Exercises
                </Button>
            </div>
        </Modal>
    );
};
export default FilterUserHomeworkDialog;
