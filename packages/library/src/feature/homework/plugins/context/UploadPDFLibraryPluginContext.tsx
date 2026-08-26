import React, { createContext, useContext, ReactNode } from "react";

interface UploadPDFLibraryContextValue {
    uploadPDFLibrary: boolean;
    setUploadPDFLibrary: (value: boolean) => void;
}

export const UploadPDFLibraryContext = createContext<UploadPDFLibraryContextValue | undefined>(undefined);

interface UploadPDFLibraryProviderProps {
    children: ReactNode;
    uploadPDFLibrary: boolean;
    setUploadPDFLibrary: (value: boolean) => void;
}

export const UploadPDFLibraryProvider: React.FC<UploadPDFLibraryProviderProps> = ({
    children,
    uploadPDFLibrary,
    setUploadPDFLibrary,
}) => {
    return (
        <UploadPDFLibraryContext.Provider
            value={{
                uploadPDFLibrary,
                setUploadPDFLibrary,
            }}
        >
            {children}
        </UploadPDFLibraryContext.Provider>
    );
};

export const useUploadPDFLibrary = (): UploadPDFLibraryContextValue => {
    const context = useContext(UploadPDFLibraryContext);
    if (!context) {
        throw new Error("useUploadPDFLibrary must be used within an UploadPDFLibraryProvider");
    }
    return context;
};
