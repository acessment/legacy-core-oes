import { useTranslation } from "react-i18next";
import CustomTab from "../../../../component/CustomTab";
import { useCallback, useContext, useEffect, useReducer, useState } from "react";
import CustomTableNav from "../../../../component/customTable/CustomTableNav";
import { ActionIcon, Button, TextInput } from "@mantine/core";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import FilterHomeworkDialog from "../../component/FilterHomeworkDialog";
import DialogReducer from "@/reducer/DialogReducer";
import { toast } from "react-toastify/unstyled";
import CustomTable from "../../../../component/customTable/CustomTable";
import { Column } from "../../../../component/customTable/types";
import HomeworkSummaryColumn from "../../utils/HomeworkSummaryColumn";
import { useNavigate } from "react-router";
import { filterHomeworkParams, HomeworkSummariesParams, HomeworkSummaryView } from "../../type";
import { fetchHomeworkSummaries } from "../../api";
import { AuthContext } from "../../../../provider/AuthContext";
import { HomeworkPluginContext } from "../../plugins/context/HomeworkTablePluginContext";
import { HOMEWORK_TABLE_MENU_ITEMS_ADD_ALL } from "../../type/HomeworkTableMenuItem";
import TableDropDownPlugin from "../../../../plugins/TableDropDownPlugin";
import { DataTable } from "mantine-datatable";

interface AdminHomeworkPageProps {
    tableDropDownPlugin?: React.ReactNode;
}

