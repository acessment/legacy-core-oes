import { useTranslation } from "react-i18next";
import {
    GeneralSidebarTabItem,
    GeneralPageWrapper,
    useConfig,
} from "@acessment/core-oes";
import {
    IconHome,
    IconUsers,
    IconClipboardText,
    IconAtom,
    IconCheck,
    IconSettings,
    IconCalendar,
    IconClipboardList,
} from "@tabler/icons-react";

export default function AdminLayout() {
    const { t } = useTranslation();
    const appConfig = useConfig();
    
    const sidebarTabList: GeneralSidebarTabItem[] = [
        {
            icon: <IconHome size={24} strokeWidth={1.5} />,
            label: t("sidebar.home", "Home"),
            url: "",
        },
        {
            icon: <IconUsers size={24} strokeWidth={1.5} />,
            label: t("sidebar.accounts", "Accounts"),
            url: "/accounts",
        },
        {
            icon: <IconClipboardText size={24} strokeWidth={1.5} />,
            label: t("sidebar.exercises", "Exercises"),
            url: "/exercises",
        },
        {
            icon: <IconAtom size={24} strokeWidth={1.5} />,
            label: t("sidebar.generator", "Generator"),
            url: "/generator",
        },
        {
            icon: <IconCheck size={24} strokeWidth={1.5} />,
            label: t("sidebar.marking", "Marking"),
            url: "/marking",
        },
        {
            icon: <IconSettings size={24} strokeWidth={1.5} />,
            label: t("sidebar.setting", "Setting"),
            url: "/settings",
        },
        {
            icon: <IconClipboardList size={24} strokeWidth={1.5} />,
            label: t("sidebar.auditTrail", "Audit Trail"),
            url: "/audit-trail",
        }
    ];

    return (
        <GeneralPageWrapper
            sidebarTabList={sidebarTabList}
            logoUrl="/image/logo-material/acessment_production_white.png"
            companyName="CS Research"
            baseUrl="admin"
            allowTrialUpgrade={false}
            loginLink={"/"}
            hasTranslation={false}
        />
    );
}
