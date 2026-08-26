import { withPaywall } from "@/feature/payment/component/withPaywall";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { IconDownload, IconVolume } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

interface AudioPluginProps {
    exerciseId: string;
    productIndex?: number[];
}

// Create paywall-protected components OUTSIDE the component
const PaywallButton = withPaywall(Button) as any;
const PaywallActionIcon = withPaywall(ActionIcon) as any;

export const AudioPlugin: React.FC<AudioPluginProps> = ({ exerciseId, productIndex }) => {
    const fetcher = useFetcher();
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleClick = () => {
        console.log("AudioPlugin handleClick triggered");
        if (!audioUrl) {
            fetcher.submit({}, { method: "post" });
        }
    };

    useEffect(() => {
        if (fetcher.data) {
            console.log("fetcher data received", fetcher.data);

            // Check if the response contains a base64 audio string
            if (fetcher.data.audio) {
                // Convert base64 string to data URL for audio player
                const dataUrl = `data:audio/mpeg;base64,${fetcher.data.audio}`;
                setAudioUrl(dataUrl);
            }
        }
    }, [fetcher.data]);

    // Cleanup object URL on unmount or when audioUrl changes
    useEffect(() => {
        return () => {
            if (audioUrl) {
                window.URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const isLoading = fetcher.state !== "idle";

    const handleDownload = () => {
        if (audioUrl) {
            const a = document.createElement("a");
            a.href = audioUrl;
            a.download = `${exerciseId}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return audioUrl ? (
        <div className="gap-2 items-center flex">
            <audio
                src={audioUrl}
                controls
                style={{ maxWidth: "100%" }}
                onError={(e) => {
                    console.error("Audio element error:", e);
                }}
                onLoadedMetadata={(e) => {
                    console.log("Audio loaded, duration:", e.currentTarget.duration);
                }}
            >
                Your browser does not support the audio element.
            </audio>

            <Tooltip label="Download MP3">
                <PaywallActionIcon
                    onClick={handleDownload}
                    variant="outline"
                    color="aceBlue"
                    ml="xs"
                    size="lg"
                    radius={"lg"}
                    productIndex={productIndex || []}
                >
                    <IconDownload size={20} />
                </PaywallActionIcon>
            </Tooltip>
        </div>
    ) : (
        <PaywallButton
            leftSection={<IconVolume size={16} />}
            onClick={handleClick}
            loading={isLoading}
            disabled={isLoading}
            color="aceBlue"
            productIndex={productIndex || []}
        >
            Load Audio
        </PaywallButton>
    );
};
