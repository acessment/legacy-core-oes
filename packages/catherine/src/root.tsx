import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import "@acessment/generator-panel/styles";
import "@acessment/core-oes/index.css";

import "../app.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "mantine-datatable/styles.layer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { I18nextProvider } from "react-i18next";
import i18n from "./routes/config/translationConfig";
import {
    AuthProvider,
    PanelContextProvider,
    MaintenanceContext,
    TrialGroupContext,
    ConfigProvider,
    Footer,
    type AppConfig,
} from "@acessment/core-oes";
import { BASE_THEME_MANTINE } from "@acessment/core-oes";
import { ToastContainer } from "react-toastify/unstyled";
import "react-toastify/ReactToastify.css";

function getEnv(key: string): string | undefined {
    // Server-side (Node.js)
    if (typeof process !== "undefined" && process.env) {
        return process.env[key];
    }
    // Client-side (Vite)
    if (typeof import.meta !== "undefined" && import.meta.env) {
        return import.meta.env[key] as string | undefined;
    }
    return undefined;
}

// App configuration
const appConfig: AppConfig = {
    apiDomain: getEnv("VITE_REACT_BASE_URL") || "http://localhost:8080",
    apiEndpoint: getEnv("VITE_API_ENDPOINT"),
    baseUrl: getEnv("BASE_URL") || "/",
    firebaseApiKey: getEnv("VITE_FIREBASE_API_KEY") || "",
    firebaseProjectId: getEnv("VITE_FIREBASE_PROJECT_ID") || "",
    emailDomain: getEnv("VITE_EMAIL_DOMAIN") || "example.com",
    googleClientId: getEnv("VITE_GOOGLE_CLIENT_ID"),
    facebookClientId: getEnv("VITE_FACEBOOK_CLIENT_ID"),
    viteAuthDomain: getEnv("VITE_AUTH_DOMAIN"),
    encryptionSecretKey: getEnv("VITE_ENCRYPTION_SECRET_KEY") || "",
};

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <ColorSchemeScript />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700;800&display=block"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&family=Noto+Sans+TC:wght@100..900&display=swap"
                    rel="stylesheet"
                />
                <link rel="icon" type="image/svg+xml" href="/image/logo-material/ace_production.svg" />
                <title>ACEssment | Accelerate Education with AI</title>
                <meta
                    name="description"
                    content="AI-powered educational solutions tailored for teachers, students, and parents. Generate custom exercises instantly with fine-tuned AI. Access a vast PDF exercise library, and explore English learning plans—all in one place."
                />

                <Meta />
                <Links />
                {/* <script async src="https://js.stripe.com/v3/pricing-table.js"></script> */}
            </head>
            <body>
                <ConfigProvider value={appConfig}>
                    <AuthProvider>
                        <I18nextProvider i18n={i18n}>
                            <MantineProvider theme={BASE_THEME_MANTINE}>
                                <PanelContextProvider
                                    logoUrl="/image/logo-material/acessment_production_white.png"
                                    headerText="Exercises by ..."
                                    companyName="Company name"
                                    logoSize={58}
                                    downloadLogoSize={64}
                                >
                                    <MaintenanceContext.Provider
                                        value={{
                                            isMaintenanceMode: false,
                                            message:
                                                "Sorry for the inconvenience. We are currently undergoing maintenance.",
                                        }}
                                    >
                                        <TrialGroupContext.Provider value={"dummy-trial-group"}>
                                            <ToastContainer aria-label={""} />
                                            <div className="">
                                                <div style={{ minHeight: "90vh" }}>{children}</div>
                                                <Footer />
                                            </div>
                                        </TrialGroupContext.Provider>
                                    </MaintenanceContext.Provider>
                                </PanelContextProvider>
                            </MantineProvider>
                        </I18nextProvider>
                    </AuthProvider>
                </ConfigProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function Root() {
    return <Outlet />;
}
//test deploy
