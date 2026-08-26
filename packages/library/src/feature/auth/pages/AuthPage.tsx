/* eslint-disable react/react-in-jsx-scope */

import { useTranslation } from "react-i18next";
import LoginForm from "../component/LoginForm";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../../provider/AuthContext";
import { useNavigate } from "react-router";
import { RoleEnum } from "../../../enum/RoleEnum";

const Page = () => {
    const { t } = useTranslation();

    const { user, loading } = useContext(AuthContext); // Destructure loading

    const navigate = useNavigate();
    useEffect(() => {
        // Only navigate if loading is complete and user is authenticated
        if (!loading && user) {
            if (user.roles.includes(RoleEnum.ADMIN)) {
                navigate("/admin");
                return;
            }
            if (user.roles.includes(RoleEnum.TEACHER)) {
                navigate("/teacher");
                return;
            }
            navigate("/user");
        }
    }, [user, loading, navigate]); // Add loading and navigate to dependencies

    // If not loading and no user, then render the login page.
    return (
        <div className="flex justify-center items-center mx-4 h-[90vh]">
            <div className="w-full max-w-[500px] flex flex-col gap-4 mt-8">
                <p className="font-bold text-3xl text-ace-black">{t("Login to your account")}</p>
                <div className="w-full">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
};

export const AuthCorePage = () => {
    return <Page />;
};

export const AuthPage = () => {
    return <AuthCorePage />;
};
