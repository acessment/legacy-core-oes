/** @type {import('tailwindcss').Config} */

export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./node_modules/@acessment/generator-panel/**/*.{js, ts,jsx,tsx}",
        "./node_modules/@acessment/common-react-component/dist/**/*.{js,jsx}",
        "../../node_modules/@acessment/generator-panel/**/*.{js,ts,jsx,tsx}",
        "../../node_modules/@acessment/common-react-component/dist/**/*.{js,jsx}",
        "./node_modules/@acessment/core-oes/dist/**/*.{js,jsx,ts,tsx}",
        "../../node_modules/@acessment/core-oes/dist/**/*.{js,jsx,ts,tsx}",
        "../../packages/library/src/**/*.{js,jsx,ts,tsx}",
    ],

    theme: {
        extend: {
            spacing: {
                "mobile-margin": "20px",
                "tablet-margin": "32px",
                "desktop-margin": "64px",
            },
            textColor: {
                DEFAULT: "#324054",
            },
            colors: {
                "ace-background-gray": "#F9FAFB",
                "ace-text-primary-gray": "#324054",
                "ace-text-secondary-gray": "#6B7280",
                "ace-sidebar-icon-gray": "#71839B",
                "ace-blue": "#2D68FE",
                "ace-green": "#22C55E",
                "ace-red": "#DC2626",
                "ace-yellow": "#F59E0B",
                "ace-tag-bg-yellow": "#FFFBEB",
                "ace-tag-bg-red": "#FEF2F2",
                "ace-tag-bg-green": "#F0FDF4",
                "ace-tag-bg-blue": "#EFF6FF",
                "ace-table-text-gray": "#64748B",
                "ace-border-gray": "#E7E5E4",
                "ace-table-th-bg-gray": "#F9FAFB",
                "ace-border-light-gray": "#F1F5F9",
                "ace-sidebar-hover-light-gray": "#F1F5F9",
            },
        },
    },
};
