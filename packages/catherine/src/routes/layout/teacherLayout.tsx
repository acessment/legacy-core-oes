import { useTranslation } from "react-i18next";
import { GeneralSidebarTabItem, GeneralPageWrapper, useConfig } from "@acessment/core-oes";
import { IconUsers, IconSettings } from "@tabler/icons-react";

export default function TeacherLayout() {
    const { t } = useTranslation();
    const appConfig = useConfig();

    const sidebarTabList: GeneralSidebarTabItem[] = [
        {
            icon: <IconUsers size={24} strokeWidth={1.5} />,
            label: t("sidebar.accounts", "Accounts"),
            url: "",
        },
        {
            icon: <IconSettings size={24} strokeWidth={1.5} />,
            label: t("sidebar.setting", "Setting"),
            url: "/settings",
        },
    ];

    return (
        <GeneralPageWrapper
            sidebarTabList={sidebarTabList}
            logoUrl="/image/logo-material/acessment_production_white.png"
            companyName="CS Research"
            baseUrl="teacher"
            allowTrialUpgrade={false}
            loginLink={"/"}
        />
    );
}
