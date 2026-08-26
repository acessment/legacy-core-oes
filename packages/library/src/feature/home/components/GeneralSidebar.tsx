import { SidebarContent } from "@/feature/home/components/SidebarContent";

export type GeneralSidebarTabItem = {
    icon: React.ReactNode;
    label: string;
    url: string;
    overrideUrl?: string; // Direct URL override (bypasses baseUrl)
    requiresActivation?: boolean; // Requires user activation status
};

interface GeneralSidebarProps {
    sidebarTabList: GeneralSidebarTabItem[];
    logoUrl: string; // Desktop logo
    mobileLogoUrl?: string; // Mobile logo (optional, defaults to logoUrl)
    companyName: string;
    baseUrl: string; // Dynamic base URL (e.g., "admin", "user")
    allowTrialUpgrade?: boolean; // Show trial upgrade button
    upgradeUrl?: string; // Custom upgrade URL (defaults to /{baseUrl}/payment-info)
    loginLink?: string; // URL to redirect for login when user is not authenticated
    hasTranslation?: boolean; // Enable translation support
}

export const GeneralSidebar = ({
    sidebarTabList,
    logoUrl,
    mobileLogoUrl,
    companyName,
    baseUrl,
    allowTrialUpgrade = false,
    upgradeUrl,
    loginLink,
    hasTranslation = true,
}: GeneralSidebarProps) => {
    return (
        <SidebarContent
            sidebarTabList={sidebarTabList}
            logoUrl={logoUrl}
            companyName={companyName}
            baseUrl={baseUrl}
            allowTrialUpgrade={allowTrialUpgrade}
            upgradeUrl={upgradeUrl}
            loginLink={loginLink}
            hasTranslation={hasTranslation}
        />
    );
};
