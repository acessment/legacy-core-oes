import {
    ACCOUNT_TABLE_MENU_ITEMS,
    AccountSummaryCorePage,
    AccountSummaryPluginContext,
    TableDropDownPlugin,
    ADMIN_AVAILABLE_ROLES,
} from "@acessment/core-oes";
import { teacherAuthMiddleware, getUsersByFiltersLoader } from "@acessment/core-oes/server";

export { getUsersByFiltersLoader as loader };

export const middleware = [teacherAuthMiddleware];

export default function TeacherAccounts() {
    return (
        <AccountSummaryCorePage
            tableDropDownPlugin={
                <TableDropDownPlugin menuItems={ACCOUNT_TABLE_MENU_ITEMS} pluginContext={AccountSummaryPluginContext} />
            }
            availableRolesPlugin={ADMIN_AVAILABLE_ROLES}
        />
    );
}
