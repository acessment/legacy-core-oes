import { Skeleton } from "@mantine/core";
import clsx from "clsx";

interface PanelSkeletonProps {
    className?: string;
}

export const PanelSkeleton = ({ className }: PanelSkeletonProps) => {
    return (
        <div className={clsx("max-h-[400px] max-w-[210mm] pb-6", className)}>
            <Skeleton height={30} width={150} mb="xl" />
            <Skeleton height={12} width="70%" radius="xl" mb="xl" />
            <Skeleton height={12} radius="xl" />
            <Skeleton height={12} mt={6} radius="xl" />
            <Skeleton height={12} mt={6} radius="xl" />
            <Skeleton height={12} mt={6} radius="xl" />
            <Skeleton height={12} mt={6} radius="xl" />
            <Skeleton height={12} mt={6} width="70%" radius="xl" />
            <Skeleton height={80} mt={36} width="45%" />
            <Skeleton height={12} mt={24} width="70%" radius="xl" />
        </div>
    );
};
