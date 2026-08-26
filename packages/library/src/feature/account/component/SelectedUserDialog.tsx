import { useTranslation } from "react-i18next";
import { Modal, Button } from "@mantine/core";

interface SelectedUserDialogProps {
    open: boolean;
    handleClose: () => void;
    handleSubmit: (actionArgs: any) => void; // Optional prop for custom submit handling
    title: string;
}

const SelectedUserDialog = (props: SelectedUserDialogProps) => {
    const { open, handleClose, handleSubmit, title } = props;
    const { t } = useTranslation();

    return (
        <Modal
            opened={open}
            onClose={handleClose}
            title={title}
            size="sm"
            classNames={{ title: "text-xl! font-semibold!" }}
        >
            <div className="min-w-[320px]">
                <div>
                    <span className="text-gray-600 mb-4">{t("Selected students:")}</span>

                    <span className="text-gray-800">{selectedRows.map((row) => row.username).join(", ")}</span>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Button variant="default" onClick={handleClose} size="sm" radius="sm">
                        {t("Cancel")}
                    </Button>
                    <Button color="aceBlue" onClick={() => handleSubmit({ selectedRows })} size="sm" radius="sm">
                        {t("Confirm")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SelectedUserDialog;
