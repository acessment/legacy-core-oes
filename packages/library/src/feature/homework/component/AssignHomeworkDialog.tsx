import { useContext, useEffect, useState } from "react";
import { Modal, Button, MultiSelect, Text, ScrollArea, Alert } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { grade_options } from "../../../utils/options/grade_options";
import { optionsType } from "../../../utils/model";
import { CreateHomeworkRequest, DialogOption } from "../../account/type";
import { createHomework, fetchStudentOptions } from "../api";
import { fetchInstitutionSchools, fetchInstitutionClassGroups } from "../../account/api";
import { IExerciseSummary } from "../type";
import { toast } from "react-toastify/unstyled";
import { tidyDateRange } from "@/utils/dateFormator";
import { ExercisePluginContext } from "@/feature/homework/plugins/context/ExerciseTablePluginContext";
import { IconAlertCircle, IconBook } from "@tabler/icons-react";

interface IAssignHomeworkDialogProps {
    open?: boolean;
    handleClose?: () => void;
    currentExercise?: IExerciseSummary[];
    userId?: string;
    hasSubscriptionPlugin?: boolean;
    subscriptionOptions?: { value: string; label: string }[];
}

interface IFilterQueryParams {
    schoolIds: string[];
    classGroupIds: string[];
    grades: string[];
    subscriptions?: string[];
}

