import React, { useContext, useEffect, useState } from "react";
import { MultiSelect, Modal, Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { optionsType } from "../../../utils/model";
import { fetchInstitutionClassGroups, updateUserList } from "../api";
import { IUserRequest } from "../type";
import { toast } from "react-toastify/unstyled";
import { AccountSummaryPluginContext } from "@/feature/account/plugins/context/AccountTablePluginContext";

interface AssignGroupDialogProps {
    open?: boolean;
    handleClose?: () => void;
}

const AssignGroupDialog = ({ open = false, handleClose = () => {} }: AssignGroupDialogProps) => {
    const { t } = useTranslation();
    const context = useContext(AccountSummaryPluginContext);
    const selectedRows = context?.selectedItems || [];
    const fetchData = context?.fetchData;
    const searchQuery = context?.searchQuery || {
        schools: "",
        grades: "",
        classGroups: "",
        status: "",
        page: 0,
        size: 25,
        keyword: "",
    };

    const [options, setOptions] = useState<optionsType[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOptions = async () => {
        const res = await fetchInstitutionClassGroups();
        return res.map((group: any) => ({
            label: group.name,
            value: group.id,
        }));
    };

    useEffect(() => {
        if (open) {
            setLoading(true);
            fetchOptions()
                .then((fetchedOptions) => {
                    setOptions(fetchedOptions);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [open]);

    const handleSubmit = async (selectedGroups: string[]) => {
        // add school to selected rows if not already present
        const updatedRows: IUserRequest[] = selectedRows.map((row) => {
            const existingGroupIds = row.classGroups.map((group) => group?.classGroupId);
            // add newGroupId to it if it is not already present
            const newGroupsId = selectedGroups
                .filter((groupId) => !existingGroupIds.includes(groupId))
                .concat(existingGroupIds);
            return {
                classGroups: newGroupsId,
                id: row.id,
                status: row.status,
                username: row.username,
                school: row.school?.schoolId,
                grade: row.grade,
                contact: row.contact,
            };
        });
        try {
            setLoading(true);
            await updateUserList(updatedRows);
            toast.success(t("Groups assigned successfully"));
        } catch (error) {
            toast.error(t("Failed to assign groups"));
            console.error("Error assigning groups:", error);
        } finally {
            setLoading(false);
            handleClose();
            if (fetchData) await fetchData(searchQuery);
        }
    };

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            title={t("Assign Group")}
            size="lg"
            padding="lg"
            classNames={{ title: "text-2xl! font-semibold!" }}
        >
            <div className="min-w-[320px] overflow-y-auto">
                <div>
                    <p className="text-gray-800 mb-4 font-medium">{t("Selected students:")}</p>
                    <span className="text-gray-600">{selectedRows.map((row) => row.username).join(", ")}</span>
                    <hr className="my-4 text-gray-300" />
                </div>
                <div className="mb-4">
                    <MultiSelect
                        label="Select Groups"
                        placeholder="Choose groups to assign"
                        data={options}
                        value={selected}
                        onChange={setSelected}
                        searchable
                        clearable
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                        className="w-full"
                    />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <Button variant="outline" color="aceBlue" onClick={handleClose} size="sm" radius="sm">
                        {t("Cancel")}
                    </Button>
                    <Button
                        color="aceBlue"
                        onClick={() => handleSubmit(selected)}
                        size="sm"
                        radius="sm"
                        disabled={loading || selected.length === 0}
                    >
                        {t("Assign")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignGroupDialog;
