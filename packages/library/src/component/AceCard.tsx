import { IconCalendar, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { IUserHomeworkDto } from "../feature/home/types";
import { Badge } from "@mantine/core";

/* eslint-disable react/react-in-jsx-scope */
type CardContainerProps = {
    exercise: IUserHomeworkDto;
    onCardClick: (url: string) => void;
    allowCancel?: boolean;
    onCancelClick?: (exerciseId: string) => void;
};
export const AceCard = (props: CardContainerProps) => {
    const thumbnailURL = props.exercise.thumbnailSrc;
    const { t } = useTranslation();
    const handleCardClick = () => {
        const url = `/user/homework/${props.exercise.id}`;
        props.onCardClick(url);
    };

    const handleCancelClick = () => {
        props.onCancelClick?.(props.exercise.id);
    };

    return (
        <div
            className="min-w-[250px] w-auto hover:translate-y-[-4px] group relative transition-transform cursor-pointer"
            onClick={handleCardClick}
        >
            {props.allowCancel && (
                <button
                    className="w-[35px] h-[35px] bg-[#ccc] flex items-center justify-center absolute rounded-[50%] left-[5px] top-[5px]"
                    onClick={handleCancelClick}
                >
                    <IconX />
                </button>
            )}

            {/* Status badge for ML content */}

            <div className="relative h-full grid grid-rows-[245px_1fr] w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow overflow-y-hidden overflow-x-clip group-hover:shadow-xl transition-all">
                {
                    <div
                        className={`absolute top-3 right-2 z-2 px-2 py-1 rounded-md font-medium text-sm ${
                            props.exercise.submissionStatus.toLowerCase() === "submitted"
                                ? "bg-green-100 text-green-800"
                                : props.exercise.submissionStatus.toLowerCase() === "expired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                        {/* {props.status ? t(props.status) : ""} */}
                        {props.exercise.submissionStatus}
                    </div>
                }

                <img className="p-2 rounded-t-lg object-contain" src={thumbnailURL} alt="product image" />
                <div className="flex flex-col p-5 bg-white gap-2 justify-between">
                    <p className="w-full text-wrap text-xl font-semibold tracking-tight text-ace-black line-clamp-2">
                        {props.exercise?.title}{" "}
                    </p>
                    <Badge color="gray" variant="light">
                        {props.exercise?.category || "combined"}
                    </Badge>
                    {props.exercise?.startDate && (
                        <p>
                            <IconCalendar className="inline mr-2" size={16} />
                            {t("Start Date")}: {props.exercise.startDate.split("T")[0]}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
