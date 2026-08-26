import { useFetcher } from "react-router";
import { useEffect } from "react";
import { toast } from "react-toastify/unstyled";

export interface UpdateExerciseInput {
    title: string;
    grade: string[];
    category: string;
    content: any;
    welcomeExercise?: boolean;
    autoAssigned?: boolean;
    assignDate?: string | null;
    uploadPDFLibrary?: boolean;
}

interface UseUpdateExerciseResult {
    updateExercise: (exerciseId: string, data: UpdateExerciseInput) => void;
    isUpdating: boolean;
    error: any;
    data: any;
}

export function useUpdateExercise(onSuccess?: () => void): UseUpdateExerciseResult {
    const fetcher = useFetcher();

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data) {
            if (fetcher.data.error) {
                const errorMessage =
                    typeof fetcher.data.error === "string"
                        ? fetcher.data.error
                        : fetcher.data.details
                        ? JSON.stringify(fetcher.data.details)
                        : "Failed to update exercise";
                toast.error(errorMessage);
            } else if (fetcher.data.success) {
                toast.success(fetcher.data.message || "Exercise updated successfully!");
                toast.info("Refreshing exercise data... It can take a while...");
                onSuccess?.();
            }
        }
    }, [fetcher.state, fetcher.data, onSuccess]);

    const updateExercise = (exerciseId: string, data: UpdateExerciseInput) => {
        fetcher.submit(JSON.stringify(data), {
            method: "POST",
            action: `/api/exercise/${exerciseId}`,
            encType: "application/json",
        });
    };

    return {
        updateExercise,
        isUpdating: fetcher.state !== "idle",
        error: fetcher.data?.error,
        data: fetcher.data,
    };
}
