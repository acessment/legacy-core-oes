import { Button, Modal } from "@mantine/core";
import { IconHelp } from "@tabler/icons-react";
import { useState } from "react";

interface TutorialVideoPluginProps {
    videoUrl: string;
    title: string;
    description?: string;
    buttonText?: string;
}

export const TutorialVideoPlugin = ({ videoUrl, title, description, buttonText }: TutorialVideoPluginProps) => {
    const [opened, setOpened] = useState(false);

    const onClose = () => {
        setOpened(false);
    };

    return (
        <>
            <Button
                className=""
                color="aceBlue"
                variant="light"
                leftSection={<IconHelp size={16} />}
                onClick={() => {
                    setOpened(true);
                }}
            >
                {buttonText || "Help & Tutorial"}
            </Button>
            <Modal
                opened={opened}
                onClose={onClose}
                title={title}
                size="75rem"
                classNames={{ title: "font-bold! text-2xl!" }}
                fullScreen={true}
            >
                {description && <p className="mb-4 text-gray-600">{description}</p>}

                <div className="w-full">
                    <video controls className="w-full h-auto rounded-lg" preload="metadata">
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </Modal>
        </>
    );
};
