import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@mantine/core";

interface ToolBoxButtonProps {
  className?: string;
  icon: any;
  onClick?: () => void;
  enabled?: boolean;
  visible?: boolean;
  tooltip?: string; // tooltip text
  menuContent?: React.ReactNode; // if provided, renders a floating menu
}

const ToolBoxButton: React.FC<ToolBoxButtonProps> = ({
  className,
  icon,
  onClick,
  enabled = true,
  visible = true,
  tooltip,
  menuContent,
}) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    // Guard against SSR - only run in browser environment
    if (typeof document === 'undefined') return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!visible) return null;

  const handleButtonClick = () => {
    if (menuContent) {
      setShowMenu((prev) => !prev);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    // Wrapping div is relative so that the floating menu can be absolutely positioned.
    <div ref={wrapperRef} className="relative inline-block">
      <Tooltip label={t(tooltip || "")} position="left">
        <button
          onClick={handleButtonClick}
          disabled={!enabled}
          className={`${!enabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
          {icon}
        </button>
      </Tooltip>
      {menuContent && showMenu && (
        <div className="absolute top-0 left-[140%] bg-white shadow-lg p-2 rounded-md z-100 w-[100px]">
          {menuContent}
        </div>
      )}
    </div>
  );
};

export default ToolBoxButton;