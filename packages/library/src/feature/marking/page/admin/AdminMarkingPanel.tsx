import {
    MainPanelWrapper,
    utilityReducer,
    IExerciseContentJsonData,
    makeMarkingJson,
    getScore,
    totalQuestionCount,
} from "@acessment/generator-panel";
import { useImmerReducer } from "use-immer";
import { usePanelContext } from "@/provider/PanelContext";
import {
    IconSchool,
    IconUsers,
    IconBadge,
    IconUser,
    IconList,
    IconAlertOctagon,
    IconDeviceFloppy,
} from "@tabler/icons-react";
import ACETag from "../../../../component/buttons/ACETag";
import { useEffect, useState, useContext } from "react";
import MarkingQueueSideBar from "../../component/MarkingQueueSideBar";
import { IMarkingDetailResponse, markingRequest } from "../../type";
import { getMarkingDetail, updateMarking } from "../../api";
import { useParams } from "react-router";
import { toast } from "react-toastify/unstyled";
import { generatePdf } from "../../../generator/api";
import { jsonDecrypt } from "../../../../utils/jsonEncryptionUtils";
import { Alert, Button } from "@mantine/core";
import { getHomework, submitHomework } from "../../../homework/api";
import { ISubmitHomeworkRequest } from "../../../homework/type";
import { ExplanationV2Plugin } from "@/plugins/ExplanationV2Plugin";
import { BaseGeneratorContext } from "@/plugins/context/BaseGeneratorContext";
import { AdminMarkingPluginContext } from "@/feature/marking/plugins/context/AdminMarkingPluginContext";
import { OCRPlugin } from "@/plugins/OCRPlugin";
import DownloadHomeworkPdfPlugin from "@/feature/homework/plugins/DownloadHomeworkPdfPlugin";
import AuthRoleChecker from "@/component/AuthRoleChecker";
import { RoleEnum } from "@/enum/RoleEnum";
import { AuthContext } from "@/provider/AuthContext";

interface AdminMarkingPanelProps {
    explanationPlugin?: React.ReactNode;
    ocrPlugin?: React.ReactNode;
}

