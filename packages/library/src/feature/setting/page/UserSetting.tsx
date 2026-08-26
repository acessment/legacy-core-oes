import { useTranslation } from "react-i18next";
import CustomTab from "../../../component/CustomTab";
import React from "react";
import { AuthContext } from "../../../provider/AuthContext";
import AccountTab from "../component/AccountTab";

interface UserSettingsPageProps {
    billingPlugin?: React.ReactNode;
    contactUsPlugin?: React.ReactNode;
    showGrade?: boolean;
}

const Page = ({ billingPlugin, contactUsPlugin, showGrade = true }: UserSettingsPageProps) => {
    const { t } = useTranslation();
    const tabItems = [{ label: t("Account") }];
    const { user } = React.useContext(AuthContext);

    return (
        <div className="bg-ace-background-gray sm:px-4 px-0 py-4 w-full max-w-7xl mx-auto">
            <div className="flex justify-between w-full">
                <div>
                    <p className="text-4xl font-bold text-ace-text-primary-gray">{t("Settings")}</p>
                    <p className="mb-3 text-ace-text-secondary-gray text-xl font-medium">
                        {t("Change your account details")}
                    </p>
                </div>
            </div>
            <div className="mb-4">
                <CustomTab tabs={tabItems} defaultTabIndex={0} />
            </div>
            <AccountTab user={user} t={t} showGrade={showGrade} contactUsPlugin={contactUsPlugin} />
            {billingPlugin}
        </div>
    );
};

export const UserSettingsCorePage = ({ billingPlugin, showGrade = true, contactUsPlugin }: UserSettingsPageProps) => {
    return <Page billingPlugin={billingPlugin} showGrade={showGrade} contactUsPlugin={contactUsPlugin} />;
};

export const UserSettingsPage = () => {
    return <UserSettingsCorePage />;
};
