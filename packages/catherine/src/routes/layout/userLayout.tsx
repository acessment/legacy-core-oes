import { useTranslation } from "react-i18next";
import { GeneralSidebarTabItem, GeneralPageWrapper } from "@acessment/core-oes";
import { IconHome, IconClipboardText, IconSettings } from "@tabler/icons-react";

export default function UserLayout() {
    const { t } = useTranslation();

    const sidebarTabList: GeneralSidebarTabItem[] = [
        {
            icon: <IconHome size={24} strokeWidth={1.5} />,
            label: t("sidebar.home", "Home"),
            url: "",
        },
        {
            icon: <IconClipboardText size={24} strokeWidth={1.5} />,
            label: t("sidebar.homework", "Homework"),
            url: "/homework",
            requiresActivation: true,
        },
        {
            icon: <IconSettings size={24} strokeWidth={1.5} />,
            label: t("sidebar.setting", "Setting"),
            url: "/settings",
            requiresActivation: true,
        },
    ];

    return (
        <GeneralPageWrapper
            sidebarTabList={sidebarTabList}
            logoUrl="/image/logo-material/acessment_production_white.png"
            companyName="CS Research"
            baseUrl="user"
            allowTrialUpgrade={false}
            loginLink={"/"}
            hasTranslation={false}
        />
    );
}
