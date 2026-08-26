import { useTranslation } from "react-i18next";
import CustomTab from "../../../../component/CustomTab";
import { useContext, useEffect, useReducer, useState } from "react";
import CustomTableNav from "../../../../component/customTable/CustomTableNav";
import { IconSearch, IconFilter } from "@tabler/icons-react";
import FilterExercisesDialog from "../../component/FilterExercisesDialog";
import AssignHomeworkDialog from "../../component/AssignHomeworkDialog";
import DialogReducer from "@/reducer/DialogReducer";
import ExerciseSummaryColumn from "../../utils/ExerciseSummaryColumn";
import { FIlterExerciseDialogProps, IExerciseFilter, IExerciseSummary } from "../../type";
import { useLoaderData, useNavigate, useSearchParams } from "react-router";
import { AuthContext } from "../../../../provider/AuthContext";
import { ActionIcon, Button, TextInput } from "@mantine/core";
import { useConfig } from "@/provider/ConfigProvider";
import { ExercisePluginContext } from "@/feature/homework/plugins/context/ExerciseTablePluginContext";
import { EXERCISE_TABLE_MENU_ITEMS } from "@/feature/homework/type/ExerciseTableMenuItem";
import TableDropDownPlugin from "@/plugins/TableDropDownPlugin";
import { DataTable } from "mantine-datatable";
import { IPagination } from "@/types";
import { getUploadPDFLibraryColumn } from "@/feature/homework/plugins/upload-pdf-library";

interface AdminExercisePageProps {
    tableDropDownPlugin?: React.ReactNode;
    subscriptionPlugin?: (t: any, config?: any) => any;
    assignDateColumnPlugin?: (t: any) => any;
    uploadPDFLibraryColumnPlugin?: (t: any) => any;
}

