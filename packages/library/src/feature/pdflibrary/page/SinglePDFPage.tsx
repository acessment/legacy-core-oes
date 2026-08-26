import { usePanelContext } from "@/provider";
import { IExerciseContentJsonData, MainPanelWrapper, utilityReducer } from "@acessment/generator-panel";
import { ActionIcon, Alert, Badge, Container, Group, Stack, Text, Tooltip } from "@mantine/core";
import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { useImmerReducer } from "use-immer";
import type { SinglePDFLoaderData } from "../loader/singlePdfLoader.server";
import { BaseGeneratorContext } from "@/plugins/context/BaseGeneratorContext";
import { AudioPlugin } from "../plugin/AudioPlugin";
import { withPaywall } from "@/feature/payment";
import { IconEdit } from "@tabler/icons-react";

export interface SinglePDFCorePageProps {
    downloadExercisePdfPlugin?: React.ReactNode;
    downloadSolutionPdfPlugin?: React.ReactNode;
}
const PaywallActionButton = withPaywall(ActionIcon) as any;

/**
 * Generates page title from document data
 */
const generatePageTitle = (document: SinglePDFLoaderData['document']): string => {
    if (!document) return "ACEssment";
    
    // Clean title - remove underscore suffix and "Exercise --" prefix
    let title = document.title
        .replace(/_[a-zA-Z0-9]+$/, '')
        .replace(/^Exercise\s*--\s*/, '');
    
    // Extract type from category
    const type = document.category ? document.category.charAt(0).toUpperCase() + document.category.slice(1) : null;
    
    // Extract lowest level from grades
    const levelPattern = /[ps]\d+/gi;
    const levels = document.grade
        ?.flatMap((grade: string) => grade.match(levelPattern) || [])
        .map((level: string) => level.toLowerCase()) || [];
    
    // Sort to find lowest level (p1 < p2 < ... < s1 < s2 ...)
    const sortedLevels = levels.sort((a, b) => {
        const aType = a[0];
        const bType = b[0];
        const aNum = parseInt(a.slice(1));
        const bNum = parseInt(b.slice(1));
        
        if (aType === bType) return aNum - bNum;
        return aType === 'p' ? -1 : 1;
    });
    
    const lowestLevel = sortedLevels[0]?.toUpperCase();
    
    // Build title parts
    const parts = [title];
    if (type) parts.push(`| ${type} Exercise For`);
    if (lowestLevel) parts.push(lowestLevel);
    parts.push("| ACEssment");
    
    return parts.join(" ");
};

/**
 * Generates meta description from document data
 */
const generateMetaDescription = (document: SinglePDFLoaderData['document']): string => {
    if (!document) return "Educational resources by ACEssment";
    
    // Clean title
    const title = document.title
        .replace(/_[a-zA-Z0-9]+$/, '')
        .replace(/^Exercise\s*--\s*/, '');
    
    const parts = [title];
    
    // Add type
    if (document.category) {
        const type = document.category.charAt(0).toUpperCase() + document.category.slice(1);
        parts.push(`${type} exercise`);
    }
    
    // Add all levels/grades
    if (document.grade && document.grade.length > 0) {
        parts.push(`Tags: ${document.grade.join(", ")}`);
    }
    
    return parts.join(" - ");
};

export const SinglePDFCorePage = ({ downloadExercisePdfPlugin, downloadSolutionPdfPlugin }: SinglePDFCorePageProps) => {
    const { logoUrl, headerText, logoSize } = usePanelContext();
    const { document, error } = useLoaderData() as SinglePDFLoaderData;
    const [isEditMode, setIsEditMode] = useState(false);

    const handleEditToggle = () => {
        setIsEditMode(!isEditMode);
    };
    const parsedContent = useMemo(() => {
        if (!document?.content) return {} as IExerciseContentJsonData;
        try {
            return JSON.parse(document.content) as IExerciseContentJsonData;
        } catch {
            console.error("Failed to parse document content JSON");
            return {} as IExerciseContentJsonData;
        }
    }, [document?.content]);

    const [jsonContent, jsonContentDispatch] = useImmerReducer(utilityReducer, parsedContent);

    const pluginContextValue = useMemo(
        () => ({
            jsonContent,
            jsonDispatch: jsonContentDispatch,
        }),
        [jsonContent, jsonContentDispatch]
    );

    if (error || !document) {
        return (
            <Container size="xl" py="xl">
                <Alert color="red" title="Error">
                    {error || "PDF not found"}
                </Alert>
            </Container>
        );
    }

    const getCategoryColor = (category?: string) => {
        if (!category) return "gray";
        switch (category.toLowerCase()) {
            case "grammar":
                return "green";
            case "reading":
                return "red";
            case "writing":
                return "yellow";
            case "listening":
                return "blue";
            default:
                return "brown";
        }
    };

    return (
        <BaseGeneratorContext.Provider value={pluginContextValue}>
            <Stack gap="lg" p="md" className="w-full max-w-[250mm] mx-auto">
                <Stack gap="xs">
                    <title>{generatePageTitle(document)}</title>
                    <meta name="description" content={generateMetaDescription(document)} />
                    
                    <div className="flex gap-3">
                        <Text size="xl" fw={700}>
                            {document.title.replace(/_[a-zA-Z0-9]+$/, '')}
                        </Text>
                        
                        <Tooltip label={isEditMode ? "Exit Edit Mode" : "Edit PDF Content"}>
                            <PaywallActionButton
                                variant={isEditMode ? "light" : "subtle"}
                                color="aceBlue"
                                productIndex={[0, 1]}
                                tooltip={isEditMode ? "Exit Edit Mode" : "Edit PDF Content"}
                                onClick={handleEditToggle}
                            >
                                <IconEdit />
                            </PaywallActionButton>
                        </Tooltip>
                    </div>
                    <Group gap="xs">
                        {document.category && (
                            <Badge color={getCategoryColor(document.category)} variant="light">
                                {document.category}
                            </Badge>
                        )}
                        {document.grade?.map((text: string, index: number) => (
                            <Badge color="gray" variant="light" key={index}>
                                {text}
                            </Badge>
                        ))}
                    </Group>
                    <Group gap="xs">
                        {downloadExercisePdfPlugin}
                        {downloadSolutionPdfPlugin}
                    </Group>
                    <div className="flex justify-center">
                        {document.category === "listening" && (
                            <AudioPlugin exerciseId={document._id} productIndex={[0, 1]} />
                        )}
                    </div>
                </Stack>
                <div className={isEditMode ? "" : "pointer-events-none select-none bg-white w-full max-w-[250mm] mx-auto p-[15mm] border border-gray-200 rounded-md shadow-md"}>
                    <MainPanelWrapper
                        isExerciseView={!isEditMode}
                        isViewMarking={false}
                        logoUrl={logoUrl}
                        logoSize={logoSize}
                        headerText={headerText}
                        showUtility={isEditMode}
                        showMarkingUtility={false}
                        jsonData={jsonContent}
                        dispatch={jsonContentDispatch}
                    />
                </div>
            </Stack>
        </BaseGeneratorContext.Provider>
    );
};
