import React, { useState, useEffect } from "react";
import {
    MainPanelWrapper,
    utilityReducer,
    IExerciseContentJsonData,
    makeMarkingJson,
} from "@acessment/generator-panel";
import { useImmerReducer } from "use-immer";
import ACETag from "@/component/buttons/ACETag";
import { IconSend, IconBadge, IconCalendar, IconCheck, IconCloudUp } from "@tabler/icons-react";
import { usePanelContext } from "@/provider/PanelContext";
import { useParams } from "react-router";
import { getHomework, submitHomework } from "../../api";
import { IHomeworkDetail, ISubmitHomeworkRequest } from "../../type";
import { toast } from "react-toastify/unstyled";
import { Button, LoadingOverlay, Skeleton } from "@mantine/core";
import { utcISOToHKDateString } from "@/utils/dateFormator";
import { clsx } from "clsx";
import { ConfirmDialog } from "../../../../component/dialog/confirm_dialog";
import { useTranslation } from "react-i18next";
import { BaseGeneratorContext } from "@/plugins/context/BaseGeneratorContext";

interface SingleHomeworkPageProps {
    tutorialVideoPlugin?: React.ReactNode;
    ocrPlugin?: React.ReactNode;
    downloadPdfPlugin?: React.ReactNode;
    showFullContent?: boolean;
    expiredMessage?: string;
    readingPassagePlugin?: React.ReactNode;
    listeningScriptPlugin?: React.ReactNode;
    downloadMarkingPDFPlugin?: React.ReactNode;
}

