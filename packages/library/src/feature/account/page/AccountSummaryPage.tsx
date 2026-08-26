import { useTranslation } from "react-i18next";

import CustomTab from "../../../component/CustomTab";
import { Button, TextInput, ActionIcon } from "@mantine/core";
import { IconDownload, IconPlus, IconFilter, IconFileArrowRight, IconSearch } from "@tabler/icons-react";
import { useCallback, useEffect, useState, useContext, useReducer, useMemo } from "react";
import { FileWithPath } from "@mantine/dropzone";

import AccountSummaryColumn from "../utils/AccountSummaryColumn";
import { FilterAccountsDialogFilterParams, IAccountSummary, IAccountSummaryParams } from "../type";
import { downloadUserAccountExcel, importStudentsFromFile } from "../api";
import { AuthContext } from "../../../provider/AuthContext";
import { toast } from "react-toastify/unstyled";
import { useLoaderData, useSearchParams } from "react-router";

import ImportStudentDialog from "../component/ImportStudentDialog";
import CustomTableNav from "../../../component/customTable/CustomTableNav";
import FilterAccountsDialog from "../component/FilterAccountsDialog";
import DialogReducer from "../../../reducer/DialogReducer";
import AccountInfoDialog from "../component/AccountInfoDialog";
import { useNavigate } from "react-router";
import { AccountSummaryPluginContext } from "@/feature/account/plugins/context/AccountTablePluginContext";
import { ACCOUNT_TABLE_MENU_ITEMS } from "@/feature/account/type/TableMenuItem";
import TableDropDownPlugin from "@/plugins/TableDropDownPlugin";
import { useConfig } from "@/provider/ConfigProvider";
import { DataTable } from "mantine-datatable";
import type { IPagination } from "@/types";
import { getStudentUrl } from "@/utils/navigationHelpers";
import AuthRoleChecker from "@/component/AuthRoleChecker";
import { RoleEnum } from "@/enum/RoleEnum";

interface AccountSummaryPageProps {
    tableDropDownPlugin?: React.ReactNode;
    subscriptionPlugin?: (t: any, config?: any) => any;
    availableRolesPlugin?: RoleEnum[];
}

