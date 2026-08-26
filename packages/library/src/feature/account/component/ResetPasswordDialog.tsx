import { useForm } from "react-hook-form";
import { Modal, TextInput, Button, PasswordInput } from "@mantine/core";
import { useState } from "react";
import { encryptPassword } from "../../../utils/passwordEncryption";
import { toast } from "react-toastify/unstyled";
import { adminResetPasswordSubmit } from "../api";

interface Props {
    open: boolean;
    handleClose: () => void;
    t: any;
    userId: string; // Assuming you need the user ID to reset the password
}
const ResetPasswordDialog = (props: Props) => {
    const passwordForm = useForm({
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });
    const [loading, setLoading] = useState(false);
    const { register: registerPassword, handleSubmit: handleSubmitPassword } = passwordForm;
    const { open, handleClose, t, userId } = props;

    const onAdminResetPasswordSubmit = async (data: any) => {
        if (data.newPassword === "") {
            passwordForm.setError("newPassword", {
                type: "required",
                message: t("New password is required"),
            });
            return;
        }
        if (data.confirmPassword === "") {
            passwordForm.setError("confirmPassword", {
                type: "required",
                message: t("Confirm password is required"),
            });
            return;
        }
        //check password have 6 char
        if (data.newPassword.length < 6) {
            passwordForm.setError("newPassword", {
                type: "manual",
                message: t("Password must be at least 6 characters long"),
            });
            return;
        }
        if (data.newPassword !== data.confirmPassword) {
            passwordForm.setError("confirmPassword", {
                type: "required",
                message: t("Passwords do not match"),
            });
            return;
        }

        try {
            setLoading(true);

            const encryptedPassword = encryptPassword(data.newPassword);

            const requestData = {
                newPassword: encryptedPassword,
                userId: userId, // Use the userId from props
            };
            await adminResetPasswordSubmit(requestData);
            toast.success(t("Password reset successfully"));
        } catch (error) {
            console.error("Error resetting password:", error);
            toast.error(t("Failed to reset password"));
        } finally {
            setLoading(false);
            handleClose();
        }
    };
    return (
        <Modal opened={open} onClose={handleClose} title={t("Reset Password")} size="sm">
            <div className="min-w-[320px]">
                <form onSubmit={handleSubmitPassword(onAdminResetPasswordSubmit)}>
                    <div className="mb-4">
                        <PasswordInput
                            label={t("New Password")}
                            {...registerPassword("newPassword")}
                            error={passwordForm.formState.errors.newPassword?.message}
                            size="sm"
                            radius="sm"
                            color="aceBlue"
                        />
                    </div>
                    <div className="mb-4">
                        <PasswordInput
                            label={t("Confirm Password")}
                            {...registerPassword("confirmPassword")}
                            error={passwordForm.formState.errors.confirmPassword?.message}
                            size="sm"
                            radius="sm"
                            color="aceBlue"
                        />
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="default" onClick={handleClose} size="sm" radius="sm" disabled={loading}>
                            {t("Cancel")}
                        </Button>
                        <Button color="aceBlue" type="submit" disabled={loading} size="sm" radius="sm">
                            {loading ? t("Submitting...") : t("Submit")}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};
export default ResetPasswordDialog;
