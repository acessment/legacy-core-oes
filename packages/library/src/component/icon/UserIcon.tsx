import Avatar from "react-avatar";

interface UserIconProps {
    username?: string;
    size?: string;
}

const UserIcon = ({
    username = "defaultusername",
    size = "36"
}: UserIconProps) => {
    return (
        <Avatar
            name={username}
            size={size}
            className="rounded-full border border-ace-border-gray"
        />
    );
};

export default UserIcon;
