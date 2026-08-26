import React, { useEffect, useState } from "react";
import { IconX, IconList } from "@tabler/icons-react";
import MarkingQueueCard from "./MarkingQueueCard";
import { HomeworkSummaryView } from "../../homework/type";

interface MarkingQueueSideBarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface MarkingQueueItem extends HomeworkSummaryView {
    school?: { name: string; id: string };
    classGroups?: [{ name: string; id: string }];
}

const MarkingQueueSideBar: React.FC<MarkingQueueSideBarProps> = ({ isOpen, onClose }) => {
    const [markingQueue, setMarkingQueue] = useState<MarkingQueueItem[]>([]);

    useEffect(() => {
        // Fetch MarkingQueue from localStorage
        const fetchMarkingQueue = () => {
            try {
                const storedQueue = localStorage.getItem("MarkingQueue");
                if (storedQueue) {
                    const parsedQueue: MarkingQueueItem[] = JSON.parse(storedQueue);
                    console.log("Fetched MarkingQueue:", parsedQueue);
                    setMarkingQueue(parsedQueue);
                } else {
                    setMarkingQueue([]);
                }
            } catch (error) {
                console.error("Error parsing MarkingQueue from localStorage:", error);
                setMarkingQueue([]);
            }
        };

        if (isOpen) {
            fetchMarkingQueue();
        }
    }, [isOpen]);

    const handleClearAll = () => {
        localStorage.removeItem("MarkingQueue");
        setMarkingQueue([]);
    };

    const handleDeleteItem = (homeworkId: string) => {
        // Update the state immediately to reflect the deletion
        setMarkingQueue((prevQueue) => prevQueue.filter((item) => item.id !== homeworkId));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="flex-1" onClick={onClose}></div>

            {/* Sidebar Content */}
            <div className="w-96 bg-white shadow-xl flex flex-col">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-ace-text-primary-gray">Marking Queue</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-ace-text-primary-gray hover:text-red-500 transition-colors"
                    >
                        <IconX className="w-6 h-6" />
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {markingQueue.length > 0 ? (
                        <div className="space-y-4">
                            {markingQueue.map((homework, index) => (
                                <div key={homework.id} className="relative">
                                    <MarkingQueueCard
                                        id={homework.id}
                                        title={homework.title}
                                        username={homework.username}
                                        grade={homework.grade}
                                        school={homework.school ? homework.school.name : ""}
                                        classGroup={
                                            homework.classGroups?.length
                                                ? homework.classGroups.map((g) => g.name).join(", ")
                                                : ""
                                        }
                                        deadline={homework.expiryDate}
                                        submittedAt={homework.startDate}
                                        onDelete={handleDeleteItem}
                                    />
                                    <div className="absolute bottom-2 right-2 bg-ace-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <IconList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-lg">No items in marking queue</p>
                            <p className="text-sm">Items will appear here when added to the queue</p>
                        </div>
                    )}
                </div>

                {/* Clear All Button */}
                {markingQueue.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleClearAll}
                            className="w-full py-2 px-4 text-red-500 border border-red-500 rounded-md hover:bg-red-50 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarkingQueueSideBar;
