// this file will determine which view to render based on the screen width

import MExerciseContentTemplate from "./mobile/MExerciseContentTemplate";
import { type IExerciseContentJsonData } from "../type";
import { useState, useEffect, useRef } from "react";
import { UtilityAction } from "../reducer/actionTypes";
import ExerciseContentTemplate from "./desktop/exerciseContentTemplate";
import { Button } from "@mantine/core";

interface IMainPanelWrapperProps {
    logoUrl?: string;
    logoSize?: number;
    headerText?: string;
    showUtility: boolean;
    showMarkingUtility: boolean;
    isExerciseView: boolean;
    isViewMarking: boolean;
    jsonData: IExerciseContentJsonData;
    dispatch: React.Dispatch<UtilityAction>;
}
    

const MainPanelWrapper = ({ logoUrl, logoSize, headerText, showUtility, showMarkingUtility, isExerciseView, isViewMarking, jsonData, dispatch }: IMainPanelWrapperProps) => {
    const [divWidth, setDivWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setDivWidth(entry.contentRect.width);
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const handleUpdate = (e: any, val?: string, isInnerHTML?: boolean) => {
        const id = e.target.id;
        const value =
            isInnerHTML
                ? (e.target as HTMLElement).innerHTML
                : val ?? e.target.innerText; //this will preserve the <br> tags

        dispatch({
            type: "UPDATE_CONTENT",
            payload: { id, value },
        });
    };
    return (
        <div ref={containerRef} className="w-full max-w-[210mm] mx-auto">
            {divWidth > 768 ? (
                <ExerciseContentTemplate logoUrl={logoUrl} logoSize={logoSize} headerText={headerText} data={jsonData} isExerciseView={isExerciseView} isViewMarking={isViewMarking} showUtility={showUtility} showMarkingUtility={showMarkingUtility} utilityDispatch={dispatch} handleUpdate={handleUpdate}></ExerciseContentTemplate>
            ) : (
                <MExerciseContentTemplate data={jsonData} handleUpdate={handleUpdate} showUtility={showUtility} showMarkingUtility={showMarkingUtility} isExerciseView={isExerciseView} isViewMarking={isViewMarking} utilityDispatch={dispatch}></MExerciseContentTemplate>
            )}
        </div>
    )
}
export default MainPanelWrapper;