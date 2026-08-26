import { Outlet, useLocation } from "react-router";
import { GeneralSidebar, type GeneralSidebarTabItem } from "../components/GeneralSidebar";
import { AppShell, Burger, Group, Loader, ScrollArea, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AuthContext } from "../../../provider/AuthContext";
import SideBarAccountInfo from "@/component/sidebar/SideBarAccountInfo";
import { useContext, useEffect } from "react";

interface GeneralWrapperProps {
    sidebarTabList: GeneralSidebarTabItem[];
    logoUrl: string;
    mobileLogoUrl?: string;
    companyName: string;
    baseUrl?: string;
    allowTrialUpgrade?: boolean;
    upgradeUrl?: string;
    loginLink?: string;
    hasTranslation?: boolean;
}

/**
 * GeneralPageWrapper - Generic page layout component with sidebar
 * Pure layout component with no authentication logic
 * Use this directly in consumer repos for custom page layouts
 */
export const GeneralPageWrapper = ({
    sidebarTabList,
    logoUrl,
    mobileLogoUrl,
    companyName,
    baseUrl = "",
    allowTrialUpgrade = false,
    upgradeUrl,
    loginLink,
    hasTranslation = true,
}: GeneralWrapperProps) => {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const { logOut, user } = useContext(AuthContext);
    const location = useLocation();
    useEffect(() => {
        mobileOpened && toggleMobile();
    }, [location.pathname]);
    return (
        <AppShell
            padding="md"
            header={{ height: 50 }}
            navbar={{
                width: 225,
                breakpoint: "sm",
                collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
            }}
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                    <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p={0}>
                <GeneralSidebar
                    sidebarTabList={sidebarTabList}
                    logoUrl={logoUrl}
                    mobileLogoUrl={mobileLogoUrl}
                    companyName={companyName}
                    baseUrl={baseUrl}
                    allowTrialUpgrade={allowTrialUpgrade}
                    upgradeUrl={upgradeUrl}
                    loginLink={loginLink}
                    hasTranslation={hasTranslation}
                />
            </AppShell.Navbar>
            <AppShell.Main className="bg-ace-background-gray">
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
};

export type { GeneralWrapperProps };
