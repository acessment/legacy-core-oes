import { useEffect, useState } from "react";
import { Modal, Button, MultiSelect, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import ACETag from "../../../component/buttons/ACETag";
import { category_options } from "../../../utils/options/category_options";
import { grade_options } from "../../../utils/options/grade_options";
import { DialogOption } from "../../account/type";
import { fetchInstitutionClassGroups, fetchInstitutionSchools } from "../../account/api";
import { tidyDateRange } from "@/utils/dateFormator";

interface filterHomeworkParams {
    categories: string;
    grades: string;
    schools: string;
    classGroups: string;
    submissionStatus: string;
    markingStatus: string;
    startDate: string;
    expiryDate: string;
}
interface IFilterHomeworkDialogProps {
    onFilterClick: (params: filterHomeworkParams) => void;
    open: boolean;
    handleClose: () => void;
}

const HOMEWORK_STATUS_OPTIONS: DialogOption[] = [
    { value: "Submitted", label: "Submitted" },
    { value: "Pending", label: "Pending" },
    { value: "Expired", label: "Expired" },
];

const MARKING_STATUS_OPTIONS: DialogOption[] = [
    { value: "Marked", label: "Marked" },
    { value: "Pending", label: "Pending" },
];

const FilterHomeworkDialog = ({ onFilterClick, open, handleClose }: IFilterHomeworkDialogProps) => {
    const [categoryValue, setCategoryValue] = useState<string[]>([]);
    const [gradeValue, setGradeValue] = useState<string[]>([]);
    const [schoolValue, setSchoolValue] = useState<string[]>([]);
    const [classGroupValue, setClassGroupValue] = useState<string[]>([]);
    const [dateValue, setDateValue] = useState<[string | null, string | null]>([null, null]);
    const [statusValue, setStatusValue] = useState<DialogOption | null>(null);
    const [markingStatusValue, setMarkingStatusValue] = useState<DialogOption | null>(null);

    const [schoolOptions, setSchoolOptions] = useState<DialogOption[]>([]);
    const [classGroupOptions, setClassGroupOptions] = useState<DialogOption[]>([]);

    const initFetchData = async () => {
        const [schoolRes, classGroupRes] = await Promise.all([
            // fetch schools and class groups from API or context
            await fetchInstitutionSchools(),
            await fetchInstitutionClassGroups(),
        ]);

        const schoolOptions = schoolRes.map((school: any) => ({
            label: school.name,
            value: school.id,
        }));
        const classGroupOptions = classGroupRes.map((group: any) => ({
            label: group.name,
            value: group.id,
        }));

        setSchoolOptions(schoolOptions);
        setClassGroupOptions(classGroupOptions);
    };

    useEffect(() => {
        if (open) {
            initFetchData();
        }
    }, [open]);

    const resetAll = () => {
        setCategoryValue([]);
        setGradeValue([]);
        setSchoolValue([]);
        setClassGroupValue([]);
        setDateValue([null, null]);
        setStatusValue(null);
        setMarkingStatusValue(null);
    };

    const handleFilterClick = () => {
        // For demonstration purpose, we will just log the values
        console.log("Category Value:", categoryValue);
        gradeValue.forEach((grade: string) => {
            console.log("Grade Value:", grade);
        });
        const filterParams: filterHomeworkParams = {
            categories: categoryValue.join(",").trim() ?? "",
            grades: gradeValue.join(",").trim() ?? "",
            schools: schoolValue.join(",").trim() ?? "",
            classGroups: classGroupValue.join(",").trim() ?? "",
            submissionStatus: statusValue ? (statusValue as DialogOption).value : "",
            markingStatus: markingStatusValue ? (markingStatusValue as DialogOption).value : "",
            startDate: dateValue[0] ?? "",
            expiryDate: dateValue[1] ?? "",
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
                    <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                    <MultiSelect
                        value={categoryValue}
                        onChange={setCategoryValue}
                        data={category_options}
                        placeholder="Select Categories"
                        size="sm"
                        radius="sm"
                    />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Grade</p>
                    <MultiSelect
                        value={gradeValue}
                        onChange={setGradeValue}
                        data={grade_options}
                        placeholder="Select Grades: P1, P2..."
                        searchable
                        size="sm"
                        radius="sm"
                    />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">School</p>
                    <MultiSelect
                        value={schoolValue}
                        onChange={setSchoolValue}
                        data={schoolOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
                        placeholder="Select Schools"
                        searchable
                        size="sm"
                        radius="sm"
                    />
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Class Group</p>
                    <MultiSelect
                        value={classGroupValue}
                        onChange={setClassGroupValue}
                        data={classGroupOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
                        placeholder="Select Class Groups"
                        searchable
                        size="sm"
                        radius="sm"
                    />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Submission Status</p>
                    <Select
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
                                            opt?.value === "Submitted"
                                                ? "green"
                                                : opt?.value === "Pending"
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
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Marking Status</p>
                    <Select
                        value={markingStatusValue?.value}
                        onChange={(value) => {
                            const option = MARKING_STATUS_OPTIONS.find((opt) => opt.value === value);
                            setMarkingStatusValue(option || null);
                        }}
                        data={MARKING_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                        placeholder="Select Status"
                        size="sm"
                        radius="sm"
                        renderOption={({ option }) => {
                            const opt = MARKING_STATUS_OPTIONS.find((m) => m.value === option.value);
                            return (
                                <div className="py-1 pl-2">
                                    <ACETag
                                        showDot={true}
                                        color={
                                            opt?.value === "Marked"
                                                ? "green"
                                                : opt?.value === "Pending"
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
                <div>
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

                <Button color="aceBlue" size="sm" radius="sm" onClick={handleFilterClick}>
                    Filter Homework
                </Button>
            </div>
        </Modal>
    );
};
export default FilterHomeworkDialog;
