import { reactRouter } from "@react-router/dev/vite";
import dotenv from "dotenv";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Load Catherine's server-side and client-side development configuration.
const envDevPath = path.resolve(__dirname, "../../.env.catherine");
dotenv.config({ path: envDevPath });

export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    server: {
        port: 3000, // Different port from legacy app
    },
    ssr: {
        external: ["mongoose"],
    },
    optimizeDeps: {
        exclude: ["mongoose"],
    },
    build: {
        outDir: "dist",
        assetsDir: "assets",
        rollupOptions: {
            output: {
                assetFileNames: "assets/[name]-[hash].[ext]",
            },
            external: ["mongoose"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "../library/src"),
            "@acessment/core-oes": path.resolve(__dirname, "../library/src"),
        },
    },
});
