import React, { useContext, useState } from "react";
import { Modal, TextInput, Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { createClassGroup } from "@/feature/account/api";
import { toast } from "react-toastify/unstyled";
import { AccountSummaryPluginContext } from "@/feature/account/plugins/context/AccountTablePluginContext";

interface IClassGroupDialogProps {
    open?: boolean;
    handleClose?: () => void;
    data?: any; // Optional data prop for future use
}

const ClassGroupDialog: React.FC<IClassGroupDialogProps> = ({
    open = false,
    handleClose = () => {},
    data, // Optional data prop for future use
}) => {
    const context = useContext(AccountSummaryPluginContext);
    const user = context?.user;
    const { t } = useTranslation();
    const [name, setName] = useState("");

    const handleCreateClassGroupSubmit = async (name: string) => {
        try {
            console.log("Creating class group with name:", name);
            await createClassGroup({
                name,
                institutionId: user?.institutionId ?? "",
            });
            toast.success(t("Class Group created successfully"));
        } catch (error) {
            console.error("Error creating school:", error);
        } finally {
            handleClose();
        }
    };

    const onSubmit = () => {
        if (name.trim()) {
            handleCreateClassGroupSubmit(name.trim());
            setName(""); // Reset name after submission
        }
    };

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            title={data ? t("Edit Class/Group") : t("Create Class/Group")}
            size="sm"
            classNames={{ title: "text-xl! font-semibold!" }}
        >
            <div>
                <div className="mb-4">
                    <TextInput
                        label={t("Class/Group Name")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        size="sm"
                        radius="sm"
                        color="aceBlue"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                onSubmit();
                            }
                        }}
                    />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button onClick={onSubmit} color="aceBlue" size="sm" radius="sm" disabled={!name.trim()}>
                        {data ? t("Update") : t("Create")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ClassGroupDialog;
