import { useTranslation } from "react-i18next";
import CustomTab from "../../../../component/CustomTab";
import { useContext, useEffect, useReducer, useState } from "react";
import CustomTableNav from "../../../../component/customTable/CustomTableNav";
import { ActionIcon, Button, TextInput } from "@mantine/core";
import { IconSearch, IconFilter } from "@tabler/icons-react";
import DialogReducer from "@/reducer/DialogReducer";
import CustomTable from "../../../../component/customTable/CustomTable";

import { useNavigate } from "react-router";
import { HomeworkSummaryView } from "../../type";
import { IUserHomeworkFilterParams, IUserHomeworkParams } from "../../../account/type";
import { getUserHomework } from "../../../account/api";
import { AuthContext } from "../../../../provider/AuthContext";
import FilterUserHomeworkDialog from "../../component/FilterUserHomeworkDialog";
import HomeworkUserColumn from "../../utils/HomeworkUserColumn";
import { TrialBannerPlugin } from "@/plugins/TrialBannerPlugin";
import { DataTable } from "mantine-datatable";

interface UserHomeworkPageProps {
    trialBannerPlugin?: React.ReactNode;
}

const Page = ({ trialBannerPlugin }: UserHomeworkPageProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const initialSearchQuery: IUserHomeworkParams = {
        categories: "",
        submissionStatus: "",
        startDate: "",
        expiryDate: "",
        keyword: "",
        page: 0,
        size: 25,
        excludeFutureHomework: true,
    };
    const [searchQuery, setSearchQuery] = useState<IUserHomeworkParams>(initialSearchQuery);
    const [data, setData] = useState<IPagination<HomeworkSummaryView>>();
    const { user } = useContext(AuthContext);
    const columns = HomeworkUserColumn({ t });
    const initialDialogState = {
        filterUserHomeworkParams: false,
        confirmDeleteDialog: false,
    };
    const [dialogState, dialogDispatch] = useReducer(DialogReducer, initialDialogState);
    const [selectedHomework, setSelectedHomework] = useState<any[]>([]); //add the corresponding homework data type
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchHomeworkData = async (params: IUserHomeworkParams = initialSearchQuery) => {
        if (user?.id) {
            try {
                const homeworkData = await getUserHomework(params, user.id);
                setData(homeworkData);
            } catch (error) {
                console.error("Failed to fetch homework data:", error);
            }
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchHomeworkData(searchQuery)
            .then(() => setLoading(false))
            .catch((error) => {
                console.error("Error fetching homework data:", error);
                setLoading(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const handleSearchSubmit = () => {
        const trimmedKeyword = searchInput.trim();
        setSearchQuery((prev) => ({
            ...prev,
            keyword: trimmedKeyword,
            page: 0,
        }));
    };

    const handleSelectedRowsChange = (selectedRows: any[]) => {
        setSelectedHomework(selectedRows);
    };

    const tabItems = [
        {
            label: t("All Homework"),
            isNavigation: false,
            onClick: () => {
                setSearchQuery((prev) => ({
                    ...prev,
                    submissionStatus: "",
                    page: 0,
                }));
            }, // Current page, no navigation needed
        },
        {
            label: t("Pending"),
            isNavigation: false,
            onClick: () => {
                setSearchQuery((prev) => ({
                    ...prev,
                    submissionStatus: "Pending",
                    page: 0,
                }));
            }, // Current page, no navigation needed
        },
        {
            label: t("Submitted"),
            isNavigation: false,
            onClick: () => {
                setSearchQuery((prev) => ({
                    ...prev,
                    submissionStatus: "Submitted",
                    page: 0,
                }));
            },
        },
    ];

    const onFilterClick = (params: IUserHomeworkFilterParams) => {
        const filterParams: IUserHomeworkParams = {
            categories: params.categories,
            submissionStatus: params.submissionStatus,
            startDate: params.startDate,
            expiryDate: params.expiryDate,
            keyword: searchInput,
            page: 0,
            size: 25,
        };
        setSearchQuery(filterParams);
        fetchHomeworkData(filterParams);
        dialogDispatch({ type: "CLOSE_DIALOG", dialogType: "filterHomeworkDialog" });
    };

    return (
        <div className="bg-ace-background-gray sm:px-4 px-0 py-4 w-full max-w-7xl mx-auto">
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
                defaultTabIndex={0} // Set homework tab as default
                onTabChange={(index) => {
                    tabItems[index].onClick();
                }}
            />
            <div className="flex items-start w-full justify-between mb-4 mt-4">
                <TextInput
                    placeholder={t("Search homework...")}
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
                    leftSection={<IconFilter width={16} height={16} />}
                    size="sm"
                    variant="light"
                    color="aceBlue"
                    onClick={() =>
                        dialogDispatch({
                            type: "OPEN_DIALOG",
                            dialogType: "filterHomeworkDialog",
                        })
                    }
                >
                    {t("Filter")}
                </Button>
            </div>
            <div className="mt-4">{trialBannerPlugin}</div>
            <div className="border border-ace-border-gray rounded-lg bg-clip-border mt-6">
                <CustomTableNav title={t("Homework")}></CustomTableNav>
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
                    navigate(`/user/homework/${record.id}`);
                }}
                totalRecords={data?.totalElements || 0}
                recordsPerPage={data?.size || 25}
                page={searchQuery.page + 1}
                onPageChange={(page) => {
                    setSearchQuery((prev) => ({
                        ...prev,
                        page: page - 1,
                    }));
                    fetchHomeworkData({ ...searchQuery, page: page - 1 });
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

            <FilterUserHomeworkDialog
                open={dialogState.filterHomeworkDialog}
                handleClose={() =>
                    dialogDispatch({
                        type: "CLOSE_DIALOG",
                        dialogType: "filterHomeworkDialog",
                    })
                }
                onFilterClick={onFilterClick}
            />
        </div>
    );
};

export const UserHomeworkCorePage = ({ trialBannerPlugin }: UserHomeworkPageProps) => {
    return <Page trialBannerPlugin={trialBannerPlugin} />;
};
export const UserHomeworkPage = () => {
    return <UserHomeworkCorePage trialBannerPlugin={<TrialBannerPlugin />} />;
};
