import { Tooltip } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";

interface QuestionDeleteButtonProps {
  color?: string;
  onClick: () => void;
  className?: string;
}

const QuestionDeleteButton: React.FC<QuestionDeleteButtonProps> = ({
    className,
  color = "currentColor",
  onClick,
}) => {
  const { t } = useTranslation();
  return (
      <Tooltip label={t("Delete question")}>
          <button
              onClick={onClick}
              className={`absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center group:opacity-0 group-hover:opacity-25 duration-200 z-10 text-red-500 hover:bg-red-50 hover:opacity-100! transition-opacity ${className}`}
              aria-label="Delete question"
          >
              <svg
                  width="24"
                  height="24"
                  viewBox="0 0 63 63"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
              >
                  <path
                      d="M11.041 18.3107L52.4931 18.3107"
                      stroke={color}
                      strokeWidth="4.14521"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />
                  <path
                      d="M26.5859 28.6737L26.5859 44.2182"
                      stroke={color}
                      strokeWidth="4.14521"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />
                  <path
                      d="M36.9487 28.6737L36.9487 44.2182"
                      stroke={color}
                      strokeWidth="4.14521"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />
                  <path
                      d="M13.6318 18.3107L16.2226 49.3997C16.2226 50.774 16.7685 52.0919 17.7402 53.0636C18.7119 54.0353 20.0299 54.5813 21.4041 54.5813H42.1301C43.5044 54.5813 44.8223 54.0353 45.794 53.0636C46.7658 52.0919 47.3117 50.774 47.3117 49.3997L49.9024 18.3107"
                      stroke={color}
                      strokeWidth="4.14521"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />
                  <path
                      d="M23.9951 18.3107L23.9951 10.5384C23.9951 9.85128 24.2681 9.19231 24.7539 8.70645C25.2398 8.22059 25.8988 7.94763 26.5859 7.94763L36.9489 7.94763C37.636 7.94763 38.295 8.22059 38.7808 8.70645C39.2667 9.19231 39.5397 9.85128 39.5397 10.5384V18.3107"
                      stroke={color}
                      strokeWidth="4.14521"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />
              </svg>
          </button>
      </Tooltip>
  );
};

export default QuestionDeleteButton;
