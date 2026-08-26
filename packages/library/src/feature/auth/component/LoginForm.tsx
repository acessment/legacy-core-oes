import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, Group, Loader, Button, TextInput, PasswordInput } from "@mantine/core";
import { AuthContext } from "../../../provider/AuthContext";
import { getEmailDomain } from "@/config/config";

interface LoginFormData {
    username: string;
    password: string;
}

const LoginForm = () => {
    const { t } = useTranslation();
    const loginForm = useForm({
        defaultValues: {
            password: "",
            username: "",
        },
    });

    const [username, setUsername] = useState("");
    const [showForgotPasswordAlert, setShowForgotPasswordAlert] = useState(false);
    const { loginUser } = useContext(AuthContext);

    const { register, handleSubmit, formState, setValue, clearErrors } = loginForm;

    const onRegisterSubmit = async (data: LoginFormData) => {
        // Update data with state values
        data.username = username;
        // ...existing code...

        if (data.username === "") {
            loginForm.setError("username", {
                type: "required",
                message: t("Username is required"),
            });
            return;
        }
        if (data.password === "") {
            loginForm.setError("password", {
                type: "required",
                message: t("Password is required"),
            });
            return;
        }
        try {
            const email = data.username + "@" + getEmailDomain();

            await loginUser({
                email: email,
                password: data.password,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleUsernameChange = (value: string) => {
        setUsername(value);
        setValue("username", value);
        if (errors.username) {
            clearErrors("username");
        }
    };

    const handlePasswordChange = () => {
        if (errors.password) {
            clearErrors("password");
        }
    };

    const handleForgotPasswordClick = () => {
        setShowForgotPasswordAlert(true);
    };

    const { errors } = formState;
    return (
        <div className="w-full flex justify-center items-center">
            <form onSubmit={handleSubmit(onRegisterSubmit)} className="w-full">
                <TextInput
                    className="w-full"
                    label={t("Username")}
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    error={errors.username?.message as string}
                />

                <PasswordInput
                    className="mt-3 w-full"
                    label={t("Password")}
                    {...register("password", {
                        onChange: () => {
                            handlePasswordChange();
                        },
                    })}
                    error={errors.password?.message as string}
                />

                {showForgotPasswordAlert && (
                    <Group className="my-2">
                        <Alert
                            variant="light"
                            color="aceBlue"
                            title={t("Password Reset")}
                            withCloseButton
                            onClose={() => setShowForgotPasswordAlert(false)}
                        >
                            {t(
                                "Please contact your administrator for password reset assistance. They will be able to help you regain access to your account."
                            )}
                        </Alert>
                    </Group>
                )}

                <Group className="text-right mb-4">
                    <button
                        type="button"
                        onClick={handleForgotPasswordClick}
                        className="text-blue-600 hover:text-blue-800 underline text-sm cursor-pointer"
                    >
                        {t("Forgot Password?")}
                    </button>
                </Group>

                <Group className="my-5">
                    <Button
                        disabled={formState.isSubmitting}
                        type="submit"
                        color="aceBlue"
                        leftSection={formState.isSubmitting ? <Loader color="white" size={16} /> : undefined}
                        className="w-full"
                        loading={formState.isSubmitting}
                    >
                        {formState.isSubmitting ? "" : t("Sign in")}
                    </Button>
                </Group>
            </form>
        </div>
    );
};

export default LoginForm;