const Page = ({ explanationPlugin, ocrPlugin }: AdminMarkingPanelProps) => {
    const { logoUrl, headerText, logoSize } = usePanelContext();
    const { user } = useContext(AuthContext);
    const [jsonContent, jsonContentDispatch] = useImmerReducer(utilityReducer, {} as IExerciseContentJsonData);

    const params = useParams<{ id: string }>();

    const isTeacher = Boolean(user?.roles?.includes(RoleEnum.TEACHER) && !user?.roles?.includes(RoleEnum.ADMIN));

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const [data, setData] = useState<IMarkingDetailResponse>();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isExpired, setIsExpired] = useState(false);
    const [panelMode, setPanelMode] = useState({
        isViewMarking: false,
        isExerciseView: true,
        showMarkingUtility: false,
        showUtility: false,
    });

    const fetchMarkingData = async (homeworkId: string) => {
        try {
            const response = await getMarkingDetail(homeworkId);
            const contentJson = JSON.parse(response.markingJson);
            jsonContentDispatch({
                type: "SET_EXERCISE_CONTENT",
                payload: contentJson as IExerciseContentJsonData,
            });
            setData(response);
        } catch (error) {
            console.error("Error fetching marking data:", error);

            return null;
        }
    };

    const fetchData = async (homeworkId: string) => {
        const response = await getHomework(homeworkId);
        const contentJson = JSON.parse(response.contentJson);
        const status = response.submissionStatus.toLowerCase();
        setData(response);
        if (status === "pending") {
            setIsPending(true);
            setPanelMode({
                isViewMarking: isTeacher,
                isExerciseView: true,
                showMarkingUtility: false,
                showUtility: false,
            });
            jsonContentDispatch({ type: "SET_EXERCISE_CONTENT", payload: contentJson as IExerciseContentJsonData });
        } else if (status === "submitted" || status === "marked") {
            fetchMarkingData(homeworkId);
            // For teachers, use view marking mode only
            setPanelMode({
                isViewMarking: isTeacher,
                isExerciseView: false,
                showMarkingUtility: !isTeacher,
                showUtility: !isTeacher,
            });
        } else if (status === "expired") {
            setIsExpired(true);
            setPanelMode({
                isViewMarking: false,
                isExerciseView: true,
                showMarkingUtility: false,
                showUtility: false,
            });
            jsonContentDispatch({ type: "SET_EXERCISE_CONTENT", payload: contentJson as IExerciseContentJsonData });
        }
    };

    const onSubmittingHomework = async () => {
        const markingJson = makeMarkingJson(jsonContent);
        const score = markingJson.score || 0;
        const maxScore = markingJson.maxScore || 100;
        console.log("Marking JSON:", markingJson);
        // Handle the submission logic here
        const request: ISubmitHomeworkRequest = {
            homeworkId: params.id || "",
            submittedJson: JSON.stringify(jsonContent),
            markingJson: JSON.stringify(markingJson),
            score: typeof score === "string" ? parseFloat(score) || 0 : score,
            maxScore: typeof maxScore === "string" ? parseFloat(maxScore) || 100 : maxScore,
        };
        try {
            // Call the API to submit the homework
            await submitHomework(request);
            toast.success("Homework submitted successfully!");
            // refresh page
            window.location.reload();
        } catch (error) {
            console.error("Error submitting homework:", error);
        }
    };

    const onSaveMarkingClick = async () => {
        console.log("Saving marking data:", jsonContent);
        const score = getScore(jsonContent);
        const maxScore = totalQuestionCount(jsonContent);
        jsonContentDispatch({
            type: "SET_EXERCISE_CONTENT",
            payload: {
                ...jsonContent,
                score: score ?? 0,
                maxScore: maxScore ?? 0,
            },
        });
        const markingJson = JSON.stringify(jsonContent);
        const requestData: markingRequest = {
            markingJson,
            score: score ?? 0,
            maxScore: maxScore ?? 0,
        };

        try {
            await updateMarking(params.id!, requestData);
            toast.success("Marking saved successfully!");
            fetchMarkingData(params.id!);

            // Remove the corresponding item from MarkingQueue in localStorage
            try {
                const storedQueue = localStorage.getItem("MarkingQueue");
                if (storedQueue) {
                    const markingQueue = JSON.parse(storedQueue);

                    // Filter out the item with matching id
                    const updatedQueue = markingQueue.filter((item: { id: string }) => item.id !== params.id);

                    // Update localStorage with the filtered array
                    localStorage.setItem("MarkingQueue", JSON.stringify(updatedQueue));

                    console.log(`Removed homework ${params.id} from marking queue after saving`);
                }
            } catch (error) {
                console.error("Error removing item from MarkingQueue:", error);
            }
        } catch (error) {
            console.error("Error saving marking data:", error);
            toast.error("Failed to save marking data.");
        }
    };
    const onDownloadMarkingClick = async () => {
        console.log("Downloading marking PDF:", jsonContent);

        try {
            setIsGeneratingPdf(true); // Show loading animation

            const res = await generatePdf({
                exercise_json: "[" + JSON.stringify(jsonContent) + "]",
                is_solution: false,
                show_index: true,
            });

            const jsonData = jsonDecrypt(res);
            // download the PDF file
            downloadPdf(jsonData.payload, "exercise.pdf"); // Use the new downloadPdf function
        } catch (error) {
            toast.error("Failed to generate PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false); // Hide loading animation
        }

        // Here you would typically trigger a download of the marking PDF
    };

    const onUpdateScoreClick = () => {
        const score = getScore(jsonContent);
        const maxScore = totalQuestionCount(jsonContent);

        jsonContentDispatch({
            type: "SET_EXERCISE_CONTENT",
            payload: {
                ...jsonContent,
                score: score ?? 0,
                maxScore: maxScore ?? 0,
            },
        });
    };

    const downloadPdf = (base64Data: string, fileName: string) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = base64Data;
        downloadLink.download = fileName;
        downloadLink.click();
    };

    useEffect(() => {
        // Fetch the marking data when the component mounts
        if (params.id) {
            fetchData(params.id);
        }
    }, [params, jsonContentDispatch, isTeacher]);

    return (
        <AdminMarkingPluginContext.Provider value={{ jsonContent: jsonContent, jsonDispatch: jsonContentDispatch }}>
            <BaseGeneratorContext.Provider value={{ jsonContent: jsonContent, jsonDispatch: jsonContentDispatch }}>
                <div className="px-4 bg-ace-background-gray my-12">
                    {/* Fixed Button on Right Side */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-ace-blue text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                        title="Show Marking Queue"
                    >
                        <IconList size={24} />
                    </button>

                    {/* Sidebar */}
                    <MarkingQueueSideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                    <div className="">
                        <div className="flex flex-col mb-6">
                            <div className="flex gap-4 justify-between items-start">
                                <h1 className="text-4xl font-bold text-ace-text-primary-gray">{data?.title}</h1>
                                <div className="flex gap-2 items-center">
                                    <AuthRoleChecker requiredRoles={[RoleEnum.ADMIN]}>
                                        {!isPending && !isExpired && (
                                            <DownloadHomeworkPdfPlugin
                                                onLoadingChange={(loading) => setIsGeneratingPdf(loading)}
                                                buttonProps={{
                                                    size: "sm",
                                                    variant: "outline",
                                                    color: "aceBlue",
                                                    disabled: isGeneratingPdf,
                                                }}
                                                buttonText="Marking PDF"
                                                isSolution={false}
                                            />
                                        )}

                                        {isPending || isExpired ? (
                                            <>
                                                <Button color="aceBlue" variant="light" onClick={onSubmittingHomework}>
                                                    Submit Homework
                                                </Button>
                                                {ocrPlugin}
                                            </>
                                        ) : (
                                            <Button
                                                className=""
                                                size="sm"
                                                color="aceBlue"
                                                variant="filled"
                                                onClick={onSaveMarkingClick}
                                                leftSection={<IconDeviceFloppy size={16} />}
                                            >
                                                Save Marking
                                            </Button>
                                        )}
                                    </AuthRoleChecker>
                                </div>
                            </div>
                            <div>
                                {data?.submittedDate && (
                                    <p className="text-ace-text-primary-gray">
                                        Submitted at:
                                        {new Date(data?.submittedDate).toLocaleString("en-US", {
                                            timeZone: "Asia/Hong_Kong",
                                        })}
                                    </p>
                                )}

                                {data?.markedAt && (
                                    <p className="text-ace-green">
                                        Reviewed at:{" "}
                                        {new Date(data.markedAt).toLocaleString("en-US", {
                                            timeZone: "Asia/Hong_Kong",
                                        })}
                                    </p>
                                )}

                                <div className="flex items-center">
                                    <IconUser size={20} className="mr-2 text-ace-text-primary-gray" />
                                    <p className="text-ace-text-primary-gray">{data?.username ?? ""}</p>
                                </div>
                                <div className="flex items-center">
                                    <IconSchool size={20} className="mr-2 text-ace-text-primary-gray" />
                                    <p className="text-ace-text-primary-gray">{data?.school?.name ?? ""}</p>
                                </div>
                                <div className="flex items-center">
                                    <IconUsers size={20} className="mr-2 text-ace-text-primary-gray" />
                                    <p className="text-ace-text-primary-gray">
                                        {data?.classGroups && Array.isArray(data.classGroups)
                                            ? data.classGroups.map((group) => group?.name).join(", ")
                                            : ""}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <IconBadge size={20} className="mr-2 text-ace-text-primary-gray" />
                                    <ACETag color="blue">{data?.grade ?? "Unknown Grade"}</ACETag>
                                </div>
                                {isPending && (
                                    <div className="flex items-center mt-2 w-full">
                                        <Alert
                                            variant="light"
                                            color={"yellow"}
                                            title="Pending Submission"
                                            icon={<IconAlertOctagon size={16} />}
                                        >
                                            This homework submission is pending. Please proceed with caution. You can
                                            fill in the answers for the students or upload an image.
                                        </Alert>
                                    </div>
                                )}
                                {isExpired && (
                                    <div className="flex items-center mt-2 w-full">
                                        <Alert
                                            variant="light"
                                            color={"red"}
                                            title="Expired Submission"
                                            icon={<IconAlertOctagon size={16} />}
                                        >
                                            This homework has expired. Admin can still help him/her to submit the
                                            homework. Or else a model answer will be shown on his/her page.
                                        </Alert>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white px-1 py-1 max-w-[230mm] my-4 mx-auto rounded-lg border border-gray-200">
                            <AuthRoleChecker requiredRoles={[RoleEnum.ADMIN]}>
                                <Button
                                    variant="outline"
                                    color="aceBlue"
                                    className="m-2"
                                    size="xs"
                                    onClick={onUpdateScoreClick}
                                >
                                    Update Score
                                </Button>
                                {explanationPlugin}
                            </AuthRoleChecker>
                            <MainPanelWrapper
                                logoUrl={logoUrl}
                                logoSize={logoSize}
                                headerText={headerText}
                                {...panelMode}
                                jsonData={jsonContent}
                                dispatch={jsonContentDispatch}
                            />
                        </div>
                    </div>
                </div>
            </BaseGeneratorContext.Provider>
        </AdminMarkingPluginContext.Provider>
    );
};

export const AdminMarkingCorePanel = ({ explanationPlugin, ocrPlugin }: AdminMarkingPanelProps = {}) => {
    return <Page explanationPlugin={explanationPlugin} ocrPlugin={ocrPlugin} />;
};

export const AdminMarkingPanel = () => {
    return (
        <AdminMarkingCorePanel
            explanationPlugin={<ExplanationV2Plugin />}
            ocrPlugin={<OCRPlugin pluginContext={AdminMarkingPluginContext} />}
        />
    );
};
