import { IAccountSummary, IAccountSummaryParams } from "@/feature/account/type";
import { HomeworkSummaryView } from "@/feature/homework/type";
import { ICurrentUser } from "@/provider/types";
import { createContext } from "react";


export type SingleAccountPluginContextValue = {
    selectedItems?: HomeworkSummaryView[];
    dialogDispatch: React.Dispatch<{ type: string; [key: string]: unknown }>;
};


export const SingleAccountPluginContext = createContext<SingleAccountPluginContextValue | undefined>(undefined);


export type AccountSummaryPluginContextValue = {
    selectedItems: IAccountSummary[];
    dialogDispatch: React.Dispatch<{ type: string; [key: string]: unknown }>;
    fetchData: (params: IAccountSummaryParams) => Promise<void>;
    user: ICurrentUser | null;
    searchQuery: IAccountSummaryParams;
    dialogState: Record<string, boolean>;
};

export const AccountSummaryPluginContext = createContext<AccountSummaryPluginContextValue | undefined>(undefined);