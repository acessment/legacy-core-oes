import React, { useContext, useEffect, useCallback } from "react";
import { IconSchool, IconUsers, IconAward, IconQuote } from "@tabler/icons-react";
import ACETag from "../../../component/buttons/ACETag";
import { Trans, useTranslation } from "react-i18next";
import UserIcon from "../../../component/icon/UserIcon";
import { useState } from "react";
import { DatePickerInput } from "@mantine/dates";
import { AceCard } from "../../../component/AceCard";
import { useNavigate } from "react-router";
import { getUserCurrentHomeworkList } from "../api";
import { IUserHomeworkDto } from "../types";
import { getCompanySettings } from "../../setting/apis";
import GradePopUp from "../components/GradePopUp";
import { AuthContext } from "../../../provider/AuthContext";
import { tidyDateRange } from "@/utils/dateFormator";
import { TutorialVideoPlugin } from "@/plugins/TutorialVideoPlugin";
import { TrialStatusBadgePlugin } from "@/feature/home/plugins/TrialStatusBadgePlugin";
import { TrialBannerPlugin } from "@/plugins/TrialBannerPlugin";
import { Button, Pagination } from "@mantine/core";

interface UserHomePageProps {
    tutorialVideoPlugin?: React.ReactNode;
    inactiveMessage?: React.ReactNode;
    welcomeMessage?: string;
    trialStatusPlugin?: React.ReactNode;
    trialBannerPlugin?: React.ReactNode;
}

