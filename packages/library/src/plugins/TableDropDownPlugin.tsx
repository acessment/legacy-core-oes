import React, { Context, isValidElement, ReactElement, useContext, useState } from "react";
import { Menu, ActionIcon } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { AccountSummaryPluginContextValue, SingleAccountPluginContextValue } from "../feature/account/plugins/context/AccountTablePluginContext";
import { ExercisePluginContextValue } from "../feature/homework/plugins/context/ExerciseTablePluginContext";
import { TableMenuItem } from "../feature/account/type/TableMenuItem";

export interface TableDropDownPluginProps<T> {
    menuItems: TableMenuItem[];
    menuLabel?: string;
    actionIconProps?: {
        variant?: string;
        color?: string;
        size?: string;
    };
    pluginContext: Context<T | undefined>;
}

// NOTE for future developers, the generic type T is used to allow this component to accept different plugin context types
// such as SingleAccountPluginContextValue or AccountSummaryPluginContextValue.
// Please add any new context types to the union type in the usage of this component.
export function TableDropDownPlugin<T extends SingleAccountPluginContextValue | AccountSummaryPluginContextValue | ExercisePluginContextValue>({
    menuItems,
    menuLabel,
    actionIconProps = {
        variant: "subtle",
        color: "gray",
        size: "sm",
    },
    pluginContext,
}: TableDropDownPluginProps<T>) {
    const { t } = useTranslation();
    const context = useContext(pluginContext);
    const selectedItems = context?.selectedItems || [];
    const dialogDispatch = context?.dialogDispatch;
    const defaultMenuLabel = menuLabel || t("Actions for");

    const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);

    return (
        <>
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <ActionIcon
                        variant={actionIconProps.variant}
                        color={actionIconProps.color}
                        size={actionIconProps.size}
                    >
                        <IconDots size={16} />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                        <>
                            <Menu.Label>
                                {defaultMenuLabel} {t("selected items")}
                            </Menu.Label>
                            {menuItems.map((item, index) => (
                                <Menu.Item
                                    key={index}
                                    leftSection={<item.icon size={16} />}
                                    color={"black"}
                                    onClick={() => {
                                        console.log("selectedItems in TableDropDownPlugin:", selectedItems);
                                        item.onClick({
                                            selectedItems: selectedItems as unknown[],
                                            dialogDispatch: dialogDispatch,
                                        });
                                        setOpenDialogIndex(index);
                                    }}
                                >
                                    {item.label}
                                </Menu.Item>
                            ))}
                        </>
                </Menu.Dropdown>
            </Menu>
            {menuItems.map((item, index) => {
                if (isValidElement(item.dialog)) {
                    return React.cloneElement(item.dialog as ReactElement, {
                        key: index,
                        open: openDialogIndex === index,
                        handleClose: () => setOpenDialogIndex(null),
                    });
                }
                return null;
            })}
        </>
    );
}

export default TableDropDownPlugin;
