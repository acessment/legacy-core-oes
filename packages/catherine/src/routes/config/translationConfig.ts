import i18n from "i18next";
import LngDetector from "i18next-browser-languagedetector";
import zhHKTranslation from "../translations/zh_hk_trans.json";
import chTranslation from "../translations/ch_trans.json";

const option = {
    order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag", "path", "subdomain"],
    lookupQuerystring: "lng",
    lookupCookie: "i18next",
    lookupLocalStorage: "i18nextLng",
    lookupFromPathIndex: 0,
    lookupFromSubdomainIndex: 0,
    caches: ["localStorage", "cookie"],
    excludeCacheFor: ["cimode"],
    cookieMinutes: 10,
    cookieDomain: "myDomain",
    htmlTag: typeof document !== "undefined" ? document.documentElement : undefined,
    checkWhitelist: true,
};
i18n.use(LngDetector).init({
    detection: option,
    resources: {
        zh_hk: {
            translation: zhHKTranslation,
        },
        ch: {
            translation: chTranslation,
        },
    },

    interpolation: {
        format: (value, lng) => {
            // Skip translation for default language (English)
            if (lng === "eng") return value;

            // Apply translation for other languages
            return value;
        },
    },
});

export default i18n;