const Page = ({ tableDropDownPlugin }: AdminHomeworkPageProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const initialSearchParams: HomeworkSummariesParams = {
        classGroups: "",
        keyword: "",
        schools: "",
        grades: "",
        categories: "",
        submissionStatus: "",
        markingStatus: "",
        startDate: "", // ISO date string
        expiryDate: "", // ISO date string
        page: 0, // Default to the first page
        size: 25, // Default to 10 items per page
    };

    const [searchQuery, setSearchQuery] = useState<HomeworkSummariesParams>(initialSearchParams);
    const [data, setData] = useState<IPagination<HomeworkSummaryView>>(); // State to hold fetched homework summaries
    const columns = HomeworkSummaryColumn({ t });

    const initialDialogState = {
        filterHomeworkDialog: false,
    };
    const [dialogState, dialogDispatch] = useReducer(DialogReducer, initialDialogState);

    const [selectedHomework, setSelectedHomework] = useState<HomeworkSummaryView[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async (params: HomeworkSummariesParams) => {
        setLoading(true);
        try {
            setSelectedHomework([]); // Clear selection when fetching new data
            const response = await fetchHomeworkSummaries(params);
            setData(response as unknown as IPagination<HomeworkSummaryView>);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(searchQuery);
    }, [fetchData, searchQuery]);

    const handleSearchSubmit = () => {
        const trimmedKeyword = searchInput.trim();
        if (trimmedKeyword) {
            setSearchQuery((prev) => ({
                ...prev,
                keyword: trimmedKeyword,
                page: 0, // Reset to the first page on new search
            }));
        } else {
            toast.error(t("Please enter a valid search term."));
        }
    };

    const handleSelectedRowsChange = (selectedRows: HomeworkSummaryView[]) => {
        setSelectedHomework(selectedRows);
    };

    const tabItems = [
        {
            label: t("All Exercises"),
            isNavigation: true,
            onClick: () => navigate("/admin/exercises"), // Navigate to exercises page
        },
        {
            label: t("Welcome Exercises"),
            isNavigation: true,
            onClick: () => navigate("/admin/exercises?welcomeExercise=true"),
        },
        {
            label: t("Homework"),
            isNavigation: false,
            onClick: () => {}, // Current page, no navigation needed
        },
    ];

    const filterHomework = async (params: filterHomeworkParams) => {
        console.log("Filter applied");
        dialogDispatch({
            type: "CLOSE_DIALOG",
            dialogType: "filterHomeworkDialog",
        });

        const request: HomeworkSummariesParams = {
            classGroups: params.classGroups,
            keyword: searchQuery.keyword,
            schools: params.schools,
            grades: params.grades,
            categories: params.categories,
            submissionStatus: params.submissionStatus,
            markingStatus: params.markingStatus,
            page: searchQuery.page, // Keep the current page
            startDate: params.startDate, // Keep the current start date
            expiryDate: params.expiryDate, // Keep the current expiry date
            size: searchQuery.size, // Keep the current page size
        };

        setSearchQuery(request);
        await fetchData(request);
        toast.success(t("Filter applied successfully!"));
    };

    return (
        <HomeworkPluginContext.Provider
            value={{ selectedItems: selectedHomework, dialogDispatch, fetchData, user, dialogState, searchQuery }}
        >
            <div className="bg-ace-background-gray p-4 w-full max-w-7xl mx-auto">
                <div className="flex justify-between w-full">
                    <div>
                        <p className="text-4xl font-bold text-ace-text-primary-gray">{t("Homework Overview")}</p>
                        <p className="mb-3 text-ace-text-secondary-gray text-xl font-medium">
                            {t("View all your homework")}
                        </p>
                    </div>
                </div>
                <CustomTab
                    tabs={tabItems}
                    defaultTabIndex={2} // Set homework tab as default
                    onTabChange={(index) => {
                        tabItems[index].onClick();
                    }}
                />
                <div className="flex items-start w-full justify-between mb-4 mt-4">
                    <TextInput
                        placeholder={t("Search exercises...")}
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
                    <Button
                        leftSection={<IconFilter size={16} />}
                        variant="light"
                        size="sm"
                        onClick={() =>
                            dialogDispatch({
                                type: "OPEN_DIALOG",
                                dialogType: "filterHomeworkDialog",
                            })
                        }
                        color="aceBlue"
                    >
                        {t("Filter")}
                    </Button>
                </div>
                <div className="border border-ace-border-gray rounded-lg bg-clip-border mt-6">
                    <CustomTableNav title={t("Homework")} fullMenu={tableDropDownPlugin || null} />
                </div>
                <DataTable
                    withTableBorder
                    borderRadius="sm"
                    withColumnBorders
                    striped
                    highlightOnHover
                    records={data?.content || []}
                    columns={columns}
                    selectedRecords={selectedHomework}
                    onSelectedRecordsChange={handleSelectedRowsChange}
                    onRowClick={({ record }) => {
                        navigate(`/admin/marking/${record.id}/panel`);
                    }}
                    totalRecords={data?.totalElements || 0}
                    recordsPerPage={data?.size || 25}
                    page={searchQuery.page + 1}
                    onPageChange={(page) => {
                        setSearchQuery((prev) => ({
                            ...prev,
                            page: page - 1,
                        }));
                        fetchData({ ...searchQuery, page: page - 1 });
                    }}
                    fetching={loading}
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

                <FilterHomeworkDialog
                    open={dialogState.filterHomeworkDialog}
                    handleClose={() =>
                        dialogDispatch({
                            type: "CLOSE_DIALOG",
                            dialogType: "filterHomeworkDialog",
                        })
                    }
                    onFilterClick={filterHomework}
                />
            </div>
        </HomeworkPluginContext.Provider>
    );
};

export const AdminHomeworkCorePage = ({ tableDropDownPlugin }: AdminHomeworkPageProps) => {
    return <Page tableDropDownPlugin={tableDropDownPlugin} />;
};

export const AdminHomeworkPage = () => {
    return (
        <AdminHomeworkCorePage
            tableDropDownPlugin={
                <TableDropDownPlugin
                    menuItems={HOMEWORK_TABLE_MENU_ITEMS_ADD_ALL}
                    pluginContext={HomeworkPluginContext}
                />
            }
        />
    );
};
