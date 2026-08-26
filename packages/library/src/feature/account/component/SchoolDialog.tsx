import React, { Context, useContext, useState } from "react";
import { Modal, TextInput, Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { createSchool } from "@/feature/account/api";
import { AccountSummaryPluginContextValue } from "@/feature/account/plugins/context/AccountTablePluginContext";
import { toast } from "react-toastify/unstyled";

interface ISchoolDialogProps {
    open?: boolean;
    handleClose?: () => void;
    data?: any; // Optional data prop for future use
    pluginContext: Context<AccountSummaryPluginContextValue | undefined>;
}

const SchoolDialog: React.FC<ISchoolDialogProps> = ({
    open = false,
    handleClose = () => {},
    data, // Optional data prop for future use
    pluginContext,
}) => {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const context = useContext(pluginContext);
    const user = context?.user;

    const onSubmit = async () => {
        try {
            await createSchool({
                name,
                institutionId: user?.institutionId ?? "",
            });
            toast.success(t("School created successfully"));
        } catch (error) {
            console.error("Error creating school:", error);
        } finally {
            if (handleClose) handleClose();
        }
    };

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            title={data ? t("Edit School") : t("Create School")}
            size="lg"
            padding={"lg"}
            classNames={{ title: "text-xl! font-semibold!" }}
        >
            <div>
                <div className="mb-4">
                    <TextInput
                        label={t("School Name")}
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

export default SchoolDialog;
