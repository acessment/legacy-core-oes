import { TFunction } from "i18next";
import { ICurrentUser } from "../../../provider/types";
import { useState } from "react";
import { updateCurrentUser } from "../apis";
import { toast } from "react-toastify/unstyled";
import { gradeOptions } from "../../account/type/options";
import { TextInput, Select, Button } from "@mantine/core";

interface IAccountForm {
    user: ICurrentUser | null;
    showGrade?: boolean;
    t: TFunction<"translation", undefined>;
    onChangePasswordClick: () => void;
    contactUsPlugin?: React.ReactNode;
}

const AccountForm = (props: IAccountForm) => {
    const { user, t, onChangePasswordClick, contactUsPlugin } = props;
    const [loading, setLoading] = useState(false);
    const [contact, setContact] = useState(user?.contact || "");
    const [grade, setGrade] = useState(user?.grade || "");

    const updateUserAccount = async () => {
        const updatedUser = {
            contact: contact,
            grade: grade,
        };
        try {
            setLoading(true);
            await updateCurrentUser(updatedUser);
            toast.success(t("Account details updated successfully"));
        } catch (error) {
            console.error("Error updating account details:", error);
            toast.error(t("Failed to update account details"));
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div>
                <TextInput label={t("Username")} value={user?.username || ""} disabled onChange={() => {}} />
            </div>

            {props.showGrade && (
                <div>
                    <Select
                        label="Grade"
                        value={grade}
                        onChange={(value) => setGrade(value || "")}
                        data={gradeOptions}
                        placeholder="Select grade"
                    />
                    {contactUsPlugin}
                </div>
            )}

            <div>
                <TextInput
                    label={t("Contact")}
                    value={contact}
                    onChange={(event) => setContact(event.currentTarget.value)}
                />
            </div>

            <div className="mb-8 mt-6 gap-4 flex">
                <Button disabled={loading} onClick={updateUserAccount} type="submit" color="aceBlue" variant="filled">
                    {t("Save")}
                </Button>
                <Button onClick={onChangePasswordClick} variant="outline" color="aceBlue">
                    {t("Change Password")}
                </Button>
            </div>
        </>
    );
};

export default AccountForm;
