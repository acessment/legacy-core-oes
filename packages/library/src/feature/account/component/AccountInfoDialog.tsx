import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, MultiSelect, Select as MantineSelect } from "@mantine/core";
import { optionsType } from "../../../utils/model";
import { IAccountSummary, ICreateUserRequest, IUserRequest } from "../type";
import {
    createUser,
    fetchInstitutionClassGroups,
    fetchInstitutionSchools,
    updateUserList,
    updateUserRole,
} from "../api";
import { toast } from "react-toastify/unstyled";
import { gradeOptions } from "../type/options";
import { RoleEnum } from "@/enum/RoleEnum";

interface AccountInfoDialogProps {
    accountData?: IAccountSummary;
    open: boolean;
    handleClose: () => void;
    fetchData: () => void;
    availableRoles: RoleEnum[];
}

const initialData = {
    username: "",
    password: "",
    grade: "",
    classGroups: [],
    school: null,
    contact: "",
    role: RoleEnum.USER,
};
const AccountInfoDialog: React.FC<AccountInfoDialogProps> = ({
    open,
    handleClose,
    fetchData,
    accountData,
    availableRoles,
}) => {
    const [data, setData] = useState<{
        username: string;
        password: string;
        grade: string;
        classGroups: optionsType[];
        school: optionsType | null;
        contact: string;
        role: string;
    }>(
        accountData
            ? {
                  username: accountData.username,
                  password: "", // Password should not be pre-filled for security reasons
                  grade: accountData.grade,
                  classGroups: accountData.classGroups.map((group) => ({
                      label: group.name,
                      value: group.classGroupId,
                  })),
                  school: accountData.school
                      ? { label: accountData.school.name, value: accountData.school.schoolId }
                      : null,
                  contact: accountData.contact,
                  role: accountData.roles?.[0] || "",
              }
            : initialData
    );

    const [classGroupOptions, setClassGroupOptions] = useState<optionsType[]>([]);
    const [schoolOptions, setSchoolOptions] = useState<optionsType[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Function to validate username input
    const validateUsername = (value: string): string => {
        const invalidChars = value.match(/[^a-zA-Z0-9._-]/g);
        if (invalidChars) {
            const uniqueInvalidChars = [...new Set(invalidChars)].join(", ");
            return `Invalid characters detected: ${uniqueInvalidChars}. Only letters, numbers, ., -, _ are allowed.`;
        }
        return "";
    };

    // Function to validate password input
    const validatePassword = (value: string): string => {
        if (value.length > 0 && value.length < 6) {
            return "Password must be at least 6 characters long.";
        }
        return "";
    };

    const handleUsernameChange = (value: string) => {
        setData({ ...data, username: value });
    };

    const handlePasswordChange = (value: string) => {
        setData({ ...data, password: value });
    };

    const fetchOptions = async () => {
        const [schoolRes, classGroupRes] = await Promise.all([
            fetchInstitutionSchools(),
            fetchInstitutionClassGroups(),
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
            fetchOptions();
        }
    }, [open]);

    const handleCreate = async () => {
        const usernameError = validateUsername(data.username);
        const passwordError = validatePassword(data.password);

        if (!data.username || !data.password || usernameError || passwordError) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setSubmitting(true);
        const req: ICreateUserRequest = {
            username: data.username,
            password: data.password,
            grade: data.grade,
            classGroups: data.classGroups.map((g) => g.value),
            school: data.school?.value ?? undefined,
            contact: data.contact,
            roles: [data.role || RoleEnum.USER],
        };
        try {
            // Call the API to create the student
            await createUser(req);
            toast.success("Student created successfully!");

            fetchData();
            setData(initialData); // Clear the form state
            handleClose();
            // Optionally show a toast here
        } catch (e) {
            toast.error("Failed to create student. Please try again.");
            // Optionally handle error/toast
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        const usernameError = validateUsername(data.username);

        if (!data.username || usernameError) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }
        setSubmitting(true);
        const req: IUserRequest = {
            id: accountData!.id,
            username: data.username,
            grade: data.grade,
            classGroups: data.classGroups.map((g) => g.value),
            school: data.school?.value ?? undefined,
            contact: data.contact,
            status: accountData!.status, // Assuming status is not being updated
            roles: data.role ? [data.role] : undefined,
        };

        try {
            // Call the API to update the student
            await updateUserList([req]);

            // Update user role if it changed
            if (data.role && data.role !== accountData?.roles?.[0]) {
                await updateUserRole({
                    userId: accountData!.id,
                    roles: [data.role],
                });
            }

            toast.success("Student updated successfully!");
            fetchData();
            setData(initialData);
            handleClose();
            // Optionally show a toast here
        } catch (e) {
            toast.error("Failed to update student. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            title={accountData ? "Update Student Account" : "Create Student Account"}
            size="lg"
        >
            <div className="overflow-y-auto">
                <div className="mb-4">
                    <TextInput
                        label="Username"
                        value={data.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        disabled={submitting || accountData !== undefined}
                        placeholder="Enter username (letters, numbers, ., -, _ only)"
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                        error={validateUsername(data.username)}
                    />
                </div>

                {!accountData && (
                    <div className="mb-4">
                        <TextInput
                            label="Password"
                            type="password"
                            value={data.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            disabled={submitting}
                            placeholder="Enter password (minimum 6 characters)"
                            size="sm"
                            radius="sm"
                            color="aceBlue"
                            error={validatePassword(data.password)}
                        />
                    </div>
                )}
                <div className="mb-4">
                    <TextInput
                        label="Contact"
                        value={data.contact}
                        onChange={(e) => setData({ ...data, contact: e.target.value })}
                        disabled={submitting}
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                    />
                    <div className="mb-4">
                        <MantineSelect
                            label="Grade"
                            placeholder="Select Grades: P1, P2..."
                            value={data.grade}
                            onChange={(value) => {
                                setData({ ...data, grade: value || "" });
                            }}
                            data={gradeOptions.map((option) => ({ value: option.value, label: option.label }))}
                            size="sm"
                            radius="sm"
                            color="aceBlue"
                            searchable
                            clearable
                        />
                    </div>
                    {availableRoles && availableRoles.length > 1 && (
                        <div className="mb-4">
                            <MantineSelect
                                label="Role"
                                placeholder="Select Role"
                                data={availableRoles.map((role) => ({ value: role, label: role }))}
                                value={data.role || null}
                                onChange={(value) => {
                                    setData({ ...data, role: value || "" });
                                }}
                                disabled={submitting}
                                size="sm"
                                radius="sm"
                                color="aceBlue"
                                searchable
                                clearable
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <MultiSelect
                            label="Class Group"
                            placeholder="Select Class Groups"
                            data={classGroupOptions.map((option) => ({ value: option.value, label: option.label }))}
                            value={data.classGroups?.map((group) => group.value) || []}
                            onChange={(values) => {
                                const selectedGroups = values
                                    .map((value) => classGroupOptions.find((option) => option.value === value))
                                    .filter(Boolean) as optionsType[];
                                setData({ ...data, classGroups: selectedGroups });
                            }}
                            disabled={submitting}
                            size="sm"
                            radius="sm"
                            color="aceBlue"
                            searchable
                            clearable
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <MantineSelect
                        label="School"
                        placeholder="Select Schools"
                        data={schoolOptions.map((option) => ({ value: option.value, label: option.label }))}
                        value={data.school?.value || null}
                        onChange={(value) => {
                            const selectedSchool = schoolOptions.find((option) => option.value === value);
                            setData({ ...data, school: selectedSchool || null });
                        }}
                        disabled={submitting}
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                        searchable
                        clearable
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="default" size="sm" radius="sm" onClick={handleClose} disabled={submitting}>
                        Cancel
                    </Button>
                    {accountData ? (
                        <Button color="aceBlue" size="sm" radius="sm" onClick={handleUpdate} disabled={submitting}>
                            {submitting ? "Updating..." : "Update"}
                        </Button>
                    ) : (
                        <Button color="aceBlue" size="sm" radius="sm" onClick={handleCreate} disabled={submitting}>
                            {submitting ? "Creating..." : "Create"}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AccountInfoDialog;
