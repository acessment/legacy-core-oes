// ==========================================================================
// Setting Feature - Comprehensive Module Exports
// ==========================================================================

// APIs
export { 
    updateCompanySetting, 
    getCompanySettings, 
    resetCurrentUserPassword, 
    updateCurrentUser 
} from './apis';

// Components
export { default as AccountForm } from './component/AccountForm';
export { default as AccountTab } from './component/AccountTab';
export { default as CompanyForm } from './component/CompanyForm';
export { default as PasswordForm } from './component/PasswordForm';
export { default as UploadFileDialog } from './component/UploadFileDialog';

// Pages
export { 
    AdminSettingsCorePage, 
    AdminSettingsPage 
} from './page/AdminSettings';
export { 
    UserSettingsCorePage, 
    UserSettingsPage 
} from './page/UserSetting';


// Plugins
export { ContactUsBadgePlugin } from './plugin/ContactUsBadgePlugin';
export { ManageSubscriptionPlugin } from './plugin/ManageSubscriptionPlugin';