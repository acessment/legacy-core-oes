import { toast } from "react-toastify/unstyled";
import { getUserAccountById } from "@/feature/account/api";
import { HomeworkSummaryView } from "@/feature/homework/type";
import { IAccountSummary } from "@/feature/account/type";

export interface HomeworkWithStudentData extends HomeworkSummaryView {
    student_data?: IAccountSummary | null;
}

/**
 * Filters homework list to only include submitted homework
 */
export const filterSubmittedHomework = (homeworkList: HomeworkSummaryView[]): HomeworkSummaryView[] => {
    return homeworkList.filter((homework) => homework.submissionStatus.toLowerCase() === "submitted");
};

/**
 * Gets the current marking queue from localStorage
 */
export const getMarkingQueue = (): HomeworkWithStudentData[] => {
    return JSON.parse(localStorage.getItem("MarkingQueue") || "[]");
};

/**
 * Updates the marking queue in localStorage
 */
export const updateMarkingQueue = (queue: HomeworkWithStudentData[]): void => {
    localStorage.setItem("MarkingQueue", JSON.stringify(queue));
};

/**
 * Core function to add homework to marking queue with student data
 */
const addHomeworkToMarkingQueue = async (selectedHomework: HomeworkSummaryView[]): Promise<HomeworkWithStudentData[]> => {
    if (selectedHomework.length === 0) {
        toast.warning("No homework found to add to marking queue.");
        return [];
    }

    // Fetch student data for each homework
    try {
        const studentDataPromises = selectedHomework.map(async (homework: HomeworkSummaryView) => {
            if (homework.assignedStudentId) {
                try {
                    const studentData = await getUserAccountById(homework.assignedStudentId);
                    console.log(`Student data for homework ${homework.id}:`, studentData);
                    return { homework, studentData };
                } catch (error) {
                    console.error(`Failed to fetch student data for ID ${homework.assignedStudentId}:`, error);
                    return { homework, studentData: null };
                }
            }
            return { homework, studentData: null };
        });

        const homeworkWithStudentData = await Promise.all(studentDataPromises);

        // Get existing queue and check for duplicates
        const existingQueue = getMarkingQueue();
        const existingIds = new Set(existingQueue.map(item => item.id));

        // Filter out homework that already exists in the queue and add student data
        const newHomeworkToAdd = homeworkWithStudentData
            .filter(({ homework }) => !existingIds.has(homework.id))
            .map(({ homework, studentData }) => ({
                ...homework,
                student_data: studentData,
            }));

        if (newHomeworkToAdd.length === 0) {
            toast.warning("All selected homework items are already in the marking queue.");
            return [];
        }

        // Add only new homework to the queue
        const updatedQueue = [...existingQueue, ...newHomeworkToAdd];
        updateMarkingQueue(updatedQueue);

        return newHomeworkToAdd;
    } catch (error) {
        console.error("Error fetching student data:", error);
        throw error;
    }
};

/**
 * Adds only submitted homework to marking queue
 */
export const addSubmittedHomeworkToMarkingQueue = async (selectedHomework: HomeworkSummaryView[]): Promise<void> => {
    if (!selectedHomework || selectedHomework.length === 0) {
        toast.warning("No homework selected.");
        return;
    }

    const submittedHomework = filterSubmittedHomework(selectedHomework);
    
    if (submittedHomework.length === 0) {
        toast.warning("No submitted homework found to add to marking queue.");
        return;
    }

    try {
        const addedHomework = await addHomeworkToMarkingQueue(submittedHomework);
        if (addedHomework.length > 0) {
            toast.success(`${addedHomework.length} submitted homework item(s) added to the marking queue successfully`);
        }
    } catch (error) {
        toast.error("Failed to add homework to marking queue. Please try again.");
        console.error("Error adding submitted homework to marking queue:", error);
    }
};

/**
 * Adds all selected homework to marking queue (regardless of submission status)
 */
export const addAllHomeworkToMarkingQueue = async (selectedHomework: HomeworkSummaryView[]): Promise<void> => {
    if (!selectedHomework || selectedHomework.length === 0) {
        toast.warning("No homework selected.");
        return;
    }

    try {
        const addedHomework = await addHomeworkToMarkingQueue(selectedHomework);
        if (addedHomework.length > 0) {
            toast.success(`${addedHomework.length} homework item(s) added to the marking queue successfully`);
        }
    } catch (error) {
        toast.error("Failed to add homework to marking queue. Please try again.");
        console.error("Error adding all homework to marking queue:", error);
    }
};