import { actionArgs } from "../component/menu/SingleAccountTableAction";
import ActivateUserDialog from "@/feature/account/component/ActivateUserDialog";
import AssignGroupDialog from "@/feature/account/component/AssignGroupDialog";
import ClassGroupDialog from "@/feature/account/component/ClassGroupDIalog";
import { DeleteStudentsDialog } from "@/feature/account/component/DeleteStudentsDialog";
import SchoolDialog from "@/feature/account/component/SchoolDialog";
import { AccountSummaryPluginContext } from "@/feature/account/plugins/context/AccountTablePluginContext";
import { IconUserCheck, IconUserX, IconUsersPlus, IconTrash, IconSchool, IconUsersGroup } from "@tabler/icons-react";


export interface TableMenuItem {
    label: string;
    icon: React.ComponentType<{ size?: number | string; [key: string]: unknown }>;
    onClick: (actionArgs: actionArgs) => any;
    dialog?: React.ReactElement;
}


export const ACCOUNT_TABLE_MENU_ITEMS: TableMenuItem[] = [
    {
        label: "Activate Selected",
        icon: IconUserCheck,
        onClick: () => {},
        dialog: <ActivateUserDialog title={"Activate Students"} isDeactivate={false} />,
    },
    {
        label: "Deactivate Selected",
        icon: IconUserX,
        onClick: () => {},
        dialog: <ActivateUserDialog title={"Deactivate Students"} isDeactivate={true} />,
    },
    {
        label: "Assign Group",
        icon: IconUsersPlus,
        onClick: () => {},
        dialog: <AssignGroupDialog />,
    },
    {
        label: "Delete Students",
        icon: IconTrash,
        onClick: () => {},
        dialog: <DeleteStudentsDialog />,
    },
    {
        label: "Create School",
        icon: IconSchool,
        onClick: () => {},
        dialog: <SchoolDialog pluginContext={AccountSummaryPluginContext} />,
    },
    {
        label: "Create Group",
        icon: IconUsersGroup,
        onClick: () => {},
        dialog: <ClassGroupDialog />,
    },
];