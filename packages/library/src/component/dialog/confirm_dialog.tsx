import { Modal, Button, Text, Group, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useState } from "react";

type Props = {
    open: boolean;
    handleClose: () => void;
    onSubmit: (data: unknown) => Promise<void>;
    title: string;
    data?: unknown;
};

const ConfirmDialog = (props: Props) => {
    const { open, handleClose, onSubmit, title } = props;
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            await onSubmit(props.data);
            // Only close if onSubmit doesn't handle closing itself
            // handleClose();
        } catch (error) {
            console.error("Error during submission:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal opened={open} onClose={handleClose} size="xs" withCloseButton={false}>
            <Stack align="center" p="xl" gap="xl">
                <Text size="lg" fw={700} ta="center">
                    {title}
                </Text>

                <Group gap="md" w="100%">
                    <Button
                        size="sm"
                        radius="sm"
                        variant="filled"
                        color="aceBlue"
                        onClick={handleSubmit}
                        loading={isLoading}
                        disabled={isLoading}
                        flex={1}
                    >
                        {t("Confirm")}
                    </Button>

                    <Button
                        size="sm"
                        radius="sm"
                        variant="outline"
                        color="aceBlue"
                        onClick={handleClose}
                        disabled={isLoading}
                        flex={1}
                    >
                        {t("Cancel")}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};

export { ConfirmDialog };
