import { TFunction } from "i18next";
import { ICurrentUser } from "../../../provider/types";
import { useState } from "react";
import PasswordForm from "./PasswordForm";
import AccountForm from "./AccountForm";

interface IAccountForm {
    user: ICurrentUser | null;
    t: TFunction<"translation", undefined>;
    showGrade?: boolean;
    contactUsPlugin?: React.ReactNode;
}

const AccountTab = (props: IAccountForm) => {
    const { user, t, showGrade, contactUsPlugin } = props;
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    return (
        <>
            <div className="account-settings-subform-container">
                {/* <form onSubmit={handleSubmit(onAccountSubmit)}> */}
                <div className="account-settings-textfield-div">
                    {!isChangingPassword && (
                        <AccountForm
                            user={user}
                            t={t}
                            onChangePasswordClick={() => {
                                console.log("Change password clicked");
                                setIsChangingPassword(true);
                            }}
                        showGrade={showGrade}
                        contactUsPlugin={contactUsPlugin}
                        />
                    )}
                    {isChangingPassword && <PasswordForm onChangePasswordClick={() => setIsChangingPassword(false)} />}
                </div>
            </div>
        </>
    );
};

export default AccountTab;
