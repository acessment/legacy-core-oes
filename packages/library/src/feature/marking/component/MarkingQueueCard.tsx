import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import {
    IconClipboardList,
    IconUser,
    IconBadge,
    IconSchool,
    IconUsers,
    IconCalendar,
    IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@mantine/core";

interface MarkingQueueCardProps {
    id: string;
    title: string;
    username: string;
    grade: string;
    school?: string;
    classGroup?: string;
    deadline: string;
    submittedAt: string;
    onClick?: () => void;
    onDelete?: (homeworkId: string) => void;
}

const MarkingQueueCard: React.FC<MarkingQueueCardProps> = ({
    id,
    title,
    username,
    grade,
    school,
    classGroup,
    deadline,
    submittedAt,
    onClick,
    onDelete,
}) => {
    const navigate = useNavigate();
    const handleCardClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(`/admin/marking/${id}/panel`);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent event bubbling to parent card
        try {
            // Get current MarkingQueue from localStorage
            const storedQueue = localStorage.getItem("MarkingQueue");
            if (storedQueue) {
                const markingQueue = JSON.parse(storedQueue);

                // Filter out the item with matching id
                const updatedQueue = markingQueue.filter((item: { id: string }) => item.id !== id);

                // Update localStorage with the filtered array
                localStorage.setItem("MarkingQueue", JSON.stringify(updatedQueue));

                console.log(`Removed homework ${id} from marking queue`);

                // Call the onDelete callback if provided, otherwise reload the page
                if (onDelete) {
                    onDelete(id);
                } else {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error("Error removing item from MarkingQueue:", error);
        }
    };

    return (
        <div
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow relative"
            onClick={handleCardClick}
        >
            {/* Delete Button */}
            <button
                onClick={handleDeleteClick}
                className="absolute top-2 right-2 p-1 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-20"
                title="Remove from marking queue"
            >
                <IconTrash className="w-6 h-6" />
            </button>
            {/* Title */}
            <div className="flex items-center gap-2 mb-1">
                <IconClipboardList className="w-5 h-5 text-ace-text-primary-gray" />
                <h3 className="font-semibold text-ace-text-primary-gray text-sm">{title}</h3>
            </div>

            {/* Username */}
            <div className="flex items-center gap-2 mb-1">
                <IconUser className="w-4 h-4 text-ace-text-primary-gray" />
                <span className="text-sm text-ace-text-primary-gray">{username}</span>
            </div>

            {/* grade */}
            <div className="flex items-center gap-2 mb-1">
                <IconBadge className="w-4 h-4 text-ace-text-primary-gray" />
                <Badge color="aceBlue" variant="light">{grade}</Badge>
            </div>

            {/* School */}
            <div className="flex items-center gap-2 mb-1">
                <IconSchool className="w-4 h-4 text-ace-text-primary-gray" />
                <span className="text-sm text-ace-text-primary-gray">{school}</span>
            </div>

            {/* Group */}
            <div className="flex items-center gap-2 mb-1">
                <IconUsers className="w-4 h-4 text-ace-text-primary-gray" />
                <span className="text-sm text-ace-text-primary-gray">{classGroup}</span>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-2 mb-1">
                <IconCalendar className="w-4 h-4 text-ace-text-primary-gray" />
                <span className="text-sm text-ace-text-primary-gray">
                    <span className="font-medium">Deadline:</span> {deadline}
                </span>
            </div>

            <div className="text-sm text-ace-text-primary-gray mt-3">
                <span className="font-medium">Submitted at:</span> {submittedAt}
            </div>
        </div>
    );
};

export default MarkingQueueCard;
