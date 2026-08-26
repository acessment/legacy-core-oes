import React from "react";

interface DragHandleProps {
  className?: string;
}

const DragHandle: React.FC<DragHandleProps> = ({ className = "" }) => {
  return (
    <div 
      className={`cursor-grab active:cursor-grabbing ${className}`}
      title="Drag to reorder"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="currentColor" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="4" cy="4" r="1.5" />
        <circle cx="4" cy="8" r="1.5" />
        <circle cx="4" cy="12" r="1.5" />
        <circle cx="12" cy="4" r="1.5" />
        <circle cx="12" cy="8" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="8" cy="4" r="1.5" />
        <circle cx="8" cy="8" r="1.5" />
        <circle cx="8" cy="12" r="1.5" />
      </svg>
    </div>
  );
};

export default DragHandle;