const Page = ({ tableDropDownPlugin, subscriptionPlugin, availableRolesPlugin = [] }: AccountSummaryPageProps) => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);
    const appConfig = useConfig();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const data = useLoaderData<IPagination<IAccountSummary>>();

    // Helper: Extract filter from URL params
    const getFilterFromUrl = (): IAccountSummaryParams => ({
        status: searchParams.get("status") || "",
        classGroups: searchParams.get("classGroups") || "",
        keyword: searchParams.get("keyword") || "",
        grades: searchParams.get("grades") || "",
        schools: searchParams.get("schools") || "",
        subscriptions: searchParams.get("subscriptions") || "",
        page: parseInt(searchParams.get("page") || "0", 10),
        limit: parseInt(searchParams.get("limit") || "25", 10),
    });

    const columns = useMemo(
        () =>
            AccountSummaryColumn({
                t,
                subscriptionColumn: subscriptionPlugin
                    ? subscriptionPlugin(t, {
                          premiumPlanId: appConfig.stripePremiumPlanId,
                          plusPlanId: appConfig.stripePlusPlanId,
                          threeInOnePlanId: appConfig.stripeThreeInOnePlanId,
                      })
                    : undefined,
            }),
        [
            t,
            subscriptionPlugin,
            appConfig.stripePremiumPlanId,
            appConfig.stripePlusPlanId,
            appConfig.stripeThreeInOnePlanId,
        ]
    );

    const [loadingExcel, setLoadingExcel] = useState(false);
    const [searchQuery, setSearchQuery] = useState<IAccountSummaryParams>(getFilterFromUrl);
    const [selectedTabIndex, setSelectedTabIndex] = useState(() => {
        const status = searchParams.get("status") || "";
        if (status === "ACTIVATED") return 1;
        if (status === "INACTIVE") return 2;
        return 0;
    });
    const [searchInput, setSearchInput] = useState(searchParams.get("keyword") || "");
    const [selectedStudents, setSelectedStudents] = useState<IAccountSummary[]>([]);

    const initialDialogState = {
        createSchoolDialog: false,
        createClassGroupDialog: false,
        activateUserDialog: false,
        deactivateUserDialog: false,
        deleteUserDialog: false,
        assignGroupDialog: false,
        filterAccountsDialog: false,
        importStudentDialog: false,
        createUserDialog: false,
    };
    const [dialogState, dialogDispatch] = useReducer(DialogReducer, initialDialogState);

    // Update searchQuery when URL parameters change
    useEffect(() => {
        const currentQuery = getFilterFromUrl();
        setSearchQuery(currentQuery);
        setSearchInput(currentQuery.keyword);
    }, [searchParams]);

    // fetchData function for context - navigates to update URL params
    const fetchData = useCallback(
        async (params: IAccountSummaryParams) => {
            const urlParams = new URLSearchParams();
            if (params.status) urlParams.set("status", params.status);
            if (params.classGroups) urlParams.set("classGroups", params.classGroups);
            if (params.keyword) urlParams.set("keyword", params.keyword);
            if (params.grades) urlParams.set("grades", params.grades);
            if (params.schools) urlParams.set("schools", params.schools);
            if (params.subscriptions) urlParams.set("subscriptions", params.subscriptions);
            urlParams.set("page", params.page.toString());
            urlParams.set("limit", params.limit.toString());
            navigate(`?${urlParams.toString()}`, { replace: true });
        },
        [navigate]
    );

    const tabItems = [
        { label: t("All Users"), status: "" },
        { label: t("Activated"), status: "ACTIVATED" },
        { label: t("Inactive"), status: "INACTIVE" },
    ];

    const handleSearchSubmit = () => {
        const params = new URLSearchParams(searchParams);
        params.set("keyword", searchInput);
        params.set("page", "0");
        navigate(`?${params.toString()}`);
    };

    const handleFiltering = (params: FilterAccountsDialogFilterParams) => {
        console.log("Filter Params:", params);
        const urlParams = new URLSearchParams(searchParams);

        // Update or delete each param
        if (params.schoolIds) urlParams.set("schools", params.schoolIds);
        else urlParams.delete("schools");

        if (params.grades) urlParams.set("grades", params.grades);
        else urlParams.delete("grades");

        if (params.status) urlParams.set("status", params.status);
        else urlParams.delete("status");

        if (params.classGroupIds) urlParams.set("classGroups", params.classGroupIds);
        else urlParams.delete("classGroups");

        if (params.subscriptions) urlParams.set("subscriptions", params.subscriptions);
        else urlParams.delete("subscriptions");

        // Reset to first page when filtering
        urlParams.set("page", "0");
        navigate(`?${urlParams.toString()}`);

        dialogDispatch({
            type: "CLOSE_DIALOG",
            dialogType: "filterAccountsDialog",
        });
    };

    const handleResetFilters = () => {
        // Clear all filter params from URL, keep only page and limit
        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("limit", searchQuery.limit.toString());
        navigate(`?${params.toString()}`);

        dialogDispatch({
            type: "CLOSE_DIALOG",
            dialogType: "filterAccountsDialog",
        });
    };

    const handleSelectedRowsChange = useCallback((updatedSelectedRows: IAccountSummary[]) => {
        setSelectedStudents([...updatedSelectedRows]);
        console.log("Selected users:", updatedSelectedRows);
    }, []);

    const handlePageChange = useCallback(
        (page: number) => {
            const params = new URLSearchParams(searchParams);
            params.set("page", String(page - 1));
            navigate(`?${params.toString()}`);
        },
        [searchParams, navigate]
    );

    const handleRowClick = useCallback(
        ({ record }: { record: IAccountSummary }) => {
            navigate(getStudentUrl(record.id, user));
        },
        [navigate, user]
    );

    const handleImportStudents = async (files: FileWithPath[]) => {
        try {
            if (files.length === 0) return;

            setLoadingExcel(true);
            const file = files[0];
            console.log("Importing file:", file.name);

            // Here you would typically process the file and call your API
            // For now, we'll just show a success message
            //
            // Example API call structure:
            const formData = new FormData();
            formData.append("file", file);
            await importStudentsFromFile(formData);

            toast.success(t("Users imported successfully!"));
            // Refresh by navigating to trigger loader
            navigate(`?${searchParams.toString()}`, { replace: true });
        } catch (error) {
            console.error("Error importing users:", error);
            toast.error(t("Failed to import users. Please check the file format."));
        } finally {
            dialogDispatch({
                type: "CLOSE_DIALOG",
                dialogType: "importStudentDialog",
            });
            setLoadingExcel(false); // Reset loading state
        }
    };

    const onExportAccountSummary = async () => {
        try {
            setLoadingExcel(true); // Set loading state for Excel download
            const response = await downloadUserAccountExcel();

            // Create a link and trigger download
            const url = window.URL.createObjectURL(response);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "account_summary.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting account summary:", error);
            toast.error(t("Failed to export account summary"));
        } finally {
            setLoadingExcel(false); // Reset loading state
        }
    };

    return (
        <AccountSummaryPluginContext.Provider
            value={{ selectedItems: selectedStudents, dialogDispatch, fetchData, user, dialogState, searchQuery }}
        >
            <div className="bg-ace-background-gray p-4 w-full max-w-7xl mx-auto">
                <div className="flex justify-between w-full">
                    <div>
                        <p className="text-4xl font-bold text-ace-text-primary-gray">{t("Accounts Overview")}</p>
                        <p className="mb-3 text-ace-text-secondary-gray text-xl font-medium">
                            {t("View all your users accounts")}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <AuthRoleChecker requiredRoles={[RoleEnum.ADMIN]}>
                            <>
                                <Button
                                    leftSection={<IconDownload size={16} />}
                                    color="aceBlue"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        dialogDispatch({
                                            type: "OPEN_DIALOG",
                                            dialogType: "importStudentDialog",
                                        })
                                    }
                                    disabled={loadingExcel}
                                >
                                    {t("Import")}
                                </Button>
                                <Button
                                    leftSection={<IconFileArrowRight size={16} />}
                                    color="aceBlue"
                                    variant="outline"
                                    size="sm"
                                    disabled={loadingExcel}
                                    onClick={onExportAccountSummary}
                                >
                                    {t("Export")}
                                </Button>
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    color="aceBlue"
                                    variant="filled"
                                    size="sm"
                                    onClick={() =>
                                        dialogDispatch({
                                            type: "OPEN_DIALOG",
                                            dialogType: "createUserDialog",
                                        })
                                    }
                                >
                                    {t("New User")}
                                </Button>
                            </>
                        </AuthRoleChecker>
                    </div>
                </div>

                <div className="mb-4">
                    <AuthRoleChecker requiredRoles={[RoleEnum.ADMIN]}>
                        <CustomTab
                            tabs={tabItems}
                            defaultTabIndex={selectedTabIndex}
                            onTabChange={(index) => {
                                setSelectedTabIndex(index);
                                const params = new URLSearchParams(searchParams);
                                if (tabItems[index].status) {
                                    params.set("status", tabItems[index].status);
                                } else {
                                    params.delete("status");
                                }
                                params.set("page", "0");
                                navigate(`?${params.toString()}`);
                            }}
                        />
                    </AuthRoleChecker>
                </div>
                <div className="flex items-start w-full justify-between mb-4">
                    <TextInput
                        placeholder={t("Search users...")}
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.currentTarget.value)}
                        onKeyPress={(event) => {
                            if (event.key === "Enter") {
                                handleSearchSubmit();
                            }
                        }}
                        leftSection={<IconSearch size={16} />}
                        rightSection={
                            <ActionIcon variant="filled" color="aceBlue" onClick={handleSearchSubmit}>
                                <IconSearch size={16} />
                            </ActionIcon>
                        }
                        size="md"
                        radius={"md"}
                        color="aceBlue"
                    />
                    <AuthRoleChecker requiredRoles={[RoleEnum.ADMIN]}>
                        <Button
                            leftSection={<IconFilter size={16} />}
                            variant="light"
                            size="sm"
                            onClick={() =>
                                dialogDispatch({
                                    type: "OPEN_DIALOG",
                                    dialogType: "filterAccountsDialog",
                                })
                            }
                            color="aceBlue"
                        >
                            {t("Filter")}
                        </Button>
                    </AuthRoleChecker>
                </div>

                <div className="border border-ace-border-gray rounded-lg bg-clip-border mb-2">
                    <CustomTableNav title={tabItems[selectedTabIndex].label} fullMenu={tableDropDownPlugin || null} />
                </div>
                <DataTable
                    withTableBorder
                    borderRadius="sm"
                    withColumnBorders
                    striped
                    highlightOnHover
                    records={data?.content || []}
                    columns={columns}
                    selectedRecords={selectedStudents}
                    onSelectedRecordsChange={handleSelectedRowsChange}
                    onRowClick={handleRowClick}
                    totalRecords={data?.totalElements || 0}
                    recordsPerPage={data?.size || 25}
                    page={searchQuery.page + 1}
                    onPageChange={handlePageChange}
                    fetching={false}
                    idAccessor="id"
                    c="#64748B"
                    backgroundColor="white"
                    borderColor="#E7E5E4"
                    rowBorderColor="#E7E5E4"
                    styles={{
                        header: {
                            backgroundColor: "#F9FAFB",
                            color: "#64748B",
                        },
                        table: {
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                        },
                        pagination: {
                            paddingTop: "1rem",
                            paddingBottom: "1rem",
                        },
                    }}
                />

                <FilterAccountsDialog
                    open={dialogState.filterAccountsDialog}
                    handleClose={() =>
                        dialogDispatch({
                            type: "CLOSE_DIALOG",
                            dialogType: "filterAccountsDialog",
                        })
                    }
                    onFilterClick={handleFiltering}
                    onResetClick={handleResetFilters}
                    hasSubscriptionPlugin={!!subscriptionPlugin}
                    subscriptionOptions={
                        subscriptionPlugin
                            ? [
                                  { value: appConfig.stripePremiumPlanId || "", label: "Premium" },
                                  { value: appConfig.stripePlusPlanId || "", label: "Plus" },
                                  { value: appConfig.stripeThreeInOnePlanId || "", label: "3-in-1" },
                              ].filter((opt) => opt.value)
                            : undefined
                    }
                    initialFilter={{
                        schoolIds: searchParams.get("schools") || "",
                        grades: searchParams.get("grades") || "",
                        status: searchParams.get("status") || "",
                        classGroupIds: searchParams.get("classGroups") || "",
                        subscriptions: searchParams.get("subscriptions") || undefined,
                    }}
                />
                <ImportStudentDialog
                    open={dialogState.importStudentDialog}
                    handleClose={() =>
                        dialogDispatch({
                            type: "CLOSE_DIALOG",
                            dialogType: "importStudentDialog",
                        })
                    }
                    onImport={handleImportStudents}
                    fetchData={() => navigate(`?${searchParams.toString()}`, { replace: true })}
                />

                <AccountInfoDialog
                    open={dialogState.createUserDialog}
                    handleClose={() =>
                        dialogDispatch({
                            type: "CLOSE_DIALOG",
                            dialogType: "createUserDialog",
                        })
                    }
                    fetchData={() => navigate(`?${searchParams.toString()}`, { replace: true })}
                    availableRoles={availableRolesPlugin}
                />
            </div>
        </AccountSummaryPluginContext.Provider>
    );
};

export const AccountSummaryCorePage = ({
    tableDropDownPlugin,
    subscriptionPlugin,
    availableRolesPlugin,
}: AccountSummaryPageProps) => {
    return (
        <Page
            tableDropDownPlugin={tableDropDownPlugin}
            subscriptionPlugin={subscriptionPlugin}
            availableRolesPlugin={availableRolesPlugin}
        />
    );
};

export const AccountSummaryPage = () => {
    return (
        <AccountSummaryCorePage
            tableDropDownPlugin={
                <TableDropDownPlugin menuItems={ACCOUNT_TABLE_MENU_ITEMS} pluginContext={AccountSummaryPluginContext} />
            }
        />
    );
};
