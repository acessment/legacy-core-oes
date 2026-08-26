import UserIcon from "../icon/UserIcon";

interface SideBarAccountInfoProps {
    username?: string;
    description?: string; //School name for students, company name for teachers

}

const SideBarAccountInfo = ({ username, description }: SideBarAccountInfoProps) => {
    return (
        <div className="flex items-center gap-4 px-3">
            <UserIcon username={username}></UserIcon>
            <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm text-ace-text-primary-gray font-medium truncate">{username}</p>
                <p className="text-sm text-ace-text-secondary-gray truncate">{description}</p>
            </div>
        </div>
    )
}

export default SideBarAccountInfo;
