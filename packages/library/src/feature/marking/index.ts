// ==========================================================================
// Marking Feature - Comprehensive Module Exports
// ==========================================================================

// APIs
export { 
    getMarkingDetail, 
    updateMarking 
} from './api';

// Components
export { default as MarkingQueueCard } from './component/MarkingQueueCard';
export { default as MarkingQueueSideBar } from './component/MarkingQueueSideBar';

// Pages
export { 
    AdminMarkingCorePanel, 
    AdminMarkingPanel 
} from './page/admin/AdminMarkingPanel';
export { 
    AdminMarkingCorePage, 
    AdminMarkingPage 
} from './page/admin/AdminMarkingPage';

// Plugins
export { 
    AdminMarkingPluginContext,
    type AdminMarkingPluginContextValue 
} from './plugins/context/AdminMarkingPluginContext';

// Types
export type { 
    IMarkingDetailResponse, 
    markingRequest 
} from './type';

// Utils
export { 
    sanitizeMarkingResults, 
    verifyMarkingResults 
} from './utils/verifyMarkingResults';