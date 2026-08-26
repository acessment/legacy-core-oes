import { Trans, useTranslation } from "react-i18next";


export const NoUtilityMessage = () => {
    const { t } = useTranslation();

    return (
        <div className="font-alegreyaSans z-10 rounded-md absolute hidden opacity-0 group-hover/logout:block group-hover/logout:opacity-100 bg-slate-100 bottom-0 right-0 px-3 transition-all duration-200">
            <Trans i18nKey="NoUtilityMessage">
                <a className="text-ace-blue underline" onClick={() => console.log("Login clicked")}>{t("Login ")}</a>
                <span>{t(" to access full editing features.")}</span>
            </Trans>
        </div>
    );
}