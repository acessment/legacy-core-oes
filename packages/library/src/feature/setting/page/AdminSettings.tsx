import { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomTab from "../../../component/CustomTab";
import { CompanySettings } from "./CompanySettings";
import AccountForm from "../component/AccountForm";
import React from "react";
import { AuthContext } from "../../../provider/AuthContext";
import { getCompanySettings } from "../apis";
import AccountTab from "../component/AccountTab";

const Page = () => {
    const { t } = useTranslation();
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const { user } = React.useContext(AuthContext);
    const [companySettings, setCompanySettings] = useState<ICompanySettings>();
    const fetchData = async () => {
        const res = await getCompanySettings();
        setCompanySettings(res);
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const tabItems = [{ label: t("Account") }];
    return (
        <div className="bg-ace-background-gray p-4 w-full max-w-7xl mx-auto">
            <div className="flex justify-between w-full">
                <div>
                    <p className="text-4xl font-bold text-ace-text-primary-gray">{t("Settings")}</p>
                    <p className="mb-3 text-ace-text-secondary-gray text-xl font-medium">
                        {t("Change your account details")}
                    </p>
                </div>
            </div>
            <div className="mb-4">
                <CustomTab
                    tabs={tabItems}
                    defaultTabIndex={0}
                    onTabChange={(index) => {
                        setSelectedTabIndex(index);
                        setCurrentPage(index);
                        console.log(currentPage); // Reset to first page when tab changes
                    }}
                />
            </div>
            {currentPage == 0 ? <AccountTab user={user} t={t} /> : null}
            {currentPage == 1 ? <CompanySettings data={companySettings} /> : null}
        </div>
    );
};

export const AdminSettingsCorePage = () => {
    return <Page />;
};

export const AdminSettingsPage = () => {
    return <AdminSettingsCorePage />;
};
