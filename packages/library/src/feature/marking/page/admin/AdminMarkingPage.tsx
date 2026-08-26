import React, { useState, useEffect } from "react";
import MarkingQueueCard from "@/feature/marking/component/MarkingQueueCard";
import { HomeworkSummaryView } from "../../../homework/type";
import { IClassGroup, IAccountSummary } from "../../../account/type";

// Extended type for marking queue items that include student data
type MarkingQueueItem = HomeworkSummaryView & {
    student_data?: IAccountSummary | null;
};

const Page = () => {
    const [markingQueue, setMarkingQueue] = useState<MarkingQueueItem[]>([]);

    useEffect(() => {
        // Fetch MarkingQueue from localStorage
        const fetchMarkingQueue = () => {
            try {
                const storedQueue = localStorage.getItem("MarkingQueue");
                if (storedQueue) {
                    const parsedQueue: MarkingQueueItem[] = JSON.parse(storedQueue);
                    setMarkingQueue(parsedQueue);
                } else {
                    setMarkingQueue([]);
                }
            } catch (error) {
                console.error("Error parsing MarkingQueue from localStorage:", error);
                setMarkingQueue([]);
            }
        };

        fetchMarkingQueue();
    }, []);

    const handleDeleteItem = (homeworkId: string) => {
        // Update the state immediately to reflect the deletion
        setMarkingQueue((prevQueue) => prevQueue.filter((item) => item.id !== homeworkId));
    };

    const processClassGroups = (classGroups: IClassGroup[]) => {
        // Process class groups and return joined string of class group names
        return classGroups.map((group) => group.name).join(", ");
    };

    return (
        <div className="p-4 w-full max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-ace-text-primary-gray">Admin Marking Page</h1>
            <p className="mb-3 text-ace-text-secondary-gray text-xl font-medium">Manage your marking queue.</p>

            {markingQueue.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 mt-6">
                    {markingQueue.map((homework) => (
                        <MarkingQueueCard
                            key={homework.id}
                            id={homework.id}
                            title={homework.title}
                            username={homework.username}
                            grade={homework.student_data?.grade || ""}
                            school={homework.student_data?.school?.name}
                            classGroup={
                                homework.student_data?.classGroups
                                    ? processClassGroups(homework.student_data.classGroups)
                                    : ""
                            }
                            deadline={homework.expiryDate}
                            submittedAt={homework.startDate} // Using startDate as placeholder, you might want submission date
                            onDelete={handleDeleteItem}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-6 text-center py-8 text-gray-500">
                    <p className="text-2xl font-bold">No items in marking queue</p>
                </div>
            )}
            <p className="font-medium w-full text-center mt-12">
                Add items to the marking queue in the{" "}
                <a href="/admin/exercises" className="text-blue-500 hover:underline">
                    exercise page
                </a>
            </p>
        </div>
    );
};

export const AdminMarkingCorePage = () => {
    return <Page />;
};

export const AdminMarkingPage = () => {
    return <AdminMarkingCorePage />;
};
