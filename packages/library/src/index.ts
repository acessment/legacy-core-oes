import "./index.css";

// API exports
export * from "./api/Api";
export * from "./api/customAxios"; // Re-enabled with function-based env vars
export * from "./api/httpClient"; // Re-enabled with function-based env vars

// Asset exports
export * from "./assets/image/google_mui_icons/index";

// Component exports - Language Switcher
export { LanguageSwitcher } from "./component/LanguageSwitcher";

// Component exports - Buttons
export { default as ACETag } from "./component/buttons/ACETag";

// Component exports - Custom Table
export { default as CustomTable } from "./component/customTable/CustomTable";
export { default as CustomTableFooter } from "./component/customTable/CustomTableFooter";
export { default as CustomTableNav } from "./component/customTable/CustomTableNav";
export { default as CustomTH } from "./component/customTable/CustomTH";
export * from "./component/customTable/types";

// Component exports - Dialog
export { ConfirmDialog } from "./component/dialog/confirm_dialog";

// Component exports - Icon
export { default as UserIcon } from "./component/icon/UserIcon";

// Component exports - Menu
export { DropdownMenuContainer } from "./component/menu/DropdownMenuContainer";
export { MenuItem, default as MenuItemDefault } from "./component/menu/MenuItem";

// Component exports - Sidebar
export { default as SideBarAccountInfo } from "./component/sidebar/SideBarAccountInfo";
export { default as SidebarTab } from "./component/sidebar/SidebarTab";

// Component exports - Main Components
export { AceCard } from "./component/AceCard";
export { AuthRoleChecker } from "./component/AuthRoleChecker";
export { default as BaseLayout } from "./component/BaseLayout";
export { CompanyLogo } from "./component/CompanyLogo";
export { default as CustomTab } from "./component/CustomTab";
export { Footer } from "./component/footer";
export { default as ScrollToTop } from "./component/ScrollToTop";

// Config exports
export * from "./config/config";
export * from "./config/firebase"; // Re-enabled with function-based env vars
//export { default as i18n } from "./config/translation_config";
export { initializeAppConfig } from "./config/initializeConfig";

// Enum exports
export * from "./enum/AuditEntityType.enum";
export * from "./enum/Category.enum";
export * from "./enum/RoleEnum";

// Feature exports - Account
export * from "./feature/account";
export { AccountSummaryPage } from "./feature/account/page/AccountSummaryPage";
export { SingleStudentAccountPage } from "./feature/account/page/SingleStudentAccountPage";
export { getSubscriptionColumn } from "./feature/account/plugins/SubscriptionColumnPlugin";
export { ADMIN_AVAILABLE_ROLES, USER_AVAILABLE_ROLES } from "./feature/account/plugins/AvailableRolesPlugin";
export { AdminAuditTrailPage } from "./feature/audit/page/AuditTrailPage";

// Feature exports - Audit
export * from "./feature/audit";

// Feature exports - Auth
export * from "./feature/auth";
export { AuthPage } from "./feature/auth/pages/AuthPage";

// Feature exports - Calendar
export { CalendarCorePage, CalendarPage } from "./feature/calendar/page/CalendarPage";
export * from "./feature/calendar/utils/exerciseSchedule";

// Feature exports - Generator
export * from "./feature/generator";

// Feature exports - Home
export * from "./feature/home";
export { AdminHomePage } from "./feature/home/pages/AdminHomePage";
export { GeneralPageWrapper } from "./feature/home/pages/GeneralWrapper";
export { UserHomePage } from "./feature/home/pages/UserHomePage";

// Feature exports - Homework
export * from "./feature/homework";
export { AdminHomeworkPage } from "./feature/homework/page/admin/AdminHomeworkPage";
export { AdminExercisePage, AdminExerciseCorePage } from "./feature/homework/page/admin/AdminExercisePage";
export {
    AdminSingleExercisePage,
    AdminSingleExerciseCorePage,
} from "./feature/homework/page/admin/AdminSingleExercisePage";
export { UserHomeworkPage } from "./feature/homework/page/user/UserHomeworkPage";
export * from "./feature/homework/plugins";

