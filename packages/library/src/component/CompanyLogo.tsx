interface Props {
    src: string;
}
export const CompanyLogo = (props: Props) => {
    const { src } = props;
    return (
        <div className="flex items-center gap-2">
            <img
                src={src}
                className="w-12 h-12 border border-ace-border-light-gray rounded-full"
                alt="Company Logo"
            ></img>

            {!src && <p className="text-ace-text-primary-gray text-2xl font-bold">ACEssment</p>}
        </div>
    );
};