const Page = ({ tableDropDownPlugin, subscriptionPlugin, assignDateColumnPlugin, uploadPDFLibraryColumnPlugin }: AdminExercisePageProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const appConfig = useConfig();
    const [searchParams] = useSearchParams();
    const welcomeParam = searchParams.get("welcomeExercise") === "true" || false;

    console.log("Welcome Param:", welcomeParam);
    // Helper: Extract filter from URL params
    const getFilterFromUrl = (): IExerciseFilter => ({
        categories: searchParams.get("categories") || "",
        grades: searchParams.get("grades") || "",
        createdStartedAt: searchParams.get("createdStartedAt") || "",
        createdEndedAt: searchParams.get("createdEndedAt") || "",
        assignStartedAt: searchParams.get("assignStartedAt") || "",
        assignEndedAt: searchParams.get("assignEndedAt") || "",
        keyword: searchParams.get("keyword") || "",
        page: Number(searchParams.get("page") || 0),
        size: Number(searchParams.get("size") || 25),
        welcomeExercise: welcomeParam,
        uploadPDFLibrary: searchParams.get("uploadPDFLibrary") ? searchParams.get("uploadPDFLibrary") === "true" : undefined,
    });

    console.log("Initial Filter from URL:", getFilterFromUrl());

    // Helper: Update URL with filter params
    const updateUrlWithFilter = (filterParams: Partial<FIlterExerciseDialogProps>) => {
        const urlParams = new URLSearchParams(searchParams);

        // Define all filter keys
        const filterKeys: (keyof FIlterExerciseDialogProps)[] = [
            "categories",
            "grades",
            "createdStartedAt",
            "createdEndedAt",
            "assignStartedAt",
            "assignEndedAt",
            "welcomeExercise",
            "uploadPDFLibrary",
        ];

        // Update or delete each param
        filterKeys.forEach((key) => {
            const value = filterParams[key];
            if (value !== undefined && value !== "" && value !== null) {
                urlParams.set(key, String(value));
            } else {
                urlParams.delete(key);
            }
        });

        // Reset to first page when filtering
        urlParams.set("page", "0");
        navigate(`?${urlParams.toString()}`);
    };

    const [searchKeyword, setSearchKeyword] = useState("");
    const columns = ExerciseSummaryColumn({
        t,
        assignDateColumn: assignDateColumnPlugin ? assignDateColumnPlugin({ t }) : undefined,
        uploadPDFLibraryColumn: uploadPDFLibraryColumnPlugin ? uploadPDFLibraryColumnPlugin({ t }) : undefined,
    });

    const initialDialogState = {
        filterExercisesDialog: false,
        assignHomeworkDialog: false,
    };
    const [dialogState, dialogDispatch] = useReducer(DialogReducer, initialDialogState);

    const loaderData = useLoaderData() as IPagination<IExerciseSummary>;
    const [exerciseData, setExerciseData] = useState<IPagination<IExerciseSummary>>(loaderData);
    const [selectedExercises, setSelectedExercises] = useState<IExerciseSummary[]>([]);
    const [searchInput, setSearchInput] = useState<IExerciseFilter>(getFilterFromUrl);
    const [loading] = useState(false); // Loader handles loading

    // Update searchInput when URL parameters change
    useEffect(() => {
        setSearchInput(getFilterFromUrl());
        setExerciseData(loaderData);
    }, [searchParams, loaderData, welcomeParam]);

    const onSearchKeywordClick = () => {
        const params = new URLSearchParams(searchParams);
        params.set("keyword", searchKeyword);
        params.set("page", "0");
        navigate(`?${params.toString()}`);
    };
    const tabItems = [
        {
            label: t("All Exercises"),
            isNavigation: true,
            onClick: () => navigate("/admin/exercises"),
        },
        {
            label: t("Welcome Exercises"),
            isNavigation: true,
            onClick: () => navigate("/admin/exercises?welcomeExercise=true"),
        },
        {
            label: t("Homework"),
            isNavigation: true,
            onClick: () => navigate("/admin/homework"),
        },
    ];

    const handleFiltering = (filterParams: FIlterExerciseDialogProps) => {
        updateUrlWithFilter(filterParams);
        dialogDispatch({
            type: "CLOSE_DIALOG",
            dialogType: "filterExercisesDialog",
        });
    };

    const handleSelectedRowsChange = async (selectedRows: IExerciseSummary[]) => {
        setSelectedExercises(selectedRows);
    };

    return (
        <ExercisePluginContext.Provider
            value={{
                selectedItems: selectedExercises,
                dialogDispatch,
                user,
                dialogState,
                searchQuery: searchInput,
            }}
        >
            <div className="bg-ace-background-gray p-4 w-full max-w-7xl mx-auto">
                <div className="flex justify-between w-full">
                    <div>
                        <p className="text-4xl font-bold text-ace-text-primary-gray">{t("Exercises Overview")}</p>
                        <p className="mb-3 text-ace-text-secondary-gray text-xl font-medium">
                            {t("View all your exercises")}
                        </p>
                    </div>
                </div>
                <CustomTab
                    tabs={tabItems}
                    defaultTabIndex={welcomeParam ? 1 : 0}
                    onTabChange={(index) => {
                        tabItems[index].onClick();
                    }}
                />
                <div className="flex items-start w-full justify-between my-4">
                    <TextInput
                        placeholder={t("Search exercises...")}
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.currentTarget.value)}
                        onKeyPress={(event) => {
                            if (event.key === "Enter") {
                                onSearchKeywordClick();
                            }
                        }}
                        leftSection={<IconSearch size={16} />}
                        rightSection={
                            <ActionIcon variant="filled" color="aceBlue" onClick={onSearchKeywordClick}>
                                <IconSearch size={16} />
                            </ActionIcon>
                        }
                        size="md"
                        radius={"md"}
                        color="aceBlue"
                    />
                    <Button
                        leftSection={<IconFilter size={16} />}
                        variant="light"
                        size="sm"
                        onClick={() =>
                            dialogDispatch({
                                type: "OPEN_DIALOG",
                                dialogType: "filterExercisesDialog",
                            })
                        }
                        color="aceBlue"
                    >
                        {t("Filter")}
                    </Button>
                </div>
                <div className="border border-ace-border-gray rounded-lg bg-clip-border mt-6">
                    <CustomTableNav title={t("All Exercises")} fullMenu={tableDropDownPlugin || null} />
                </div>
                <DataTable
                    className="mt-4"
                    withTableBorder
                    borderRadius="sm"
                    withColumnBorders
                    striped
                    highlightOnHover
                    records={exerciseData?.content || []}
                    columns={columns}
                    selectedRecords={selectedExercises}
                    onSelectedRecordsChange={handleSelectedRowsChange}
                    onRowClick={({ record }) => {
                        navigate(`/admin/document/${record.id}`);
                    }}
                    totalRecords={exerciseData?.totalElements || 0}
                    recordsPerPage={exerciseData?.size || 25}
                    page={searchInput.page + 1}
                    onPageChange={(page) => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", String(page - 1));
                        navigate(`?${params.toString()}`);
                    }}
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
                <FilterExercisesDialog
                    open={dialogState.filterExercisesDialog}
                    handleClose={() =>
                        dialogDispatch({
                            type: "CLOSE_DIALOG",
                            dialogType: "filterExercisesDialog",
                        })
                    }
                    onFilterClick={handleFiltering}
                    isAssignDateFilterPlugin={assignDateColumnPlugin ? true : false}
                    isUploadPDFLibraryFilterPlugin={uploadPDFLibraryColumnPlugin ? true : false}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                />
                <AssignHomeworkDialog
                    open={dialogState.assignHomeworkDialog}
                    handleClose={() =>
                        dialogDispatch({
                            type: "CLOSE_DIALOG",
                            dialogType: "assignHomeworkDialog",
                        })
                    }
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
                />
            </div>
        </ExercisePluginContext.Provider>
    );
};

export const AdminExerciseCorePage = ({
    tableDropDownPlugin,
    subscriptionPlugin,
    assignDateColumnPlugin,
    uploadPDFLibraryColumnPlugin,
}: AdminExercisePageProps) => {
    return (
        <Page
            tableDropDownPlugin={tableDropDownPlugin}
            subscriptionPlugin={subscriptionPlugin}
            assignDateColumnPlugin={assignDateColumnPlugin}
            uploadPDFLibraryColumnPlugin={uploadPDFLibraryColumnPlugin}
        />
    );
};

export const AdminExercisePage = () => {
    return (
        <AdminExerciseCorePage
            tableDropDownPlugin={
                <TableDropDownPlugin menuItems={EXERCISE_TABLE_MENU_ITEMS} pluginContext={ExercisePluginContext} />
            }
        />
    );
};