// Feature exports - Maintenance
export * from "./feature/maintenance";

// Feature exports - Marking
export * from "./feature/marking";
export { AdminMarkingPage } from "./feature/marking/page/admin/AdminMarkingPage";
export { AdminMarkingPanel } from "./feature/marking/page/admin/AdminMarkingPanel";

// Feature exports - Setting
export * from "./feature/setting";
export { AdminSettingsPage } from "./feature/setting/page/AdminSettings";
export { UserSettingsPage } from "./feature/setting/page/UserSetting";

export * from "./feature/payment";
export { PaymentInfoPage } from "./feature/payment/pages/PaymentInfoPage";

// Feature exports - Main Feature Pages
export { default as ErrorPage } from "./feature/errorPage";
export { default as NotFound } from "./feature/notFound";

// Hook exports
export * from "./hooks";

// Style exports
export * from "./style";

// Plugin exports
export { ExplanationV2Plugin } from "./plugins/ExplanationV2Plugin";
export { OCRPlugin, type OCRPluginProps } from "./plugins/OCRPlugin";
export { TableDropDownPlugin, type TableDropDownPluginProps } from "./plugins/TableDropDownPlugin";
export { TutorialVideoPlugin } from "./plugins/TutorialVideoPlugin";
export { TrialBannerPlugin } from "./plugins/TrialBannerPlugin";
export {
    TokenPlugin,
    TokenPluginProvider,
    useTokenPlugin,
    type TokenPluginContextValue,
    type TokenPluginProps,
} from "./plugins/TokenPlugin";

// Plugin Context exports
export { BaseGeneratorContext, type BaseGeneratorContextValue } from "./plugins/context/BaseGeneratorContext";

// Plugin Type exports
export type { ExercisePluginContextValue, OCRPluginContextValue } from "./plugins/types/PluginContextTypes";

// Provider exports
export * from "./provider";

// Reducer exports
export { default as DialogReducer } from "./reducer/DialogReducer";

// Theme exports
export * from "./theme/theme";

// Feature exports - PDF Library (client-safe only)
// Note: For server-side loaders and models, import from "@acessment/core-oes/server"
export { default as PDFLibraryPage } from "./feature/pdflibrary/page/PDFLibraryPage";
export { SinglePDFCorePage } from "./feature/pdflibrary/page/SinglePDFPage";
export { PDFCard } from "./feature/pdflibrary/component/PDFCard";
export { AudioPlugin } from "./feature/pdflibrary/plugin/AudioPlugin";
// Export only types for server data (types are erased at build time)
export type { PDFLibraryLoaderData, PDFLibraryCardData } from "./feature/pdflibrary/loader/pdflibraryLoader.server";
export type { SinglePDFLoaderData } from "./feature/pdflibrary/loader/singlePdfLoader.server";
export type { PDFLibraryDocument } from "./feature/pdflibrary/models/PDFLibrary";

// Feature exports - Payment (client-safe only)
export { PaywallGate } from "./feature/payment/component/PaywallGate";
export { PaywallModal } from "./feature/payment/component/PaywallModal";
export { withPaywall } from "./feature/payment/component/withPaywall";
export { PaywallProvider, usePaywallContext } from "./feature/payment/provider/PaywallContext";
export type { SubscriptionLoaderData } from "./feature/payment/loader/subscriptionLoader.server";
export type { SyncResult } from "./feature/payment/utils/syncStripeMetadata.server";

// Utility exports
export * from "./utils/options/category_options";
export * from "./utils/options/grade_options";
export * from "./utils/cookiesHandler";
export * from "./utils/countries";
export * from "./utils/dateFormator";
export * from "./utils/jsonEncryptionUtils";
export * from "./utils/JwtHandler";
export * from "./utils/language_options";
export * from "./utils/model";
export * from "./utils/passwordEncryption";
export * from "./utils/markingQueueUtils";
export * from "./utils/navigationHelpers";

// i18n resources export
export { default as resources } from "./locales";
