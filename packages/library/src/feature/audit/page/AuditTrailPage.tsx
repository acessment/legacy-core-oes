import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useReducer, useState } from "react";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { ActionIcon, Button, TextInput } from "@mantine/core";
import AuditTrailColumn from "../utils/AuditTrailColumn";
import { fetchAuditTrail } from "../apis";
import CustomTable from "@/component/customTable/CustomTable";
import CustomTableNav from "@/component/customTable/CustomTableNav";
import DialogReducer from "../../../reducer/DialogReducer";
import FilterAuditDialog from "../components/FilterAuditDialog";
import { IAuditTrailDialogFilterParams, IAuditTrailFilterParams } from "../types";
import { fetchStudentOptions } from "../../homework/api";
import { optionsType } from "@/utils/model";
import { DataTable } from "mantine-datatable";

const Page = () => {
    const { t } = useTranslation();

    const [searchKeyword, setSearchKeyword] = useState("");

    const [isThreedotMenuOpen, setIsThreedotMenuOpen] = useState(false);
    const columns = AuditTrailColumn({ t });

    const initialDialogState = {
        filterAuditDialog: false,
    };
    const [dialogState, dialogDispatch] = useReducer(DialogReducer, initialDialogState);

    const [auditTrailData, setAuditTrailData] = useState<IPagination<any>>();

    const initFilter: IAuditTrailFilterParams = {
        keyword: "",
        entityTypes: "",
        studentIds: "",
        startDate: "",
        endDate: "",
        page: 0,
        size: 10,
    };
    const [searchInput, setSearchInput] = useState<IAuditTrailFilterParams>(initFilter);
    const [loading, setLoading] = useState(false);
    // Options for selects
    const [studentOptions, setStudentOptions] = useState<optionsType[]>([]);

    const fetchData = useCallback(async (params: IAuditTrailFilterParams) => {
        try {
            setLoading(true);
            const res = await fetchAuditTrail(params);
            setAuditTrailData(res);
        } catch (error) {
            console.error("Error fetching account summary:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFiltering = (params: IAuditTrailDialogFilterParams) => {
        const searchQuery: IAuditTrailFilterParams = {
            ...initFilter,
            entityTypes: params.entityTypes.join(","),
            studentIds: params.studentIds.join(","),
            startDate: params.startDate,
            endDate: params.endDate,
        };
        setSearchInput(searchQuery);
        fetchData(searchQuery);
        dialogDispatch({
            type: "CLOSE_DIALOG",
            dialogType: "filterAuditDialog",
        });
    };

    const initFetchData = async () => {
        // Fetch student options from API or context
        const data = await fetchStudentOptions({
            schoolIds: "",
            classGroupIds: "",
            grades: "",
        });
        setStudentOptions(data);
    };
    useEffect(() => {
        initFetchData();
    }, []);

    const onSearchKeywordClick = async () => {
        const searchQuery: IAuditTrailFilterParams = {
            ...initFilter,
            keyword: searchKeyword,
        };
        setSearchInput(searchQuery);
        await fetchData(searchQuery);
    };

    useEffect(() => {
        fetchData(searchInput);
    }, [fetchData, searchInput]);

    return (
        <div className="bg-ace-background-gray p-4 w-full max-w-7xl mx-auto">
            <div className="flex justify-between w-full">
                <div>
                    <p className="text-4xl font-bold text-ace-text-primary-gray">{t("Audit Trail Overview")}</p>
                    <p className="mb-3 text-ace-text-secondary-gray text-xl font-medium">
                        {t("Track actions performed within the system")}
                    </p>
                </div>
            </div>

            <div className="flex items-start w-full justify-between my-4">
                <TextInput
                    placeholder={t("Search records...")}
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
                            dialogType: "filterAuditDialog",
                        })
                    }
                    color="aceBlue"
                >
                    {t("Filter")}
                </Button>
            </div>
            <div className="border border-ace-border-gray rounded-lg bg-clip-border mt-6">
                <CustomTableNav
                    title={t("All Audit Trails")}
                    onMenuToggle={() => setIsThreedotMenuOpen(!isThreedotMenuOpen)}
                ></CustomTableNav>
            </div>
            <DataTable
                withTableBorder
                borderRadius="sm"
                withColumnBorders
                striped
                highlightOnHover
                records={auditTrailData?.content || []}
                columns={columns}
                totalRecords={auditTrailData?.totalElements || 0}
                recordsPerPage={auditTrailData?.size || 25}
                page={searchInput.page + 1}
                onPageChange={(page) => {
                    setSearchInput((prev: any) => ({
                        ...prev,
                        page: page - 1, // Adjust for zero-based index
                    }));
                    fetchData({ ...searchInput, page: page - 1 });
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

            <FilterAuditDialog
                studentOptions={studentOptions}
                open={dialogState.filterAuditDialog}
                handleClose={() =>
                    dialogDispatch({
                        type: "CLOSE_DIALOG",
                        dialogType: "filterAuditDialog",
                    })
                }
                onSubmit={(params) => {
                    handleFiltering(params);
                }}
            />
        </div>
    );
};

export const AdminAuditTrailCorePage = () => {
    return <Page />;
};

export const AdminAuditTrailPage = () => {
    return <AdminAuditTrailCorePage />;
};