const AssignHomeworkDialog = ({
    open = false,
    handleClose = () => {},
    currentExercise,
    userId,
    hasSubscriptionPlugin,
    subscriptionOptions,
}: IAssignHomeworkDialogProps) => {
    // Get data from context
    const context = useContext(ExercisePluginContext);
    const selectedExercises = currentExercise || ((context?.selectedItems || []) as IExerciseSummary[]);
    const currentUserId = userId || (context?.user?.id ?? "");
    // Grouped state for selected values - updated for Mantine components
    const [selected, setSelected] = useState<{
        grades: string[];
        schools: string[];
        classGroups: string[];
        students: string[];
        subscriptions: string[];
    }>({
        grades: [],
        schools: [],
        classGroups: [],
        students: [],
        subscriptions: [],
    });

    // Options for selects
    const [schoolOptions, setSchoolOptions] = useState<DialogOption[]>([]);
    const [classGroupOptions, setClassGroupOptions] = useState<DialogOption[]>([]);
    const [studentOptions, setStudentOptions] = useState<optionsType[]>([]);

    // Filter state
    const [filter, setFilter] = useState<IFilterQueryParams>({
        schoolIds: [],
        classGroupIds: [],
        grades: [],
    });

    // Date range
    const [dateValue, setDateValue] = useState<[string | null, string | null]>([null, null]);

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    const handleAssignClick = async () => {
        if (isLoading) {
            toast.info("Your homework is being assigned. Please patiently wait and do not click again.");
            return;
        }

        // Validate exercise selection
        if (selectedExercises.length === 0) {
            toast.error("Please select at least one exercise to assign.");
            return;
        }

        setIsLoading(true);

        //validate inputs
        console.log(dateValue);
        if (!dateValue[0] || !dateValue[1]) {
            toast.error("Please select a valid date range for the homework.");
            setIsLoading(false);
            return;
        }

        // Prevent multiple clicks

        try {
            const requests: CreateHomeworkRequest[] = [];
            for (const exercise of selectedExercises) {
                selected.students.forEach((studentId) => {
                    if (!studentId) return;

                    // Find student by ID to get label
                    const student = studentOptions.find((s) => s.value === studentId);
                    if (!student) return;

                    console.log(dateValue[0], dateValue[1]);

                    const req: CreateHomeworkRequest = {
                        exerciseId: exercise.id,
                        title: exercise.title,
                        category: exercise.category,
                        grade: exercise.grade,
                        assignedTeacherId: currentUserId,
                        assignedStudentId: studentId,
                        startDate: dateValue[0]!,
                        expiryDate: dateValue[1]!,
                        username: student.label,
                    };
                    requests.push(req);
                });
            }
            // Call the API to create homework assignments
            console.log("Creating homework requests:", requests);
            await createHomework(requests);
            toast.success("Homework assigned successfully!");
            if (handleClose) handleClose();
            // Don't reset isLoading on success - dialog is closing and resetAll() will handle it
        } catch (error) {
            console.error("Failed to assign homework:", error);
            toast.error("Failed to assign homework. Please try again.");
            setIsLoading(false); // Only reset on error so user can retry
        }
    };

    const initFetchData = async (params: IFilterQueryParams) => {
        const [schoolRes, classGroupRes] = await Promise.all([
            // fetch schools and class groups from API or context
            await fetchInstitutionSchools(),
            await fetchInstitutionClassGroups(),
        ]);
        const data = await fetchStudentOptions({
            schoolIds: params?.schoolIds.join(",") ?? "",
            classGroupIds: params?.classGroupIds.join(",") ?? "",
            grades: params?.grades.join(",") ?? "",
            subscriptions: params?.subscriptions?.join(",") ?? "",
        });
        setStudentOptions(data);
        const schoolOptions = schoolRes.map((school: { id: string; name: string }) => ({
            label: school.name,
            value: school.id,
        }));
        const classGroupOptions = classGroupRes.map((group: { id: string; name: string }) => ({
            label: group.name,
            value: group.id,
        }));

        setSchoolOptions(schoolOptions);
        setClassGroupOptions(classGroupOptions);
    };

    useEffect(() => {
        if (open) {
            resetAll();
            const initialFilter = { schoolIds: [], classGroupIds: [], grades: [] };
            console.log("Fetching initial data for AssignHomeworkDialog with filter:", initialFilter);
            initFetchData(initialFilter);
        }
    }, [open]); // Remove filter from dependencies

    const resetAll = () => {
        setSelected({ grades: [], schools: [], classGroups: [], students: [], subscriptions: [] });
        setDateValue([null, null]);
        setFilter({ schoolIds: [], classGroupIds: [], grades: [] });
        setIsLoading(false);
    };

    const onGradeChange = async (value: string[]) => {
        setSelected((prev) => ({ ...prev, grades: value }));
        const newFilter = { ...filter, grades: value };
        setFilter(newFilter);
        const students = await fetchStudentOptions({
            schoolIds: newFilter.schoolIds.join(","),
            classGroupIds: newFilter.classGroupIds.join(","),
            grades: newFilter.grades.join(","),
            subscriptions: newFilter.subscriptions?.join(",") ?? "",
        });
        setSelected((prev) => ({
            ...prev,
            students: students.map((student: optionsType) => student.value),
        }));
    };

    const onSchoolChange = async (value: string[]) => {
        setSelected((prev) => ({ ...prev, schools: value }));
        const newFilter = { ...filter, schoolIds: value };
        setFilter(newFilter);
        const students = await fetchStudentOptions({
            schoolIds: newFilter.schoolIds.join(","),
            classGroupIds: newFilter.classGroupIds.join(","),
            grades: newFilter.grades.join(","),
            subscriptions: newFilter.subscriptions?.join(",") ?? "",
        });
        setSelected((prev) => ({
            ...prev,
            students: students.map((student: optionsType) => student.value),
        }));
    };

    const onClassGroupChange = async (value: string[]) => {
        setSelected((prev) => ({ ...prev, classGroups: value }));
        const newFilter = { ...filter, classGroupIds: value };
        setFilter(newFilter);
        const students = await fetchStudentOptions({
            schoolIds: newFilter.schoolIds.join(","),
            classGroupIds: newFilter.classGroupIds.join(","),
            grades: newFilter.grades.join(","),
            subscriptions: newFilter.subscriptions?.join(",") ?? "",
        });
        setSelected((prev) => ({
            ...prev,
            students: students.map((student: optionsType) => student.value),
        }));
    };

    const onStudentChange = (value: string[]) => {
        setSelected((prev) => ({ ...prev, students: value }));
    };

    const onSubscriptionChange = async (value: string[]) => {
        setSelected((prev) => ({ ...prev, subscriptions: value }));
        const newFilter = { ...filter, subscriptions: value };
        setFilter(newFilter);
        const students = await fetchStudentOptions({
            schoolIds: newFilter.schoolIds.join(","),
            classGroupIds: newFilter.classGroupIds.join(","),
            grades: newFilter.grades.join(","),
            subscriptions: newFilter.subscriptions?.join(",") ?? "",
        });
        setSelected((prev) => ({
            ...prev,
            students: students.map((student: optionsType) => student.value),
        }));
    };

    return (
        <Modal
            opened={open || false}
            onClose={handleClose || (() => {})}
            size="lg"
            padding="lg"
            title="Assign Homework"
            classNames={{ title: "text-xl! font-semibold!" }}
        >
            <div className="flex flex-col gap-4 bg-white">
                {/* Selected Exercises Display */}
                {selectedExercises.length > 0 ? (
                    <div className="mb-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                            <IconBook size={18} className="text-blue-600" />
                            <Text size="sm" fw={600} c="gray.7">
                                Selected Exercises ({selectedExercises.length})
                            </Text>
                        </div>
                        <ScrollArea h={selectedExercises.length > 5 ? 150 : 'auto'} type="auto">
                            <div className="flex flex-col gap-1">
                                {selectedExercises.map((exercise, index) => (
                                    <div
                                        key={exercise.id}
                                        className="text-sm text-gray-700 pl-2 py-1 hover:bg-blue-100 rounded transition-colors"
                                    >
                                        • {exercise.title}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <Alert icon={<IconAlertCircle size={18} />} color="yellow" variant="light" className="mb-2">
                        <Text size="sm">No exercises selected. Please select exercises from the table first.</Text>
                    </Alert>
                )}
                <div className="mt-2">
                    <MultiSelect
                        label="Grade"
                        placeholder="Select Grades: P1, P2..."
                        value={selected.grades}
                        onChange={onGradeChange}
                        data={grade_options}
                        searchable
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                    />
                </div>
                <div className="mt-2">
                    <MultiSelect
                        label="School"
                        placeholder="Select Schools"
                        value={selected.schools}
                        onChange={onSchoolChange}
                        data={schoolOptions}
                        searchable
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                    />
                </div>

                <div className="mt-2">
                    <MultiSelect
                        label="Class Group"
                        placeholder="Select Class Groups"
                        value={selected.classGroups}
                        onChange={onClassGroupChange}
                        data={classGroupOptions}
                        searchable
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                    />
                </div>
                {hasSubscriptionPlugin && subscriptionOptions && (
                    <div className="mt-2">
                        <MultiSelect
                            label="Subscription Plan"
                            placeholder="Select Subscription Plans"
                            value={selected.subscriptions}
                            onChange={onSubscriptionChange}
                            data={subscriptionOptions}
                            searchable
                            size="sm"
                            radius="sm"
                            color="aceBlue"
                        />
                    </div>
                )}
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
                    <Button
                        variant="outline"
                        size="xs"
                        color="aceBlue"
                        className="mt-2"
                        onClick={() => {
                            if (selected.students.length === studentOptions.length) {
                                setSelected((prev) => ({ ...prev, students: [] }));
                            } else {
                                const allStudents = studentOptions.map((student) => student.value);
                                setSelected((prev) => ({ ...prev, students: allStudents }));
                            }
                        }}
                    >
                        {selected.students.length === studentOptions.length ? "Deselect All" : "Select All"}
                    </Button>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                    {selected.students.length} of {studentOptions.length} selected
                </span>
                <DatePickerInput
                    allowSingleDateInRange
                    label="Select Date Range"
                    type="range"
                    onChange={(newValue) => {
                        // Convert string dates to Date objects if needed
                        const convertedValue: [Date | null, Date | null] | null = newValue
                            ? [newValue[0] ? new Date(newValue[0]) : null, newValue[1] ? new Date(newValue[1]) : null]
                            : null;
                        tidyDateRange(convertedValue, setDateValue);
                    }}
                />

                {selectedExercises.length > 0 && selected.students.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                        <Text size="xs" c="gray.6" fw={500}>
                            This will create{" "}
                            <Text component="span" c="blue.6" fw={700}>
                                {selectedExercises.length * selected.students.length}
                            </Text>{" "}
                            homework assignments ({selectedExercises.length} exercises × {selected.students.length} students)
                        </Text>
                    </div>
                )}

                <Button
                    size="sm"
                    radius="sm"
                    variant="filled"
                    color="aceBlue"
                    onClick={handleAssignClick}
                    mt="md"
                    loading={isLoading}
                    disabled={isLoading || selectedExercises.length === 0}
                >
                    Assign Homework
                </Button>
            </div>
        </Modal>
    );
};
export default AssignHomeworkDialog;
