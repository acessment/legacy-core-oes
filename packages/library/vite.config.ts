import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import svgr from "vite-plugin-svgr";
import path from "node:path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

dotenv.config();

// Library build configuration
export default defineConfig({
    plugins: [
        react({
            fastRefresh: false,
        }),
        tailwindcss(),
        dts({
            insertTypesEntry: true,
            include: ["src/**/*"],
            exclude: ["src/**/*.test.*", "src/**/*.spec.*"],
        }),
        svgr({
            svgrOptions: {},
            esbuildOptions: {},
            include: "**/*.svg?react",
            exclude: "",
        }),
    ],
    build: {
        lib: {
            // Multiple entry points for client and server code
            entry: {
                index: path.resolve(__dirname, "src/index.ts"),
                server: path.resolve(__dirname, "src/server.ts"),
            },
            name: "CoreOES",
            formats: ["es"],
            fileName: (format, entryName) => `${entryName}.js`,
        },
        cssCodeSplit: false,
        rollupOptions: {
            external: [
                // Node.js built-in modules (server-only)
                "crypto",
                "node:crypto",
                "path",
                "node:path",
                "fs",
                "node:fs",
                // React core
                "react",
                "react-dom",
                "react/jsx-runtime",
                // React ecosystem
                "react-redux",
                "react-router-dom",
                "react-router",
                "react-i18next",
                "react-hook-form",
                "react-toastify",
                "react-toastify/unstyled",
                "@hello-pangea/dnd",
                // Mantine UI
                "@mantine/core",
                "@mantine/hooks",
                "@mantine/dates",
                "@mantine/dropzone",
                "mantine-datatable",
                // Tanstack
                "@tanstack/react-table",
                // Emotion
                "@emotion/react",
                "@emotion/styled",
                // Material UI
                "@mui/material",
                "@mui/icons-material",
                // Icons
                "@tabler/icons-react",
                "@heroicons/react",
                "heroicons",
                // HTTP & API
                "axios",
                "swr",
                // Firebase
                "firebase",
                "firebase-admin",
                // Payment
                "stripe",
                // Database
                "mongoose",
                // Date libraries
                "dayjs",
                "react-date-object",
                // Utilities
                "crypto-js",
                "immer",
                "use-immer",
                // PDF & Canvas
                "@react-pdf/renderer",
                "react-pdf",
                "html2canvas-pro",
                // Other large libraries
                "i18next",
                "i18next-browser-languagedetector",
                "i18next-fetch-backend",
                "remix-i18next",
                "tailwindcss",
                "@tailwindcss/vite",
                "@acessment/common-react-component",
                "@acessment/generator-panel",
            ],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                    "react/jsx-runtime": "react/jsx-runtime",
                },
            },
        },
        copyPublicDir: false,
    },
    esbuild: {
        jsx: "automatic",
        jsxDev: false,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@acessment/generator-panel": path.resolve(__dirname, "../generator-panel/src"),
            "@acessment/generator-panel/styles": path.resolve(__dirname, "../generator-panel/src/index.css"),
        },
    },
});
