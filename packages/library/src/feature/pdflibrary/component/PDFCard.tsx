import { IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

/* eslint-disable react/react-in-jsx-scope */
type CardContainerProps = {
    title: string;
    thumbnailURL: string;
    cardClickUrl: string;
    category?: string;
    onCardClick: (url: string) => void;

};
export const PDFCard = ({title, thumbnailURL, cardClickUrl, category, onCardClick }: CardContainerProps) => {
    const { t } = useTranslation();
    const handleCardClick = () => {
        onCardClick(cardClickUrl);
    };

    return (
        <div
            className="min-w-[200px] w-auto hover:-translate-y-1 group relative transition-transform cursor-pointer h-full"
            onClick={handleCardClick}
        >
            {/* Status badge for ML content */}

            <div className="relative h-full grid grid-rows-[245px_1fr] w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow overflow-y-hidden overflow-x-clip group-hover:shadow-xl transition-all">
                {category && (
                    <div
                        className={`absolute top-3 right-2 z-2 px-2 py-1 rounded-md font-medium text-sm ${
                            category.toLowerCase() === "grammar"
                                ? "bg-green-100 text-green-800"
                                : category.toLowerCase() === "reading"
                                ? "bg-red-100 text-red-800"
                                : category.toLowerCase() === "writing" ?
                                "bg-yellow-100 text-yellow-800"
                                : "bg-purple-100 text-purple-800"
                        }`}
                    >
                        {category}
                    </div>
                )
                }

                <img className="p-2 rounded-t-lg object-contain" src={thumbnailURL} alt="product image" />
                <div className="flex flex-col p-5 bg-white gap-2 justify-between">
                    <p className="w-full text-wrap text-xl font-semibold tracking-tight text-ace-black line-clamp-2">
                        {title.replace(/_[a-zA-Z0-9]+$/, '')}
                    </p>
                </div>
            </div>
        </div>
    );
};
