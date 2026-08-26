import { MultiSelect, Modal, Select, Button } from "@mantine/core";

import { useEffect, useState } from "react";
import ACETag from "../../../component/buttons/ACETag";
import { gradeOptions, ACCOUNT_STATUS_OPTIONS } from "../type/options";
import type { FilterAccountsDialogFilterParams } from "../type";
import { fetchInstitutionClassGroups, fetchInstitutionSchools } from "../api";

interface IFilterAccountsDialogProps {
    onFilterClick: (params: FilterAccountsDialogFilterParams) => void;
    onResetClick?: () => void;
    open: boolean;
    handleClose: () => void;
    hasSubscriptionPlugin?: boolean;
    subscriptionOptions?: { value: string; label: string }[];
    initialFilter?: FilterAccountsDialogFilterParams;
}

const FilterAccountsDialog = ({
    onFilterClick,
    onResetClick,
    open,
    handleClose,
    hasSubscriptionPlugin,
    subscriptionOptions,
    initialFilter,
}: IFilterAccountsDialogProps) => {
    const [gradeValue, setGradeValue] = useState<string[]>([]);
    const [schoolValue, setSchoolValue] = useState<string[]>([]);
    const [classGroupValue, setClassGroupValue] = useState<string[]>([]);
    const [statusValue, setStatusValue] = useState<string | null>(null);
    const [subscriptionValue, setSubscriptionValue] = useState<string | null>(null);
    const [schoolOptions, setSchoolOptions] = useState<{ value: string; label: string }[]>([]);
    const [classGroupOptions, setClassGroupOptions] = useState<{ value: string; label: string }[]>([]);

    const fetchInitialData = async () => {
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

    const resetFilterValues = () => {
        setGradeValue([]);
        setSchoolValue([]);
        setClassGroupValue([]);
        setStatusValue(null);
        setSubscriptionValue(null);
    };

    useEffect(() => {
        // fetch initial data when dialog opens
        if (open) {
            fetchInitialData();
        }
    }, [open]);

    useEffect(() => {
        // Sync filter values with URL params whenever initialFilter changes
        if (initialFilter) {
            setGradeValue(initialFilter.grades ? initialFilter.grades.split(",").filter(Boolean) : []);
            setSchoolValue(initialFilter.schoolIds ? initialFilter.schoolIds.split(",").filter(Boolean) : []);
            setClassGroupValue(
                initialFilter.classGroupIds ? initialFilter.classGroupIds.split(",").filter(Boolean) : []
            );
            setStatusValue(initialFilter.status || null);
            setSubscriptionValue(initialFilter.subscriptions || null);
        }
    }, [
        initialFilter?.grades,
        initialFilter?.schoolIds,
        initialFilter?.classGroupIds,
        initialFilter?.status,
        initialFilter?.subscriptions,
    ]);
    const handleFilterClick = () => {
        console.log("Grade Value:", gradeValue);
        console.log("School Value:", schoolValue);
        console.log("Class Group Value:", classGroupValue);
        console.log("Status Value:", statusValue);

        const filterParams: FilterAccountsDialogFilterParams = {
            schoolIds: schoolValue.join(","),
            grades: gradeValue.join(","),
            status: statusValue || "",
            classGroupIds: classGroupValue.join(","),
            subscriptions: subscriptionValue || undefined,
        };

        onFilterClick(filterParams);
    };

    const handleResetClick = () => {
        resetFilterValues();
        if (onResetClick) {
            onResetClick();
        }
    };

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            title="Filter Accounts"
            size="lg"
            padding={"lg"}
            classNames={{ title: "text-xl! font-semibold!" }}
        >
            <div className="flex flex-col">
                <MultiSelect
                    className="mt-2"
                    label="Grade"
                    placeholder="Select Grades: P1, P2..."
                    data={gradeOptions.map((option) => ({ value: option.value, label: option.label }))}
                    value={gradeValue}
                    onChange={setGradeValue}
                    searchable
                    clearable
                    size="sm"
                    radius="sm"
                    color="aceBlue"
                />

                <MultiSelect
                    className="mt-2"
                    label="School"
                    placeholder="Select Schools"
                    data={schoolOptions}
                    value={schoolValue}
                    onChange={setSchoolValue}
                    searchable
                    clearable
                    size="sm"
                    radius="sm"
                    color="aceBlue"
                />

                <MultiSelect
                    className="mt-2"
                    label="Class Group"
                    placeholder="Select Class Groups"
                    data={classGroupOptions}
                    value={classGroupValue}
                    onChange={setClassGroupValue}
                    searchable
                    clearable
                    size="sm"
                    radius="sm"
                    color="aceBlue"
                />

                {hasSubscriptionPlugin && subscriptionOptions && (
                    <Select
                        className="mt-2"
                        label="Subscription Plan"
                        placeholder="Select Subscription Plan"
                        data={subscriptionOptions}
                        value={subscriptionValue}
                        onChange={setSubscriptionValue}
                        clearable
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                    />
                )}

                <Select
                    className="mt-2"
                    label="Status"
                    placeholder="Select Status"
                    data={ACCOUNT_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                    value={statusValue}
                    onChange={setStatusValue}
                    clearable
                    size="sm"
                    radius="sm"
                    color="aceBlue"
                />

                <div className="flex gap-2 mt-4">
                    <Button className="flex-1" color="aceBlue" size="sm" radius="sm" onClick={handleFilterClick}>
                        Filter
                    </Button>
                    <Button
                        className="flex-1"
                        color="gray"
                        variant="outline"
                        size="sm"
                        radius="sm"
                        onClick={handleResetClick}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default FilterAccountsDialog;
