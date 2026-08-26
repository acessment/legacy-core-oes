// API exports
export * from "./api";

// Action exports
export type { UpdateExerciseInput } from "./action/updateExercise.server";

// Hook exports
export { useUpdateExercise } from "./hooks/useUpdateExercise";

// Component exports
export { default as AssignHomeworkDialog } from "./component/AssignHomeworkDialog";
export { DeleteExerciseDialog } from "./component/DeleteExerciseDialog";
export { default as ExerciseInfoDialog } from "./component/ExerciseInfoDialog";
export { default as FilterExercisesDialog } from "./component/FilterExercisesDialog";
export { default as FilterHomeworkDialogHW } from "./component/FilterHomeworkDialog";
export { default as FilterUserHomeworkDialog } from "./component/FilterUserHomeworkDialog";
export { UnassignHomeworkDialog } from "./component/UnassignHomeworkDialog";
export { UploadImageMarkingDialog } from "./component/UploadImageMarkingDialog";

// Page exports - Admin
export { AdminExerciseCorePage } from "./page/admin/AdminExercisePage";
export { AdminHomeworkCorePage } from "./page/admin/AdminHomeworkPage";
export { AdminSingleExerciseCorePage } from "./page/admin/AdminSingleExercisePage";

// Page exports - User
export { SingleHomeworkCorePage } from "./page/user/SingleHomeworkPage";
export { UserHomeworkPage, UserHomeworkCorePage } from "./page/user/UserHomeworkPage";

// Plugin/Context exports
export { DownloadHomeworkPdfPlugin } from "./plugins/DownloadHomeworkPdfPlugin";
export { default as AutoAssignPlugin } from "./plugins/AutoAssignPlugin";
export { AutoAssignProvider, useAutoAssign } from "./plugins/context/AutoAssignPluginContext";
export { getAssignDateColumn } from "./plugins/AssignDateColumnPlugin";
export { ExercisePluginContext } from "./plugins/context/ExerciseTablePluginContext";
export type { ExercisePluginContextValue, BasePluginContextValue } from "./plugins/context/ExerciseTablePluginContext";
export { HomeworkPluginContext } from "./plugins/context/HomeworkTablePluginContext";
export type { HomeworkPluginContextValue } from "./plugins/context/HomeworkTablePluginContext";
export { SingleHomeworkPluginContext } from "./plugins/context/SingleHomeworkPluginContext";
export type { SingleHomeworkPluginContextValue } from "./plugins/context/SingleHomeworkPluginContext";

// Type exports
export * from "./type";
export { EXERCISE_TABLE_MENU_ITEMS } from "./type/ExerciseTableMenuItem";
export { HOMEWORK_TABLE_MENU_ITEMS_ADD_ALL } from "./type/HomeworkTableMenuItem";

// Utils/Column exports
export { default as ExercisePageMenuItem } from "./utils/ExercisePageMenuItem";
export { default as ExerciseSummaryColumn } from "./utils/ExerciseSummaryColumn";
export { default as HomeworkPageMenuItem } from "./utils/HomeworkPageMenuItem";
export { default as HomeworkSummaryColumn } from "./utils/HomeworkSummaryColumn";
export { default as HomeworkUserColumn } from "./utils/HomeworkUserColumn";
