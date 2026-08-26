import type { Config } from "@react-router/dev/config";

export default {
    // App directory for routes
    appDirectory: "src",

    // Server build directory
    serverBuildFile: "server/index.js",

    // Explicitly set server adapter
    serverModuleFormat: "esm",

    // Enable SSR
    ssr: true,
    future: {
        v8_middleware: true,
    },
} satisfies Config;
