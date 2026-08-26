import { Badge, Anchor } from "@mantine/core";

interface ContactUsBadgePluginProps {
    url: string;
    text: string;
}

export const ContactUsBadgePlugin = ({ url, text }: ContactUsBadgePluginProps) => {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="cursor-pointer!">
            <Badge size="sm" variant="light" color="orange" className="cursor-pointer! hover:scale-105 transition-transform">
                {text}
            </Badge>
        </a>
    );
};
