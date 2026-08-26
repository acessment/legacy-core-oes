import {
    ACCOUNT_TABLE_MENU_ITEMS,
    AccountSummaryCorePage,
    AccountSummaryPluginContext,
    TableDropDownPlugin,
    ADMIN_AVAILABLE_ROLES,
} from "@acessment/core-oes";
import { adminAuthMiddleware, getUsersByFiltersLoader } from "@acessment/core-oes/server";

export { getUsersByFiltersLoader as loader };

export const middleware = [adminAuthMiddleware];

export default function AdminAccounts() {
    return (
        <AccountSummaryCorePage
            availableRolesPlugin={ADMIN_AVAILABLE_ROLES}
            tableDropDownPlugin={
                <TableDropDownPlugin menuItems={ACCOUNT_TABLE_MENU_ITEMS} pluginContext={AccountSummaryPluginContext} />
            }
        />
    );
}