const Page = ({
    tutorialVideoPlugin,
    inactiveMessage,
    welcomeMessage,
    trialStatusPlugin,
    trialBannerPlugin,
}: UserHomePageProps) => {
    const [homeworkExe, setHomeworkExe] = useState<IUserHomeworkDto[]>([]);
    const [gradePopupOpened, setGradePopupOpened] = useState(false); // Don't show by default
    const { user } = useContext(AuthContext);
    const [dateValue, setDateValue] = useState<[string | null, string | null]>([
        new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
    ]);
    const router = useNavigate();
    const { t } = useTranslation();
    // const [companyDescription, setCompanyDescription] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const pageSize = 15;

    // const fetchData = async () => {
    //     const companySetting = await getCompanySettings();
    //     setCompanyDescription(companySetting.description);
    // };

    const fetchHomeworkData = useCallback(async () => {
        // Guard clause to ensure we have valid dates
        if (!dateValue[0] || !dateValue[1]) return;

        const response = await getUserCurrentHomeworkList({
            startDate: dateValue[0] ?? "",
            expiryDate: dateValue[1] ?? "",
            page: currentPage,
            limit: pageSize,
            excludeFutureHomework: true,
        });
        setHomeworkExe(response.data);
        // setHasMore(response.hasMore); // We dont have hasMore in response??????
        if (response.totalPages) {
            setTotalPages(response.totalPages);
        }
    }, [dateValue, currentPage, pageSize]);

    useEffect(() => {
        fetchHomeworkData();
    }, [fetchHomeworkData]);

    useEffect(() => {
        // Reset to page 1 when date range changes
        setCurrentPage(1);
    }, [dateValue]);

    useEffect(() => {
        // fetchData();
        // Check if user has a grade, if not, open the grade popup
        if (!user?.grade) {
            setGradePopupOpened(true);
        }
    }, [user]);

    const onCardClick = (url: string) => {
        router(url);
    };

    return (
        <div className="bg-ace-background-gray sm:px-4 px-0 py-4 w-full max-w-7xl mx-auto pb-4">
            <div className="grid grid-cols-1 sm:flex justify-between w-full gap-6">
                <div className="bg-white border border-ace-border-gray rounded-lg p-6 w-full">
                    <div className="flex items-center mb-4 gap-6">
                        <UserIcon username={user?.username} />
                        <div>
                            <h1 className="text-2xl font-bold">{user?.username}</h1>
                        </div>
                        <div className="ml-auto">{trialStatusPlugin}</div>
                    </div>

                    <div className="flex items-center">
                        <IconSchool className="mr-2 text-ace-text-primary-gray" size={20} />
                        <p className="text-ace-text-primary-gray">{user?.school}</p>
                    </div>
                    <div className="flex items-center">
                        <IconUsers className="mr-2 text-ace-text-primary-gray" size={20} />
                        <p className="text-ace-text-primary-gray">{user?.classGroups.join(", ")}</p>
                    </div>
                    <div className="flex items-center">
                        <IconAward className="mr-2 text-ace-text-primary-gray" size={20} />
                        <ACETag color="blue">{user?.grade}</ACETag>
                    </div>
                </div>
                <div className="relative w-full flex justify-center items-center">
                    <IconQuote className="absolute top-0 left-0 rotate-180 text-ace-blue" size={24} />
                    {/* <p className="text-ace-text-primary-gray py-8 px-8 font-medium">{companyDescription}</p> */}
                    <p className="text-ace-text-primary-gray py-8 px-8 font-medium">
                        {welcomeMessage ||
                            "It is easy to get bogged down trying to find the optimal plan for change: the fastest way to lose weight, the best program to build muscle, the perfect idea for a side hustle. We are so focused on figuring out the best approach that we never get around to taking action. As Voltaire once wrote, 'The best is the enemy of the good.' - James Clear"}
                    </p>
                    <IconQuote className="absolute bottom-0 right-0 text-ace-blue" size={24} />
                </div>
            </div>
            <div className="mt-4">{trialBannerPlugin}</div>
            {user?.status === "INACTIVE" ? (
                <div className="bg-red-50 border border-red-300 mt-6 p-2 rounded-md">
                    <p className="text-ace-red">
                        {inactiveMessage ||
                            "Your account is deactivated. Please contact your administrator for support."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:flex justify-between mt-8 gap-4">
                        <div className="flex gap-4 justify-between">
                            <h1 className="text-ace-text-primary-gray font-bold text-3xl">Homework</h1>
                            {tutorialVideoPlugin}
                        </div>

                        <DatePickerInput
                            type="range"
                            allowSingleDateInRange
                            maxDate={new Date()}
                            value={[
                                dateValue[0] ? new Date(dateValue[0]) : null,
                                dateValue[1] ? new Date(dateValue[1]) : null,
                            ]}
                            onChange={(newValue) => {
                                tidyDateRange(newValue, setDateValue);
                            }}
                            valueFormat="DD/MM/YYYY"
                            placeholder="Select date range"
                            className=""
                        />
                    </div>
                    <div className="flex justify-center mt-6">
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] w-full gap-5">
                            {homeworkExe.length > 0 ? (
                                homeworkExe.map((homework: IUserHomeworkDto, index) => {
                                    return (
                                        <AceCard
                                            allowCancel={false}
                                            onCardClick={onCardClick}
                                            key={index}
                                            exercise={homework}
                                        />
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-4 text-gray-500">
                                    <Trans i18nKey={"dashboard.noHomeworkStatement"}>
                                        No homework available for{" "}
                                        {dateValue[0] ? new Date(dateValue[0]).toDateString() : ""}
                                        &nbsp; to&nbsp;
                                        {dateValue[1] ? new Date(dateValue[1]).toDateString() : ""}
                                    </Trans>
                                </div>
                            )}
                        </div>
                    </div>
                    {homeworkExe.length > 0 && totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                value={currentPage}
                                onChange={setCurrentPage}
                                total={totalPages}
                                siblings={1}
                                boundaries={1}
                            />
                        </div>
                    )}
                </>
            )}

            {gradePopupOpened && (
                <GradePopUp
                    t={t}
                    opened={gradePopupOpened}
                    onClose={() => {
                        setGradePopupOpened(false);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export const UserHomeCorePage = ({
    tutorialVideoPlugin,
    inactiveMessage,
    welcomeMessage,
    trialStatusPlugin,
    trialBannerPlugin,
}: UserHomePageProps) => {
    return (
        <Page
            tutorialVideoPlugin={tutorialVideoPlugin}
            inactiveMessage={inactiveMessage}
            welcomeMessage={welcomeMessage}
            trialStatusPlugin={trialStatusPlugin}
            trialBannerPlugin={trialBannerPlugin}
        />
    );
};

export function UserHomePage() {
    return (
        <Page
            tutorialVideoPlugin={
                <TutorialVideoPlugin
                    title="Welcome Tutorial for 3 in 1 English System"
                    videoUrl="/tutorial-video/basic-tutorial.mp4"
                    buttonText="Welcome tutorial"
                    description="Learn how to do and submit your daily english exercise."
                />
            }
            welcomeMessage="HAHAHA"
            inactiveMessage={
                <>
                    你的帳戶已被停用。如欲重新啟用並繼續參與本計劃，請聯絡
                    <a href="https://api.whatsapp.com/send/?phone=85244289419" className="underline text-aceBlue">
                        44289419
                    </a>
                    。
                    <br />
                    Your account has been deactivated. To reactivate your account and continue participating in the
                    program, please contact:{" "}
                    <a href="https://api.whatsapp.com/send/?phone=85244289419" className="underline text-aceBlue">
                        44289419
                    </a>
                    .
                </>
            }
            trialStatusPlugin={<TrialStatusBadgePlugin />}
            trialBannerPlugin={<TrialBannerPlugin />}
        />
    );
}
export default UserHomePage;
