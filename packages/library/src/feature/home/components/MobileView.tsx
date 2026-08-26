import { useState, useContext, useEffect } from "react";
import { Drawer } from "@mantine/core";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useLocation } from "react-router";
import { SidebarContent } from "./SidebarContent";
import { AuthContext } from "../../../provider/AuthContext";
import type { GeneralSidebarTabItem } from "./GeneralSidebar";

interface MobileViewProps {
    sidebarTabList: GeneralSidebarTabItem[];
    logoUrl: string;
    companyName: string;
    baseUrl: string;
    allowTrialUpgrade?: boolean;
    upgradeUrl?: string;
    loginLink?: string;
}

export const MobileView = ({
    sidebarTabList,
    logoUrl,
    companyName,
    baseUrl,
    allowTrialUpgrade = false,
    upgradeUrl,
    loginLink,
}: MobileViewProps) => {
    const [drawerOpened, setDrawerOpened] = useState(false);
    const location = useLocation();
    const { user } = useContext(AuthContext);

    // Auto-close drawer on route change
    useEffect(() => {
        setDrawerOpened(false);
    }, [location.pathname]);

    return (
        <>
            {/* Mobile Header */}
            <header className="flex md:hidden items-center justify-between h-12 md:px-4 bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img className="h-8 w-8 border border-ace-border-light-gray" src={logoUrl} alt="Logo" />
                    <span className="font-semibold text-lg text-ace-text-primary-gray">{companyName}</span>
                </div>

                <button
                    onClick={() => setDrawerOpened(true)}
                    className="p-2 hover:bg-ace-sidebar-hover-light-gray rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <IconMenu2 size={24} className="text-ace-sidebar-icon-gray" />
                </button>
            </header>

            {/* Mobile Drawer */}
            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                position="left"
                size="280px"
                classNames={{
                    content: "md:hidden",
                }}
                overlayProps={{ opacity: 0.5, blur: 2 }}
            >
                <div className="h-full p-4">
                    <SidebarContent
                        sidebarTabList={sidebarTabList}
                        logoUrl={logoUrl}
                        companyName={companyName}
                        baseUrl={baseUrl}
                        onItemClick={() => setDrawerOpened(false)}
                        allowTrialUpgrade={allowTrialUpgrade}
                        upgradeUrl={upgradeUrl}
                        loginLink={loginLink}
                    />
                </div>
            </Drawer>
        </>
    );
};
