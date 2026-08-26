import { Menu, Button } from "@mantine/core";
import { IconWorld } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";

const languages = {
    en: "English",
    zh: "中文",
};

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const switchLanguage = (lng: string) => {
        const currentPath = location.pathname;

        // Remove current language prefix if exists
        const pathWithoutLang = currentPath.replace(/^\/(en|zh)(\/|$)/, "/");

        // Add new language prefix if not English
        const newPath = `/${lng}${pathWithoutLang}`;

        navigate(newPath);
    };

    return (
        <Menu shadow="md">
            <Menu.Target>
                {compact ? (
                    <Button size="compact-md" variant="white">
                        <IconWorld size={18} />
                    </Button>
                ) : (
                    <Button size="compact-md" variant="white" leftSection={<IconWorld size={18} />}>
                        {languages[i18n.language as keyof typeof languages] || languages.en}
                    </Button>
                )}
            </Menu.Target>

            <Menu.Dropdown>
                {Object.entries(languages).map(([code, name]) => (
                    <Menu.Item
                        key={code}
                        onClick={() => switchLanguage(code)}
                        className={i18n.language === code ? "bg-ace-blue-50" : ""}
                    >
                        {name}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    );
}