const Page = ({
    tutorialVideoPlugin,
    ocrPlugin,
    downloadPdfPlugin,
    showFullContent = false,
    expiredMessage = "",
    readingPassagePlugin,
    listeningScriptPlugin,
    downloadMarkingPDFPlugin,
}: SingleHomeworkPageProps) => {
    const { logoUrl, headerText, logoSize } = usePanelContext();
    const [jsonContent, jsonContentDispatch] = useImmerReducer(utilityReducer, {} as IExerciseContentJsonData);
    const [loading, setLoading] = useState<boolean>(true);
    const [submittingHomework, setSubmittingHomework] = useState<boolean>(false);
    const [homeworkData, setHomeworkData] = useState<IHomeworkDetail>();
    const [confirmSubmitDialogOpen, setConfirmSubmitDialogOpen] = useState(false);
    const [mode, setMode] = useState({
        isViewMarking: false,
        isExerciseView: true,
    });
    const [generalStatus, setGeneralStatus] = useState<"subH.penM" | "penH" | "subH.marM" | "expired">();

    const params = useParams<{ id: string }>();
    const { t } = useTranslation();

    const StartEndDate = () => {
        return (
            <div className="flex gap-2 items-center">
                <IconCalendar size={16} />
                <p>
                    Start Date: {homeworkData?.startDate ? utcISOToHKDateString(homeworkData.startDate) : "N/A"}
                    <br></br>
                    Deadline: {homeworkData?.expiryDate ? utcISOToHKDateString(homeworkData.expiryDate) : "N/A"}
                </p>
            </div>
        );
    };

    const fetchHomeworkData = async (homeworkId: string) => {
        try {
            console.log("Fetching homework data for ID:", homeworkId);
            setLoading(true);
            const response = await getHomework(homeworkId); // Replace "currentUserId" with actual user ID
            const contentJson = JSON.parse(response.contentJson);
            jsonContentDispatch({
                type: "SET_EXERCISE_CONTENT",
                payload: contentJson as IExerciseContentJsonData,
            });
            if (
                (response.submissionStatus.toLowerCase() === "submitted" &&
                    response.markingStatus.toLowerCase() === "marked") ||
                response.submissionStatus.toLowerCase() === "expired"
            ) {
                setMode({ isViewMarking: true, isExerciseView: false });
            }
            setHomeworkData(response);
        } catch (error) {
            console.error("Error fetching homework data:", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const determineGeneralStatus = () => {
        console.log("Determining general status with homeworkData:", homeworkData);
        if (!homeworkData) return;
        if (homeworkData.submissionStatus.toLowerCase() === "submitted") {
            if (homeworkData.markingStatus.toLowerCase() === "marked") {
                setGeneralStatus("subH.marM");
            } else {
                setGeneralStatus("subH.penM");
            }
        } else if (homeworkData.submissionStatus.toLowerCase() === "pending") {
            setGeneralStatus("penH");
        } else if (homeworkData.submissionStatus.toLowerCase() === "expired") {
            setGeneralStatus("expired");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (params.id) {
                await fetchHomeworkData(params.id);
            }
        };

        fetchData();
    }, [params.id]);

    useEffect(() => {
        determineGeneralStatus();
    }, [homeworkData]);

    const onSubmittingHomework = async () => {
        /*
        TODO need to rethink the logic of making marking json, I should be sending the one from marking/v2 
        but any changes from the student would change the answer and thus the one from marking/v2 cannot be used directly
        */
        setSubmittingHomework(true);

        try {
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

            // Call the API to submit the homework
            await submitHomework(request);
            toast.success("Homework submitted successfully!");
            setConfirmSubmitDialogOpen(false); // Close the dialog after successful submission
            fetchHomeworkData(params.id ?? ""); // Refresh the homework data after submission
        } catch (error) {
            console.error("Error submitting homework:", error);
            toast.error("Failed to submit homework. Please try again.");
        } finally {
            setSubmittingHomework(false);
        }
    };

    return (
        <BaseGeneratorContext.Provider
            value={{
                jsonContent,
                jsonDispatch: jsonContentDispatch as React.Dispatch<{
                    type: string;
                    payload?: IExerciseContentJsonData;
                    [key: string]: unknown;
                }>,
            }}
        >
            <div className="sm:px-4 px-0 py-4">
                <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-2">
                    <h1 className="text-4xl font-bold text-ace-text-primary-gray">
                        {jsonContent.title} {loading && <Skeleton visible={true} width={200} height={30} />}
                    </h1>
                    {generalStatus === "penH" ? (
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setConfirmSubmitDialogOpen(true);
                                }}
                                color="aceBlue"
                                leftSection={<IconSend size={16} />}
                                loading={submittingHomework}
                                disabled={submittingHomework}
                            >
                                Submit Homework
                            </Button>
                            {ocrPlugin}
                            {downloadPdfPlugin}
                        </div>
                    ) : (
                        <>{downloadPdfPlugin}</>
                    )}
                    {generalStatus === "subH.marM" && (downloadMarkingPDFPlugin)}
                </div>
                {homeworkData?.submissionStatus.toLowerCase() === "submitted" ? (
                    <>
                        <div className="flex gap-2 items-center">
                            <ACETag color="green">{homeworkData?.submissionStatus}</ACETag>
                        </div>
                        <div className="flex gap-2 items-center mb-2">
                            <IconCloudUp size={16} />

                            <p>
                                Submitted on:{" "}
                                {homeworkData?.submittedDate ? utcISOToHKDateString(homeworkData.submittedDate) : "N/A"}
                            </p>
                        </div>
                        <StartEndDate />
                    </>
                ) : generalStatus === "expired" ? (
                    <>
                        <ACETag color="red">{homeworkData?.submissionStatus}</ACETag>
                        <StartEndDate />
                    </>
                ) : (
                    <>
                        <ACETag color="yellow" showDot>
                            {homeworkData?.submissionStatus}
                        </ACETag>
                        <StartEndDate />
                    </>
                )}

                <div className="flex gap-2 items-center">
                    <IconBadge size={16} />
                    {/* <ACETag color="blue">{homeworkData?.grade.join(", ")}</ACETag> */}
                    <ACETag color="gray">{jsonContent.category}</ACETag>
                </div>
                {generalStatus !== "expired" && (
                    <div className="flex gap-2 items-center">
                        <IconCheck size={16} />
                        {generalStatus === "subH.marM" ? (
                            <p className="text-ace-green">Teacher has marked this exercise</p>
                        ) : (
                            <p className="text-ace-yellow">Marking is pending</p>
                        )}
                    </div>
                )}

                {<div className="mt-4">{tutorialVideoPlugin}</div>}
                {homeworkData?.audioSrc && (
                    <div className="flex my-5 w-full justify-center">
                        <audio className="mt-6 mx-auto w-full max-w-4xl" controls>
                            <source src={homeworkData?.audioSrc} type="audio/mp3"></source>
                            {"Your browser does not support the audio element."}
                        </audio>
                    </div>
                )}

                <div className="mt-4">
                    {generalStatus === "expired" ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-4 mx-auto w-full max-w-4xl">
                            <p className="text-red-700 text-center text-lg font-medium">
                                {expiredMessage || "This homework has expired and can no longer be submitted."}
                            </p>
                        </div>
                    ) : generalStatus === "subH.penM" ? (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 w-full">
                            <p className="text-orange-700 text-center text-lg font-medium">Marking is pending.</p>
                        </div>
                    ) : generalStatus === "subH.marM" ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                            <p className="text-green-700 text-center text-lg font-medium">Marking is complete.</p>
                        </div>
                    ) : null}
                </div>
                <div className={clsx("relative bg-white max-w-[245mm] my-4 mx-auto rounded-lg border border-gray-200")}>
                    <LoadingOverlay visible={loading} loaderProps={{ color: "", type: "bars" }} />
                    {(generalStatus == "penH" || (generalStatus == "subH.penM" && showFullContent)) && (
                        <div className={clsx("px-6 py-6", generalStatus == "subH.penM" && "pointer-events-none")}>
                            <MainPanelWrapper
                                logoUrl={logoUrl}
                                logoSize={logoSize}
                                headerText={headerText}
                                {...mode}
                                showUtility={false}
                                showMarkingUtility={false}
                                jsonData={jsonContent}
                                dispatch={jsonContentDispatch}
                            />
                        </div>
                    )}
                    {(generalStatus === "subH.marM" || (generalStatus === "expired" && showFullContent)) && (
                        <div className="px-6 py-6">
                            <MainPanelWrapper
                                logoUrl={logoUrl}
                                logoSize={logoSize}
                                headerText={headerText}
                                {...mode}
                                showUtility={false}
                                showMarkingUtility={false}
                                jsonData={jsonContent}
                                dispatch={jsonContentDispatch}
                            ></MainPanelWrapper>
                        </div>
                    )}
                </div>

                <ConfirmDialog
                    open={confirmSubmitDialogOpen}
                    handleClose={() => setConfirmSubmitDialogOpen(false)}
                    onSubmit={onSubmittingHomework}
                    title={t("Are you sure you want to submit this homework? This action cannot be undone.")}
                />
                {readingPassagePlugin}

                {(generalStatus === "subH.marM" || (generalStatus === "expired" ) || generalStatus === "subH.penM") && listeningScriptPlugin}
            </div>
        </BaseGeneratorContext.Provider>
    );
};
export const SingleHomeworkCorePage = ({
    tutorialVideoPlugin,
    ocrPlugin,
    downloadPdfPlugin,
    showFullContent,
    expiredMessage,
    readingPassagePlugin,
    listeningScriptPlugin,
    downloadMarkingPDFPlugin,
}: SingleHomeworkPageProps) => {
    return (
        <Page
            tutorialVideoPlugin={tutorialVideoPlugin}
            ocrPlugin={ocrPlugin}
            downloadPdfPlugin={downloadPdfPlugin}
            showFullContent={showFullContent}
            expiredMessage={expiredMessage}
            readingPassagePlugin={readingPassagePlugin}
            listeningScriptPlugin={listeningScriptPlugin}
            downloadMarkingPDFPlugin={downloadMarkingPDFPlugin}
        />
    );
};

