import { Badge, Indicator, PillGroup } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import dayjs from "dayjs";
import { getExerciseCategory } from "../utils/exerciseSchedule";
import clsx from "clsx";

const Page = () => {
    const getIndicatorColor = (date: Date): string => {
        const category = getExerciseCategory(date);

        switch (category) {
            case "grammar":
                return "green";
            case "reading":
                return "red";
            case "listening":
                return "grape"; // Purple in Mantine color palette
            case null:
                return "gray"; // Sunday - white/light gray
            default:
                return "gray";
        }
    };

    const shouldShowIndicator = (date: Date): boolean => {
        const category = getExerciseCategory(date);
        // Show indicator for all days except Sunday (which is null)
        return category !== null;
    };

    const isSunday = (date: Date): boolean => {
        return dayjs(date).day() === 0; // 0 = Sunday
    };

    return (
        <div className="flex justify-center w-full items-center h-[90vh] flex-col gap-6">
            <div className="bg-white border border-gray-200 p-8 rounded-md z-9">
                <img
                    src="/image/logo-material/acessment_production_cropped.png"
                    alt="ACEssment Logo"
                    className="w-32 mb-4 mx-auto"
                />
                <Calendar
                    static
                    size={"lg"}
                    renderDay={(date) => {
                        const day = dayjs(date).date();
                        const indicatorColor = getIndicatorColor(date);
                        const showIndicator = shouldShowIndicator(date);
                        const isSundayDate = isSunday(date);

                        return (
                            <Indicator
                                size={4}
                                color={indicatorColor}
                                disabled={!showIndicator}
                                position="bottom-end"
                                offset={-3}
                            >
                                <div className={clsx(isSundayDate ? "text-ace-blue font-bold" : "text-gray-800")}>
                                    {day}
                                </div>
                            </Indicator>
                        );
                    }}
                />
            </div>
            <PillGroup>
                <Badge color="green" title="grammar">
                    Grammar
                </Badge>
                <Badge color="red" title="reading">
                    Reading
                </Badge>
                <Badge color="grape" title="listening">
                    Listening
                </Badge>
            </PillGroup>
        </div>
    );
};

export const CalendarCorePage = () => {
    return <Page />;
};

export const CalendarPage = () => {
    return <CalendarCorePage />;
};
