import react from "@vitejs/plugin-react";
import path from "node:path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Library build configuration
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        dts({
            insertTypesEntry: true,
            include: ["src/**/*"],
            exclude: ["src/**/*.test.*", "src/**/*.spec.*"],
        }),
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "GeneratorPanel",
            formats: ["es"],
            fileName: () => "index.js",
        },
        cssCodeSplit: false,
        rollupOptions: {
            external: [
                // React core
                "react",
                "react-dom",
                "react/jsx-runtime",
                // React ecosystem
                "react-i18next",
                "@hello-pangea/dnd",
                // Mantine UI
                "@mantine/core",
                "@mantine/hooks",
                "@mantine/dropzone",
                // Emotion
                "@emotion/react",
                "@emotion/styled",
                // Icons
                "@tabler/icons-react",
                // Utilities
                "clsx",
                "immer",
                "use-immer",
                "dompurify",
                "html-react-parser",
                // Editor
                "quill",
                "react-quill-new",
                // Canvas
                "html2canvas-pro",
                // Other
                "tailwindcss",
                "@acessment/common-react-component",
            ],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                    "react/jsx-runtime": "react/jsx-runtime",
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith(".css")) return "index.css";
                    return assetInfo.name || "[name][extname]";
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
        },
    },
});
