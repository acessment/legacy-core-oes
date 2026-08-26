import { IAccountSummary, IUserHomeworkFilterParams, IUserHomeworkParams } from "../type";
import { IPagination } from "@/types";
import React, { ChangeEvent, useCallback, useEffect, useState, useReducer } from "react";
import {
    IconBadge,
    IconSchool,
    IconUsers,
    IconTrash,
    IconEdit,
    IconSearch,
    IconLock,
    IconFilter,
    IconEye,
    IconShieldCheck,
} from "@tabler/icons-react";
import ACETag from "../../../component/buttons/ACETag";
import { ActionIcon, Button, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import UserIcon from "../../../component/icon/UserIcon";
import DialogReducer from "../../../reducer/DialogReducer";
import FilterHomeworkDialog from "../component/FilterHomeworkDialog";
import { useNavigate, useParams } from "react-router";
import { deleteUserList, getUserAccountById, getUserHomework } from "../api";
import { deleteHomeworkList } from "../../homework/api";
import AccountInfoDialog from "../component/AccountInfoDialog";
import { HomeworkSummaryView } from "../../homework/type";
import StudentHomeworkColumn from "../utils/StudentHomeworkColumn";
import { toast } from "react-toastify/unstyled";
import { ConfirmDialog } from "../../../component/dialog/confirm_dialog";
import ResetPasswordDialog from "../component/ResetPasswordDialog";
import CustomTableNav from "@/component/customTable/CustomTableNav";
import { getMarkingPanelUrl } from "@/utils/navigationHelpers";
import { AuthContext } from "@/provider/AuthContext";
import { SingleAccountPluginContext } from "../plugins/context/AccountTablePluginContext";
import { TableDropDownPlugin } from "../../../plugins/TableDropDownPlugin";
import {
    handleAddAllToMarkingQueue,
    handleUnassignHomework,
} from "@/feature/account/component/menu/SingleAccountTableAction";
import { TableMenuItem } from "../type/TableMenuItem";
import { ActivateSingleUserPlugin, ActivateUserPluginContext } from "../plugins/ActivateSingleUserPlugin";
import { DataTable } from "mantine-datatable";
import { RoleEnum } from "@/enum/RoleEnum";
import AuthRoleChecker from "@/component/AuthRoleChecker";

interface SingleStudentAccountPageProps {
    tableDropdownPlugin?: React.ReactNode;
    availableRoles: string[]; // Optional prop to specify available roles for the student account
}

const Page = ({ tableDropdownPlugin, availableRoles }: SingleStudentAccountPageProps) => {
    const { user } = React.useContext(AuthContext);
    const [searchInput, setSearchInput] = useState("");
    const [selectedHomework, setSelectedHomework] = useState<HomeworkSummaryView[]>([]);

    // Dialog state using reducer (like AccountSummaryPage)
    const initialDialogState = {
        filterHomeworkDialog: false,
        editAccountDialog: false,
        deleteUserDialog: false,
        resetPasswordDialog: false,
        unassignHomeworkDialog: false,
    };
    const [dialogState, dialogDispatch] = useReducer(DialogReducer, initialDialogState);

    const [account, setAccount] = useState<IAccountSummary>(); // Replace with actual account data fetching logic
    //get student id by params or context if needed
    const studentId = useParams().id; // Example if using react-router

    const { t } = useTranslation();
    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };
    const [data, setData] = useState<IPagination<HomeworkSummaryView>>();

    const initialSearchQuery: IUserHomeworkParams = {
        categories: "",
        submissionStatus: "",
        startDate: "",
        expiryDate: "",
        keyword: "",
        page: 0,
        size: 25,
    };
    const [searchQuery, setSearchQuery] = useState<IUserHomeworkParams>(initialSearchQuery);

    const fetchUserData = useCallback(async () => {
        if (studentId) {
            try {
                const fetchedAccount = await getUserAccountById(studentId);
                console.log("Fetched account data:", fetchedAccount);
                setAccount(fetchedAccount);
            } catch (error) {
                console.error("Failed to fetch account data:", error);
            }
        }
    }, [studentId]);

    const columns = StudentHomeworkColumn({ t });

    // fetch homework data
    const fetchHomeworkData = useCallback(
        async (
            searchQuery: IUserHomeworkParams = initialSearchQuery // Use the current search query or initial if not provided
        ) => {
            if (studentId) {
                try {
                    const homeworkData = await getUserHomework(searchQuery, studentId);
                    console.log("Fetched homework data:", homeworkData);
                    setData(homeworkData);
                } catch (error) {
                    console.error("Failed to fetch homework data:", error);
                }
            }
        },
        [searchQuery, studentId]
    );
    useEffect(() => {
        // Fetch initial data when component mounts
        fetchUserData();
        fetchHomeworkData();
    }, []);

    // Auto-fetch homework data when searchQuery changes
    useEffect(() => {
        fetchHomeworkData(searchQuery);
    }, [searchQuery, fetchHomeworkData]);

    const onFilterClick = (params: IUserHomeworkFilterParams) => {
        console.log("Filter parameters:", params);
        const filterParams: IUserHomeworkParams = {
            categories: params.categories,
            submissionStatus: params.submissionStatus,
            startDate: params.startDate,
            expiryDate: params.expiryDate,
            keyword: searchInput, // Use the search input as keyword
            page: 0, // Reset to first page on filter
            size: 10, // Default page size
        };
        setSearchQuery(filterParams);
        dialogDispatch({ type: "CLOSE_DIALOG", dialogType: "filterHomeworkDialog" });
        fetchHomeworkData(filterParams); // Fetch data with new filter parameters
    };

    const navigate = useNavigate();

    const onDeletedUsers = async () => {
        try {
            await deleteUserList([studentId!]);
            toast.success(t("Selected students deleted successfully"));
            dialogDispatch({
                type: "CLOSE_DIALOG",
                dialogType: "deleteUserDialog",
            }); // Close the dialog after deletion
            toast.info("User delete successfully!");

            // 2 seconds and navigate back to account summary page
            setTimeout(() => {
                navigate("/admin/accounts");
            }, 2000);
        } catch (error) {
            console.error("Error deleting students:", error);
            toast.error(t("Failed to delete selected students"));
        }
    };

    const handleSearchSubmit = () => {
        // Update search query with keyword while preserving other filter parameters
        setSearchQuery((prev) => ({
            ...prev,
            keyword: searchInput,
            page: 0, // Reset to first page on new search
        }));
    };

    const onUnassignHomework = async () => {
        try {
            const homeworkIds = selectedHomework.map((homework) => homework.id);
            await deleteHomeworkList(homeworkIds);
            console.log("Unassigning homework with IDs:", homeworkIds);

            toast.success(t("Selected homework unassigned successfully"));

            // Refresh the homework data after unassigning
            fetchHomeworkData(searchQuery);

            // Clear the selection
            setSelectedHomework([]);
        } catch (error) {
            console.error("Error unassigning homework:", error);
            toast.error(t("Failed to unassign selected homework"));
        } finally {
            // Close the dialog after operation
            dialogDispatch({
                type: "CLOSE_DIALOG",
                dialogType: "unassignHomeworkDialog",
            });
        }
    };

    const handleSelectedRowsChange = useCallback((selectedRows: HomeworkSummaryView[]) => {
        setSelectedHomework(selectedRows);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setSearchQuery((prev) => ({
            ...prev,
            page: page - 1,
        }));
    }, []);

    return (
        <SingleAccountPluginContext.Provider value={{ selectedItems: selectedHomework, dialogDispatch }}>
            <div className="bg-ace-background-gray p-4 w-full max-w-7xl mx-auto">
                <div className="flex justify-between w-full gap-6">
                    <div className="bg-white border border-ace-border-gray rounded-lg p-6 w-full">
                        <div className="flex items-center mb-4 gap-6">
                            <UserIcon username={account?.username} />
                            <div>
                                <h1 className="text-2xl font-bold">{account?.username}</h1>
                                <p className="text-ace-text-primary-gray font-medium mb-2">
                                    Here you can view and manage student account details.
                                </p>
                            </div>
                            <AuthRoleChecker requiredRoles={[RoleEnum.ADMIN]}>
                                <button
                                    className="self-start ml-auto"
                                    onClick={() =>
                                        dialogDispatch({ type: "OPEN_DIALOG", dialogType: "editAccountDialog" })
                                    }
                                >
                                    <IconEdit
                                        size={24}
                                        className="cursor-pointer text-ace-text-primary-gray hover:text-ace-blue hover:scale-125 transition-all duration-200"
                                    />
                                </button>
                            </AuthRoleChecker>
                        </div>

                        <div className="flex items-center">
                            <IconSchool className="mr-2 text-ace-text-primary-gray" size={20} />
                            <p className="text-ace-text-primary-gray">{account?.school?.name}</p>
                        </div>
                        <div className="flex items-center">
                            <IconUsers className="mr-2 text-ace-text-primary-gray" size={20} />
                            <p className="text-ace-text-primary-gray">
                                {account?.classGroups.map((group) => group?.name).join(", ")}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <IconBadge className="mr-2 text-ace-text-primary-gray" size={20} />
                            <ACETag color="blue">{account?.grade}</ACETag>
                        </div>
                        <div className="flex items-center">
                            <IconShieldCheck className="mr-2 text-ace-text-primary-gray" size={20} />
                            <div className="flex gap-1">
                                {account?.roles?.map((role, index) => (
                                    <ACETag
                                        key={index}
                                        color={
                                            role === RoleEnum.ADMIN
                                                ? "red"
                                                : role === RoleEnum.TEACHER
                                                  ? "green"
                                                  : "gray"
                                        }
                                    >
                                        {role}
                                    </ACETag>
                                ))}
                            </div>
                        </div>
                    </div>
                    <AuthRoleChecker requiredRoles={[RoleEnum.ADMIN]}>
                        <div>
                            <div className="flex gap-2">
                                {account && (
                                    <ActivateUserPluginContext.Provider
                                        value={{ user: account, onUserStatusChange: fetchUserData }}
                                    >
                                        <ActivateSingleUserPlugin size="sm" variant="filled" />
                                    </ActivateUserPluginContext.Provider>
                                )}
                                <Button
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() =>
                                        dialogDispatch({ type: "OPEN_DIALOG", dialogType: "deleteUserDialog" })
                                    }
                                    variant="filled"
                                    color="red"
                                    size="sm"
                                >
                                    {t("Delete")}
                                </Button>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button
                                    leftSection={<IconLock size={16} />}
                                    onClick={() =>
                                        dialogDispatch({ type: "OPEN_DIALOG", dialogType: "resetPasswordDialog" })
                                    }
                                    variant="light"
                                    color="aceBlue"
                                    size="sm"
                                >
                                    {t("Reset Password")}
                                </Button>
                            </div>
                        </div>
                    </AuthRoleChecker>
                </div>
                <div className="mt-4 rounded-lg">
                    <div className="flex items-start w-full justify-between mb-4">
                        <TextInput
                            placeholder={t("Search students...")}
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
                            onClick={() => dialogDispatch({ type: "OPEN_DIALOG", dialogType: "filterHomeworkDialog" })}
                            color="aceBlue"
                        >
                            {t("Filter")}
                        </Button>
                    </div>
                    <AuthRoleChecker requiredRoles={[RoleEnum.ADMIN]}>
                        <CustomTableNav
                            title={t("Homework List")}
                            // onMenuToggle={()=>{}}
                            fullMenu={tableDropdownPlugin || null}
                        />
                    </AuthRoleChecker>
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
                            navigate(getMarkingPanelUrl(record.id, user));
                        }}
                        totalRecords={data?.totalElements || 0}
                        recordsPerPage={data?.size || 25}
                        page={searchQuery.page + 1}
                        onPageChange={handlePageChange}
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
                </div>

                <FilterHomeworkDialog
                    open={dialogState.filterHomeworkDialog}
                    handleClose={() => dialogDispatch({ type: "CLOSE_DIALOG", dialogType: "filterHomeworkDialog" })}
                    onFilterClick={onFilterClick}
                />

                {dialogState.editAccountDialog && (
                    <AccountInfoDialog
                        availableRoles={availableRoles}
                        open={dialogState.editAccountDialog}
                        handleClose={() => dialogDispatch({ type: "CLOSE_DIALOG", dialogType: "editAccountDialog" })}
                        fetchData={() => {
                            fetchUserData();
                            fetchHomeworkData(searchQuery); // Refresh homework data after editing account
                        }}
                        accountData={account} // Ensure account is defined
                    />
                )}
                {dialogState.deleteUserDialog && (
                    <ConfirmDialog
                        open={dialogState.deleteUserDialog}
                        handleClose={() =>
                            dialogDispatch({
                                type: "CLOSE_DIALOG",
                                dialogType: "deleteUserDialog",
                            })
                        }
                        title={t("Delete Students")}
                        onSubmit={onDeletedUsers}
                    />
                )}
                {dialogState.resetPasswordDialog && (
                    <ResetPasswordDialog
                        open={dialogState.resetPasswordDialog}
                        handleClose={() =>
                            dialogDispatch({
                                type: "CLOSE_DIALOG",
                                dialogType: "resetPasswordDialog",
                            })
                        }
                        t={t}
                        userId={studentId || ""} // Pass the student
                    />
                )}
                {dialogState.unassignHomeworkDialog && (
                    <ConfirmDialog
                        open={dialogState.unassignHomeworkDialog}
                        handleClose={() =>
                            dialogDispatch({
                                type: "CLOSE_DIALOG",
                                dialogType: "unassignHomeworkDialog",
                            })
                        }
                        title={t("Unassign Homework")}
                        onSubmit={onUnassignHomework}
                    />
                )}
            </div>
        </SingleAccountPluginContext.Provider>
    );
};

export const SingleStudentAccountCorePage = ({ tableDropdownPlugin }: SingleStudentAccountPageProps) => {
    return <Page tableDropdownPlugin={tableDropdownPlugin} availableRoles={[RoleEnum.USER, RoleEnum.TEACHER]} />;
};

export const SingleStudentAccountPage = () => {
    const homeworkMenuItems: TableMenuItem[] = [
        {
            label: "Unassign Selected",
            icon: IconTrash,
            onClick: handleUnassignHomework,
        },
        {
            label: "Add to Marking Queue",
            icon: IconEye,
            onClick: handleAddAllToMarkingQueue, //or add all to marking queue
        },
    ];

    const tableDropdownPlugin = (
        <TableDropDownPlugin
            pluginContext={SingleAccountPluginContext}
            menuItems={homeworkMenuItems}
            menuLabel="Select actions for"
        />
    );
    return <SingleStudentAccountCorePage tableDropdownPlugin={tableDropdownPlugin} availableRoles={[]} />;
};
