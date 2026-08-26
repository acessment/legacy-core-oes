import { useTranslation } from "react-i18next";

/* eslint-disable react/react-in-jsx-scope */
// Function to get build date
const getBuildDate = () =>
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_BUILD_DATE) || new Date().toISOString().split("T")[0]; // Default to current date

export function Footer() {
    const { t } = useTranslation();

    const buildDate = getBuildDate(); //NOTE: Date will be updated automatically during build time

    return (
        <footer className="flex w-full items-center justify-end bg-[#EBFBFB] p-4">
            <div className="flex flex-wrap items-center max-w-7xl gap-1">
                <small>
                    Powered by{" "}
                    <a href="https://www.acessment.ai" className="text-blue-500 hover:underline">
                        ACEssment Technology Limited
                    </a>
                    .
                </small>
                {buildDate && <small>Last updated: {buildDate}</small>}
                <img
                    src="/image/logo-material/acessment_production-web-adjusted.png"
                    alt="logo"
                    className="h-[0.8rem] w-auto"
                />
            </div>
        </footer>
    );
}
