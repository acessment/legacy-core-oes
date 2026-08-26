import React, { createContext, useContext, ReactNode, useState } from 'react';
import ACELogo from "@/assets/logo/acessment_production-web-adjusted.png";

export interface PanelContextValue {
    logoUrl: string;
    headerText: string;
    companyName?: string;
    logoSize?: number;
    downloadLogoSize?: number;
    
    // Update methods
    updateLogoUrl: (url: string) => void;
    updateHeaderText: (text: string) => void;
    updateLogoSize: (size: number) => void;
    updateDownloadLogoSize: (size: number) => void;
}

const PanelContext = createContext<PanelContextValue | undefined>(undefined);

export interface PanelContextProviderProps {
    children: ReactNode;
    logoUrl?: string;
    headerText?: string;
    companyName?: string;
    logoSize?: number;
    downloadLogoSize?: number;
}

export const PanelContextProvider: React.FC<PanelContextProviderProps> = ({
    children,
    logoUrl = ACELogo,
    headerText = "Quality exercises from www.acessment.ai",
    companyName = "ACEssment",
    logoSize = 18,
    downloadLogoSize = 18,
}) => {
    // Simple state (no localStorage logic here)
    const [currentLogoUrl, setCurrentLogoUrl] = useState(logoUrl);
    const [currentHeaderText, setCurrentHeaderText] = useState(headerText);
    const [currentLogoSize, setCurrentLogoSize] = useState(logoSize);
    const [currentDownloadLogoSize, setCurrentDownloadLogoSize] = useState(downloadLogoSize);

    const contextValue: PanelContextValue = {
        logoUrl: currentLogoUrl,
        headerText: currentHeaderText,
        companyName,
        logoSize: currentLogoSize,
        downloadLogoSize: currentDownloadLogoSize,
        
        // Update methods
        updateLogoUrl: setCurrentLogoUrl,
        updateHeaderText: setCurrentHeaderText,
        updateLogoSize: setCurrentLogoSize,
        updateDownloadLogoSize: setCurrentDownloadLogoSize,
    };

    return (
        <PanelContext.Provider value={contextValue}>
            {children}
        </PanelContext.Provider>
    );
};

export const usePanelContext = (): PanelContextValue => {
    const context = useContext(PanelContext);
    if (!context) {
        throw new Error('usePanelContext must be used within a PanelContextProvider');
    }
    return context;
};
