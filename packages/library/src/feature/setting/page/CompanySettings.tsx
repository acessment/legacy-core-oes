import { Button, TextInput, Textarea } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { CompanyLogo } from "../../../component/CompanyLogo";
import { useState } from "react";
import UploadFileDialog from "../component/UploadFileDialog";

interface ICompanySettingsProps {
    data?: ICompanySettings;
}

export const CompanySettings = (props: ICompanySettingsProps) => {
    const { data } = props;
    const [openDialog, setOpenDialog] = useState(false);
    return (
        <div className="flex flex-col gap-4 w-7/12">
            <div>
                <p className="font-medium text-ace-text-primary-gray">Company Logo</p>
                <div className="flex items-center gap-4 mt-2">
                    <CompanyLogo
                        src={data?.icon ? `${data.icon}` : "/image/logo-material/ace_production_white.png"}
                    ></CompanyLogo>
                    <Button
                        variant="light"
                        leftSection={<IconUpload size={16} />}
                        size="sm"
                        onClick={() => setOpenDialog(true)}
                    >
                        Update
                    </Button>
                </div>
            </div>
            <p className="font-medium text-ace-text-primary-gray">Footer Text</p>
            <TextInput
                value={data?.footerText ? data.footerText : ""}
                onChange={() => {}}
                className="w-full"
                disabled
                placeholder="Enter footer text"
            />

            <p className="font-medium text-ace-text-primary-gray">Company Description</p>
            <Textarea
                disabled
                value={data?.description ? data.description : ""}
                onChange={() => {}}
            />

            {openDialog && (
                <UploadFileDialog
                    open={openDialog}
                    handleClose={() => setOpenDialog(false)}
                    onUploadClick={() => setOpenDialog(false)}
                    data={data}
                />
            )}
        </div>
    );
};
