import { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../../provider/AuthContext";
import SidebarTab from "../../../component/sidebar/SidebarTab";
import SideBarAccountInfo from "../../../component/sidebar/SideBarAccountInfo";
import { IconChevronRight, IconSparkles, IconLogin, IconLogout } from "@tabler/icons-react";
import { useCheckTrial } from "@/hooks/useCheckTrial";
import type { GeneralSidebarTabItem } from "./GeneralSidebar";
import { AntiPaywallGate, withPaywall } from "@/feature/payment";
import { AppShell, ScrollArea } from "@mantine/core";
import { LanguageSwitcher } from "@/component/LanguageSwitcher";

interface SidebarContentProps {
    sidebarTabList: GeneralSidebarTabItem[];
    logoUrl: string;
    companyName: string;
    baseUrl: string;
    onToggleCollapse?: () => void;
    onItemClick?: () => void;
    allowTrialUpgrade?: boolean;
    upgradeUrl?: string;
    loginLink?: string;
    hasTranslation?: boolean;
}

const PaywallUpgradeButton = withPaywall(SidebarTab) as any;

export const SidebarContent = ({
    sidebarTabList,
    logoUrl,
    companyName,
    baseUrl = "",
    onToggleCollapse,
    onItemClick,
    allowTrialUpgrade = false,
    upgradeUrl,
    loginLink,
    hasTranslation = true,
}: SidebarContentProps) => {
    const { t } = useTranslation();
    const { logOut, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isTrial = useCheckTrial();

    const handleNavigation = (tab: GeneralSidebarTabItem) => {
        console.log("Navigating to:", tab.url);
        if (tab.url === "logout") {
            console.log("Logging out");
            logOut()
                ?.then(() => {
                    window.location.href = "/";
                })
                .catch(() => {
                    window.location.href = "/";
                });
        } else if (tab.overrideUrl) {
            navigate(tab.overrideUrl);
        } else if (tab.url === "") {
            navigate(`/${baseUrl}`);
        } else {
            navigate(`/${baseUrl}${tab.url}`);
        }

        // Call onItemClick callback (for mobile drawer close)
        onItemClick?.();
    };

    return (
        <>
            <AppShell.Section p="md">
                <img
                    className="border border-ace-border-light-gray max-w-36 w-full max-h-36 mx-auto"
                    src={logoUrl}
                ></img>
                <div className="mt-4 flex justify-center mx-auto">
                    {hasTranslation && <LanguageSwitcher />}
                </div>
            </AppShell.Section>
            <AppShell.Section grow component={ScrollArea}>
                <div className="flex flex-col justify-between h-full px-4">
                    <div className="flex flex-col gap-4 w-full">
                        {/* Navigation Items */}
                        <div className="flex flex-col gap-1">
                            {sidebarTabList.map((tab, index) => {
                                // Skip activation-required tabs if user is not activated
                                if (tab.requiresActivation && user?.status !== "ACTIVATED") {
                                    return null;
                                }

                                return (
                                    <SidebarTab
                                        key={index}
                                        onClick={() => handleNavigation(tab)}
                                        icon={tab.icon}
                                        label={tab.label}
                                        selected={
                                            tab.url === "logout"
                                                ? false
                                                : tab.overrideUrl
                                                ? location.pathname === tab.overrideUrl
                                                : tab.url === ""
                                                ? location.pathname === `/${baseUrl}`
                                                : location.pathname.startsWith(`/${baseUrl}/${tab.url}`)
                                        }
                                    />
                                );
                            })}
                            {loginLink && (
                                <div className="mb-2">
                                    {user ? (
                                        <SidebarTab
                                            icon={<IconLogout size={24} strokeWidth={1.5} />}
                                            label={t("sidebar.logOut", "Log Out")}
                                            onClick={() => {
                                                console.log("Logging out");
                                                logOut()
                                                    ?.then(() => {
                                                        window.location.href = "/";
                                                    })
                                                    .catch(() => {
                                                        window.location.href = "/";
                                                    });
                                                onItemClick?.();
                                            }}
                                            selected={false}
                                        />
                                    ) : (
                                        <SidebarTab
                                            icon={<IconLogin size={24} strokeWidth={1.5} />}
                                            label={t("sidebar.logIn", "Log In")}
                                            onClick={() => {
                                                window.location.href = loginLink;
                                                onItemClick?.();
                                            }}
                                            selected={false}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AppShell.Section>
            <AppShell.Section p="md">
                <div>
                    {allowTrialUpgrade && (
                        <AntiPaywallGate productIndex={[0]}>
                            <div className="mb-2">
                                <PaywallUpgradeButton
                                    icon={
                                        <span className="rounded-full p-2 bg-gradient-to-r from-aceBlue to-indigo-500 inline-flex items-center justify-center">
                                            <IconSparkles size={20} strokeWidth={2} color="#ffffff" />
                                        </span>
                                    }
                                    label={t("sidebar.upgrade")}
                                    selected={false}
                                />
                            </div>
                        </AntiPaywallGate>
                    )}
                </div>
                <SideBarAccountInfo username={user?.username} description={companyName || ""}></SideBarAccountInfo>
            </AppShell.Section>
        </>
    );
};
