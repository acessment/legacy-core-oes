import { TFunction } from "i18next";

interface Props {
    t: TFunction<"translation", undefined>;
}
const AuditTrailColumn = (props: Props) => {
    const { t } = props;

    return [
        { title: t("Action At"), accessor: "createdAt", width: "15%" },
        { title: t("Action By"), accessor: "user.username", width: "5%" },
        { title: t("Entity"), accessor: "entityType", width: "5%" },
        { title: t("Action Type"), accessor: "actionType", width: "5%" },
        { title: t("Action"), accessor: "action", width: "70%" },
    ];
};
export default AuditTrailColumn;
