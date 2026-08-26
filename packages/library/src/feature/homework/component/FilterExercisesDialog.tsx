import { Dispatch, SetStateAction } from "react";
import { Modal, Button, MultiSelect, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { category_options } from "../../../utils/options/category_options";
import { grade_options } from "../../../utils/options/grade_options";
import { FIlterExerciseDialogProps, IExerciseFilter } from "../type";
import { tidyDateRange } from "@/utils/dateFormator";

interface IFilterExercisesDialogProps {
    onFilterClick: (params: FIlterExerciseDialogProps) => void;
    open: boolean;
    handleClose: () => void;
    isAssignDateFilterPlugin?: boolean;
    isUploadPDFLibraryFilterPlugin?: boolean;
    searchInput: IExerciseFilter;
    setSearchInput: Dispatch<SetStateAction<IExerciseFilter>>;
}

// Helper to generate the default filter state
function getDefaultFilter(isAssignDateFilterPlugin?: boolean, isUploadPDFLibraryFilterPlugin?: boolean): Partial<IExerciseFilter> {
    return {
        categories: "",
        grades: "",
        createdStartedAt: "",
        createdEndedAt: "",
        welcomeExercise: undefined,
        assignStartedAt: isAssignDateFilterPlugin ? "" : undefined,
        assignEndedAt: isAssignDateFilterPlugin ? "" : undefined,
        uploadPDFLibrary: isUploadPDFLibraryFilterPlugin ? undefined : undefined,
    };
}

const FilterExercisesDialog = ({
    onFilterClick,
    open,
    handleClose,
    isAssignDateFilterPlugin,
    isUploadPDFLibraryFilterPlugin,
    searchInput,
    setSearchInput,
}: IFilterExercisesDialogProps) => {
    // Helper functions to convert between string and Date
    const getDateRange = (start: string, end: string): [Date | null, Date | null] => [
        start ? new Date(start) : null,
        end ? new Date(end) : null,
    ];

    const categoryValue = searchInput.categories ? searchInput.categories.split(",") : [];
    const gradeValue = searchInput.grades ? searchInput.grades.split(",") : [];
    const dateValue = getDateRange(searchInput.createdStartedAt, searchInput.createdEndedAt);
    const assignDateValue = getDateRange(searchInput.assignStartedAt || "", searchInput.assignEndedAt || "");
    const welcomeExerciseValue = searchInput.welcomeExercise !== undefined ? String(searchInput.welcomeExercise) : null;
    const uploadPDFLibraryValue = searchInput.uploadPDFLibrary !== undefined ? String(searchInput.uploadPDFLibrary) : null;

    const handleFilterClick = () => {
        const filterParams: FIlterExerciseDialogProps = {
            categories: searchInput.categories,
            grades: searchInput.grades,
            createdStartedAt: searchInput.createdStartedAt,
            createdEndedAt: searchInput.createdEndedAt,
            welcomeExercise: searchInput.welcomeExercise || false,
            ...(isAssignDateFilterPlugin && {
                assignStartedAt: searchInput.assignStartedAt || "",
                assignEndedAt: searchInput.assignEndedAt || "",
            }),
            ...(isUploadPDFLibraryFilterPlugin && {
                uploadPDFLibrary: searchInput.uploadPDFLibrary,
            }),
        };
        onFilterClick(filterParams);
    };

    const handleReset = () => {
        setSearchInput((prev) => ({
            ...prev,
            ...getDefaultFilter(isAssignDateFilterPlugin, isUploadPDFLibraryFilterPlugin),
        }));
    };

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            size="md"
            title="Filter Exercise"
            classNames={{ title: "text-lg! font-semibold!" }}
            padding={"lg"}
        >
            <div className="mb-2">
                <MultiSelect
                    label="Category"
                    placeholder="Select Categories"
                    value={categoryValue}
                    onChange={(value) =>
                        setSearchInput((prev) => ({
                            ...prev,
                            categories: value.join(","),
                        }))
                    }
                    data={category_options}
                    size="sm"
                    radius="sm"
                    color="aceBlue"
                />
            </div>
            <div className="mb-2">
                <MultiSelect
                    label="Grade"
                    placeholder="Select Grades: P1, P2..."
                    value={gradeValue}
                    onChange={(value) =>
                        setSearchInput((prev) => ({
                            ...prev,
                            grades: value.join(","),
                        }))
                    }
                    data={grade_options}
                    searchable
                    size="sm"
                    radius="sm"
                    color="aceBlue"
                />
            </div>

            <div className="mb-2">
                <Select
                    label="Welcome Exercise"
                    placeholder="Select welcome exercise status"
                    value={welcomeExerciseValue}
                    onChange={(value) =>
                        setSearchInput((prev) => ({
                            ...prev,
                            welcomeExercise: value === "true" ? true : value === "false" ? false : undefined,
                        }))
                    }
                    data={[
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                    ]}
                    clearable
                    size="sm"
                    radius="sm"
                    color="aceBlue"
                />
            </div>

            {isUploadPDFLibraryFilterPlugin && (
                <div className="mb-2">
                    <Select
                        label="PDF Library Enabled"
                        placeholder="Select PDF Library status"
                        value={uploadPDFLibraryValue}
                        onChange={(value) =>
                            setSearchInput((prev) => ({
                                ...prev,
                                uploadPDFLibrary: value === "true" ? true : value === "false" ? false : undefined,
                            }))
                        }
                        data={[
                            { value: "true", label: "Yes" },
                            { value: "false", label: "No" },
                        ]}
                        clearable
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                    />
                </div>
            )}

            <div className="mb-2">
                <DatePickerInput
                    allowSingleDateInRange
                    label="Creation Date Range"
                    type="range"
                    size="sm"
                    radius="sm"
                    color="aceBlue"
                    value={dateValue}
                    onChange={(newValue) => {
                        if (!newValue) {
                            setSearchInput((prev) => ({
                                ...prev,
                                createdStartedAt: "",
                                createdEndedAt: "",
                            }));
                            return;
                        }
                        setSearchInput((prev) => ({
                            ...prev,
                            createdStartedAt: newValue[0] ? new Date(newValue[0]).toISOString() : "",
                            createdEndedAt: newValue[1] ? new Date(newValue[1]).toISOString() : "",
                        }));
                    }}
                />
            </div>

            {isAssignDateFilterPlugin && (
                <div className="mb-2">
                    <DatePickerInput
                        allowSingleDateInRange
                        label="Assignment Date Range"
                        type="range"
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                        minDate={new Date()}
                        value={assignDateValue}
                        onChange={(newValue) => {
                            tidyDateRange(newValue, ([start, end]) => {
                                setSearchInput((prev) => ({
                                    ...prev,
                                    assignStartedAt: start || "",
                                    assignEndedAt: end || "",
                                }));
                            });
                        }}
                    />
                </div>
            )}

            <div className="mt-4 flex gap-2">
                <Button size="sm" radius="sm" variant="filled" color="aceBlue" onClick={handleFilterClick} fullWidth>
                    Filter Exercises
                </Button>
                <Button size="sm" radius="sm" variant="outline" color="gray" onClick={handleReset} fullWidth>
                    Reset
                </Button>
            </div>
        </Modal>
    );
};
export default FilterExercisesDialog;
