import { BaseGeneratorContext } from "@/plugins/context/BaseGeneratorContext";
import { useContext, useState, useMemo } from "react";
import { Drawer, ActionIcon, ScrollArea, Stack, Text, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBook } from "@tabler/icons-react";
import parse from "html-react-parser";


export interface ScriptPassagePluginProps {
    // Define any props needed for the ReadingPassagePlugin here
    mode?: "reading" | "listening";
}


export const ScriptPassagePlugin = ({ mode = "reading" }: ScriptPassagePluginProps) => {
    const baseGeneratorContext = useContext(BaseGeneratorContext);
    const article = mode === "reading" 
        ? baseGeneratorContext?.jsonContent?.reading || ""
        : baseGeneratorContext?.jsonContent?.script || "";
    const [opened, { open, close }] = useDisclosure(false);

    // Parse HTML content safely
    const parsedContent = useMemo(() => {
        if (!article || article.trim() === "") {
            return <Text c="dimmed">No {mode === "reading" ? "reading passage" : "script"} available</Text>;
        }
        return parse(article);
    }, [article, mode]);

    // Don't render the FAB if there's no article
    if (!article || article.trim() === "") {
        return null;
    }

    const title = mode === "reading" ? "Reading Passage" : "Listening Script";
    const ariaLabel = mode === "reading" ? "Open reading passage" : "Open listening script";

    return (
        <>
            {/* Floating Action Button */}
            <ActionIcon
                onClick={open}
                size="xl"
                radius="xl"
                variant="filled"
                color="aceBlue"
                style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    zIndex: 1000,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
                aria-label={ariaLabel}
            >
                <IconBook size={24} />
            </ActionIcon>

            {/* Right-side Drawer */}
            <Drawer
                opened={opened}
                onClose={close}
                position="right"
                size="lg"
                title={title}
                overlayProps={{ opacity: 0.5, blur: 4 }}
                styles={{
                    title: {
                        fontSize: "1.25rem",
                        fontWeight: 600,
                    },
                }}
            >
                <ScrollArea style={{ height: "calc(100vh - 80px)" }}>
                    <Box
                        style={{
                            lineHeight: 1.7,
                            fontSize: "16px",
                            maxWidth: "65ch",
                        }}
                        sx={{
                            '& h2': {
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                marginTop: '1.5rem',
                                marginBottom: '1rem',
                                color: '#1a1a1a',
                            },
                        }}
                    >
                        {parsedContent}
                    </Box>
                </ScrollArea>
            </Drawer>
        </>
    );
}