import { useCallback, useContext, useEffect, useState } from "react";
import { usePanelContext } from "@/provider/PanelContext";

import {
    IconDownload,
    IconDotsVertical,
    IconTrash,
    IconCalendarEvent,
    IconDeviceFloppy,
    IconEdit,
} from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import { useImmerReducer } from "use-immer";
import { IExerciseContentJsonData, MainPanelWrapper, utilityReducer } from "@acessment/generator-panel";
import ACETag from "../../../../component/buttons/ACETag";
import AssignHomeworkDialog from "../../component/AssignHomeworkDialog";
import { ExerciseInfoDto, IExerciseResponse, IExerciseSummary } from "../../type";
import { deleteExercise, getExercise } from "../../api";
import { useUpdateExercise } from "../../hooks/useUpdateExercise";
import { formatDateByObject } from "../../../../utils/dateFormator";
import { toast } from "react-toastify/unstyled";
import { LoadingOverlay, Skeleton, Button, ActionIcon, Menu, Checkbox } from "@mantine/core";
import DownloadHomeworkPdfPlugin from "../../plugins/DownloadHomeworkPdfPlugin";
import AutoAssignPlugin from "../../plugins/AutoAssignPlugin";
import { AutoAssignProvider, useAutoAssign } from "../../plugins/context/AutoAssignPluginContext";
import { UploadPDFLibraryDialogComponent, UploadPDFLibraryPageComponent } from "../../plugins/upload-pdf-library";
import { UploadPDFLibraryProvider } from "../../plugins/context/UploadPDFLibraryPluginContext";
import { useTranslation } from "react-i18next";
import ExerciseInfoDialog from "../../component/ExerciseInfoDialog";
import { AuthContext } from "@/provider/AuthContext";
import { ExplanationV2Plugin } from "@/plugins/ExplanationV2Plugin";
import { BaseGeneratorContext } from "@/plugins/context/BaseGeneratorContext";
import { useConfig } from "@/provider/ConfigProvider";

interface AdminSingleExercisePageProps {
    explanationPlugin?: React.ReactNode;
    autoAssignPlugin?: React.ReactNode;
    enableUploadPDFLibraryPlugin?: boolean;
}

