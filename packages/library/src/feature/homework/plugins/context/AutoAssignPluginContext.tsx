import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface AutoAssignContextValue {
    assignDate: Date | null;
    setAssignDate: (value: Date | null) => void;
    resetAutoAssign: () => void;
    initializeAutoAssign: (assignDate?: Date | null) => void;
}

const AutoAssignContext = createContext<AutoAssignContextValue | undefined>(undefined);

interface AutoAssignProviderProps {
    children: ReactNode;
    initialAssignDate?: Date | null;
}

export const AutoAssignProvider: React.FC<AutoAssignProviderProps> = ({ children, initialAssignDate = null }) => {
    const [assignDate, setAssignDate] = useState<Date | null>(initialAssignDate);

    const resetAutoAssign = useCallback(() => {
        setAssignDate(null);
    }, []);

    const initializeAutoAssign = useCallback((newAssignDate?: Date | null) => {
        setAssignDate(newAssignDate ?? null);
    }, []);

    return (
        <AutoAssignContext.Provider
            value={{
                assignDate,
                setAssignDate,
                resetAutoAssign,
                initializeAutoAssign,
            }}
        >
            {children}
        </AutoAssignContext.Provider>
    );
};

export const useAutoAssign = (): AutoAssignContextValue => {
    const context = useContext(AutoAssignContext);
    if (!context) {
        throw new Error("useAutoAssign must be used within an AutoAssignProvider");
    }
    return context;
};
