/* eslint-disable react/react-in-jsx-scope */
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PasswordInput, Button } from "@mantine/core";
import { ConfirmDialog } from "../../../component/dialog/confirm_dialog";
import { encryptPassword } from "../../../utils/passwordEncryption";
import { resetCurrentUserPassword } from "../apis";
import { toast } from "react-toastify/unstyled";
import { Text } from "@mantine/core";

interface IPasswordForm {
    onChangePasswordClick: () => void;
}

interface IPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

const PasswordForm = (props: IPasswordForm) => {
    const { onChangePasswordClick } = props;
    const passwordForm = useForm({
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });
    const [confirmPassword, setConfirmPassword] = useState(false);
    const { register: registerPassword, handleSubmit: handleSubmitPassword, watch } = passwordForm;
    const { t } = useTranslation();

    const onPasswordSubmit = (data: IPasswordFormData) => {
        if (data.newPassword === "") {
            passwordForm.setError("newPassword", {
                type: "required",
                message: t("newPassword is required"),
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
                message: t("Password does not match"),
            });
            return;
        }

        setConfirmPassword(true); // Show confirmation dialog
    };

    const onSubmitResetPassword = async () => {
        // Handle the password reset logic here
        const encryptedPassword = encryptPassword(watch("newPassword"));
        try {
            await resetCurrentUserPassword(encryptedPassword);
            toast.success(t("Password updated successfully"));
            setConfirmPassword(false); // Close confirmation dialog
            onChangePasswordClick(); // Call the callback to close the form
        } catch (error) {
            console.error("Error resetting password:", error);
            toast.error(t("Failed to update password"));
        }
    };

    return (
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)}>
            <div className="flex gap-5">
                <Text size="lg" fw={600} mb="xs">Change Password</Text>
            </div>

            <div>
                <PasswordInput
                    label={t("New Password")}
                    {...registerPassword("newPassword")}
                    error={passwordForm.formState.errors.newPassword?.message as string}
                />
            </div>
            <div>
                <PasswordInput
                    label={t("Confirm Password")}
                    {...registerPassword("confirmPassword")}
                    error={passwordForm.formState.errors.confirmPassword?.message as string}
                />
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "26px" }}>
                <Button variant="outline" onClick={onChangePasswordClick}>
                    {t("Cancel")}
                </Button>
                <Button type="submit" color="aceBlue">
                    {t("Save")}
                </Button>
            </div>

            {confirmPassword && (
                <ConfirmDialog
                    open={confirmPassword}
                    handleClose={() => setConfirmPassword(false)}
                    title={t("Are you sure to update your password?")}
                    onSubmit={onSubmitResetPassword}
                />
            )}
        </form>
    );
};
export default PasswordForm;