const Page = ({ explanationPlugin, autoAssignPlugin, enableUploadPDFLibraryPlugin }: AdminSingleExercisePageProps) => {
    const { logoUrl, headerText, logoSize } = usePanelContext();
    const { id } = useParams();
    const [originalJson, setOriginalJson] = useState<IExerciseContentJsonData | null>(null);
    const [jsonContent, jsonContentDispatch] = useImmerReducer(utilityReducer, {} as IExerciseContentJsonData);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [exerciseData, setExerciseData] = useState<IExerciseResponse>();
    const [uploadPDFLibrary, setUploadPDFLibrary] = useState<boolean>(false);

    const { t } = useTranslation();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { assignDate, initializeAutoAssign } = useAutoAssign();

    const fetchExerciseData = useCallback(
        async (exerciseId: string, isRefreshed: boolean = false) => {
            try {
                setLoading(true);
                const response = await getExercise(exerciseId); // Replace "currentUserId" with actual user ID
                const contentJson = JSON.parse(response.content);
                jsonContentDispatch({
                    type: "SET_EXERCISE_CONTENT",
                    payload: contentJson as IExerciseContentJsonData,
                });
                setExerciseData(response);
                setOriginalJson(contentJson as IExerciseContentJsonData);

                // Initialize auto-assign context with exercise data
                initializeAutoAssign(response.assignDate ? new Date(response.assignDate) : null);
                // Initialize uploadPDFLibrary state with exercise data
                setUploadPDFLibrary(response.uploadPDFLibrary || false);
            } catch (error) {
                console.error("Error fetching homework data:", error);
                toast.error("Failed to fetch exercise data. Please try again.");
                return null;
            } finally {
                setLoading(false);
                isRefreshed && toast.success("Exercise data refreshed successfully!");
            }
        },
        [jsonContentDispatch, initializeAutoAssign]
    );

    // Create a stable callback for useUpdateExercise
    const handleUpdateSuccess = useCallback(() => {
        if (id) {
            fetchExerciseData(id, true);
        }
    }, [id, fetchExerciseData]);

    const { updateExercise, isUpdating } = useUpdateExercise(handleUpdateSuccess);
    const handleAssignHomework = () => {
        console.log("Assign Homework clicked");
        setIsAssignDialogOpen(true);
    };

    const handleEdit = () => {
        if (!id) return;

        // toast error if auto-assign date with no grade selected
        if (assignDate && (!exerciseData?.grade || exerciseData.grade.length === 0)) {
            toast.error(t("Please select at least one grade when setting an auto-assign date."));
            return;
        }

        const requestData = {
            content: jsonContent,
            title: jsonContent?.title || "",
            category: exerciseData?.category || "",
            grade: exerciseData?.grade || [],
            welcomeExercise: exerciseData?.welcomeExercise || false,
            autoAssigned: !!assignDate,
            assignDate: assignDate ? assignDate.toISOString() : null,
            uploadPDFLibrary: uploadPDFLibrary,
        };

        updateExercise(id, requestData);
    };

    const handleDelete = async () => {
        console.log("Delete clicked");

        try {
            await deleteExercise(id || "");
            toast.success("Exercise deleted successfully!");
            setTimeout(() => {
                navigate("/admin/exercises"); // Redirect to the exercise list after deletion
            }, 2000); // Delay for 2 seconds before redirecting
        } catch (error) {
            console.error("Error deleting exercise:", error);
            toast.error("Failed to delete exercise. Please try again.");
            return;
        }

        // Add your delete logic here
    };
    useEffect(() => {
        // Fetch the exercise data when the component mounts
        if (id) {
            fetchExerciseData(id);
        }
    }, [id, fetchExerciseData]);

    const handleDownloadJSON = () => {
        try {
            // Create a JSON string with proper formatting
            const jsonString = JSON.stringify(jsonContent, null, 2);

            // Create a Blob with the JSON data
            const blob = new Blob([jsonString], { type: "application/json" });

            // Create a URL for the blob
            const url = URL.createObjectURL(blob);

            // Create a download link
            const link = document.createElement("a");
            link.href = url;
            link.download = `${jsonContent.title || "exercise"}.json`;

            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);

            toast.success("JSON file downloaded successfully!");
        } catch (error) {
            console.error("Error downloading JSON:", error);
            toast.error("Failed to download JSON file. Please try again.");
        }
    };

    const onSubmitExerciseInfo = (modalData: ExerciseInfoDto) => {
        setIsEditDialogOpen(false);
        if (!id) return;

        const requestData = {
            content: originalJson,
            title: originalJson?.title || "",
            category: modalData?.category || "",
            grade: modalData?.grades || [],
            welcomeExercise: modalData?.welcomeExercise || false,
            autoAssigned: !!assignDate,
            assignDate: assignDate ? assignDate.toISOString() : null,
            uploadPDFLibrary: uploadPDFLibrary,
        };

        updateExercise(id, requestData);
    };

    return (
        <UploadPDFLibraryProvider uploadPDFLibrary={uploadPDFLibrary} setUploadPDFLibrary={setUploadPDFLibrary}>
            <BaseGeneratorContext.Provider value={{ jsonContent: jsonContent, jsonDispatch: jsonContentDispatch }}>
                <div className="mt-14 px-4">
                    <div className="flex justify-between">
                        <h1 className="text-4xl font-bold text-ace-text-primary-gray">
                            {loading ? <Skeleton visible={true} width={200} height={30} /> : jsonContent.title}
                        </h1>
                        <div className="flex gap-2 items-center">
                            <Button
                                onClick={handleDownloadJSON}
                                leftSection={<IconDownload size={16} />}
                                variant="outline"
                                color="aceBlue"
                            >
                                JSON
                            </Button>
                            <DownloadHomeworkPdfPlugin
                                onLoadingChange={(loading) => setIsGeneratingPdf(loading)}
                                buttonProps={{
                                    size: "sm",
                                    variant: "outline",
                                    color: "aceBlue",
                                    disabled: isGeneratingPdf,
                                }}
                                buttonText="Exercise"
                                isSolution={false}
                            />
                            <DownloadHomeworkPdfPlugin
                                onLoadingChange={(loading) => setIsGeneratingPdf(loading)}
                                buttonProps={{
                                    size: "sm",
                                    variant: "filled",
                                    color: "aceBlue",
                                    disabled: isGeneratingPdf,
                                }}
                                buttonText="Solution"
                                isSolution={true}
                            />
                            <Menu shadow="md" width={200}>
                                <Menu.Target>
                                    <ActionIcon variant="subtle" color="gray" size="lg">
                                        <IconDotsVertical size={20} />
                                    </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Item
                                        leftSection={<IconCalendarEvent size={16} />}
                                        onClick={handleAssignHomework}
                                    >
                                        Assign Homework
                                    </Menu.Item>
                                    <Menu.Item leftSection={<IconDeviceFloppy size={16} />} onClick={handleEdit}>
                                        Save Edit
                                    </Menu.Item>
                                    <Menu.Item leftSection={<IconTrash size={16} />} onClick={handleDelete} color="red">
                                        Delete
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </div>
                    </div>
                    <p className="text-ace-text-secondary-gray">
                        Edited at:
                        {exerciseData?.updatedAt
                            ? ` ${formatDateByObject(new Date(exerciseData.updatedAt), "dd-mm-yyyy hh:mm")}`
                            : null}
                    </p>
                    {enableUploadPDFLibraryPlugin && <UploadPDFLibraryPageComponent />}

                    <div className="flex gap-1 mt-4 justify-start">
                        {(exerciseData?.grade?.length ?? 0) > 0 &&
                            exerciseData?.grade.map((grade, index) => {
                                return (
                                    <ACETag key={index} color="blue">
                                        {grade}
                                    </ACETag>
                                );
                            })}
                        <ACETag color="gray">{exerciseData?.category}</ACETag>
                        {exerciseData?.welcomeExercise && <ACETag color="green">{t("Welcome Exercise")}</ACETag>}

                        <ActionIcon onClick={() => setIsEditDialogOpen(true)} variant="subtle" color="dark" size="lg">
                            <IconEdit size={26} className="cursor-pointer" />
                        </ActionIcon>
                    </div>

                    {/* Auto-Assign Plugin on Page */}
                    {autoAssignPlugin && (
                        <div className="mt-6">
                            {assignDate && (
                                <div className="p-4 border border-gray-300 rounded-md bg-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="font-medium text-gray-600">{t("Auto-Assign Status")}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Checkbox checked={true} disabled />
                                            <span className="text-sm">{t("Auto-Assign to Subscribed Users")}</span>
                                        </div>
                                        <div className="ml-6">
                                            <p className="text-sm font-medium mb-1">{t("Assignment Date")}:</p>
                                            <p className="text-sm text-gray-600">
                                                {assignDate.toLocaleDateString("en-GB", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}{" "}
                                                at 00:00 HKT
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {exerciseData?.audioSrc && (
                        <div className="flex my-5 w-full justify-center">
                            <audio className="mt-6 w-[50vw]" controls>
                                <source src={exerciseData.audioSrc} type="audio/mp3"></source>
                                {t("Your browser does not support the audio element.")}
                            </audio>
                        </div>
                    )}
                    <div className="bg-white px-1 py-8 max-w-[220mm] my-4 mx-auto rounded-lg border border-gray-200">
                        <div className="mb-4 ml-4">{explanationPlugin}</div>
                        <div className="relative">
                            <LoadingOverlay visible={loading || isUpdating} loaderProps={{ color: "", type: "bars" }} />
                            <MainPanelWrapper
                                logoUrl={logoUrl}
                                logoSize={logoSize}
                                headerText={headerText}
                                jsonData={jsonContent}
                                dispatch={jsonContentDispatch}
                                isViewMarking={false}
                                isExerciseView={false}
                                showUtility={true}
                                showMarkingUtility={false}
                            ></MainPanelWrapper>
                        </div>
                    </div>

                    {/* Assign Homework Dialog */}
                    <AssignHomeworkDialog
                        open={isAssignDialogOpen}
                        handleClose={() => setIsAssignDialogOpen(false)}
                        currentExercise={[
                            {
                                id: id || "",
                                title: jsonContent.title || "",
                                category: exerciseData?.category || "",
                                grade: exerciseData?.grade || [], // Array of grades
                                createdAt: new Date().toISOString(), // Add current date as placeholder
                            } as IExerciseSummary,
                        ]}
                        userId={user?.id || "userid"}
                    />
                    {isEditDialogOpen && (
                        <ExerciseInfoDialog
                            opened={isEditDialogOpen}
                            onClose={() => setIsEditDialogOpen(false)}
                            data={{
                                title: jsonContent.title || "",
                                category: exerciseData?.category || "",
                                grades: exerciseData?.grade || [],
                                welcomeExercise: exerciseData?.welcomeExercise || false,
                            }}
                            onSubmit={onSubmitExerciseInfo}
                            t={t}
                            autoAssignPlugin={autoAssignPlugin}
                            enableUploadPDFLibraryPlugin={enableUploadPDFLibraryPlugin}
                        />
                    )}
                </div>
            </BaseGeneratorContext.Provider>
        </UploadPDFLibraryProvider>
    );
};

export const AdminSingleExerciseCorePage = ({
    explanationPlugin,
    autoAssignPlugin,
    enableUploadPDFLibraryPlugin,
}: AdminSingleExercisePageProps) => {
    return (
        <AutoAssignProvider>
            <Page
                explanationPlugin={explanationPlugin}
                autoAssignPlugin={autoAssignPlugin}
                enableUploadPDFLibraryPlugin={enableUploadPDFLibraryPlugin}
            />
        </AutoAssignProvider>
    );
};

export function AdminSingleExercisePage() {
    return (
        <AdminSingleExerciseCorePage
            explanationPlugin={<ExplanationV2Plugin />}
            autoAssignPlugin={<AutoAssignPlugin />}
            enableUploadPDFLibraryPlugin={true}
        />
    );
}
