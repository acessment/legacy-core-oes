import { IExerciseContentJsonData } from "../../type";
import QuestionTypeEnum from "../../enum/QuestionTypeEnum";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";
import "../../css/template.css";
import FitBQuestion from "./fitBQuestion";
import PanelDataHandler from "../../utils/panelDataHandler";
import McQQuestion from "./mcqQuestion";
import TfngQuestion from "./tfngQuestion";
import SqQuestion from "./sqQuestion";
import { useEffect, useReducer, useState } from "react";
import DOMPurify from "dompurify";
import ReactHtmlParser from "html-react-parser";
import InstructionText from "./InstructionText";
import { UtilityAction } from "../../reducer/actionTypes";
import QuestionWrapper from "../QuestionWrapper";
import { ReactQuillClient } from "../ReactQuillClient";

interface Props {
    data: IExerciseContentJsonData;
    isExerciseView: boolean;
    isViewMarking?: boolean;
    showUtility: boolean;
    showMarkingUtility: boolean;
    logoUrl?: string;
    logoSize?: number;
    headerText?: string;
    utilityDispatch: React.Dispatch<UtilityAction>;
    ref?: React.Ref<HTMLDivElement>;
    handleUpdate: (e: any, val?: string) => void;
}

const ExerciseContentTemplate = (props: Props) => {
    const {
        data,
        isExerciseView,
        isViewMarking,
        showUtility,
        showMarkingUtility,
        logoUrl,
        logoSize = 18,
        headerText,
        utilityDispatch,
        ref,
        handleUpdate,
    } = props;

    const [readingContent, setReadingContent] = useState(data.reading || "");

    const handleReadingBlur = () => {
        // Only update when user finishes editing (onBlur)
        const syntheticEvent = {
            target: {
                id: "reading",
                innerHTML: readingContent,
            },
        };
        handleUpdate(syntheticEvent, readingContent);
    };

    useEffect(() => {
        setReadingContent(data.reading || "");
    }, [data.reading]);

    useEffect(() => {
        if (data && data.questions) {
            utilityDispatch({ type: "CALCULATE_QUESTION_NUMBERS" });
            console.log(
                "ExerciseContentTemplate useEffect - question numbers calculated"
            );
        }
    }, [data, utilityDispatch]);

    // Handle drag end event using utilityDispatch
    const handleDragEnd = (result: DropResult) => {
        const { destination, source } = result;

        // If dropped outside the list or didn't move
        if (!destination || destination.index === source.index) {
            return;
        }

        utilityDispatch({
            type: "REORDER_QUESTIONS",
            payload: {
                sourceIndex: source.index,
                destinationIndex: destination.index,
            },
        });
    };

    return (
        <div ref={ref} id="panel_display">
            <div className="header">
                {logoUrl && (
                    <img className="logo-img" src={logoUrl} style={{ height: `${logoSize}px` }}></img>
                )}
            </div>
            <div className="footer">
                <span>
                    {headerText ? (
                        <>{headerText}</>
                    ) : (
                        "Quality English exercises from www.acessment.ai"
                    )}
                </span>
            </div>
            <div id="body">
                <div className="content">
                    {(showMarkingUtility || isViewMarking) && (
                        <div className="score-div">
                            <div className="score-box">
                                <p>
                                    <span>Score:</span>
                                    <span
                                        contentEditable={showMarkingUtility}
                                        onBlur={(e) => handleUpdate(e)}
                                        id="score"
                                    >
                                        {data.score}
                                    </span>
                                    <span>{data.maxScore && "/"}</span>
                                    <span
                                        contentEditable={showMarkingUtility}
                                        onBlur={(e) => handleUpdate(e)}
                                        id="maxScore"
                                    >
                                        {data.maxScore
                                            ? `${data.maxScore}`
                                            : ""}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                    <h2
                        id="title"
                        suppressContentEditableWarning={true}
                        contentEditable={showUtility}
                        onBlur={(e) => {
                            handleUpdate(e);
                        }}
                    >
                        {data.title}
                    </h2>
                    <p
                        className="py-1"
                        contentEditable={showUtility}
                        id="instruction"
                        onBlur={(e) => {
                            handleUpdate(e);
                        }}
                        suppressContentEditableWarning={true}
                    >
                        {data.instruction}
                    </p>

                    {data.reading && (
                        <div
                            className="panel_container panel_display"
                        >
                            {!isExerciseView && showUtility ? (
                                <ReactQuillClient
                                    theme="snow"
                                    value={readingContent}
                                    onChange={setReadingContent}
                                    onBlur={handleReadingBlur}
                                    placeholder="Enter reading content..."
                                    modules={{
                                        toolbar: [
                                            [{ header: [1, 2] }],
                                            ["bold", "italic"],
                                        ],
                                    }}
                                />
                            ) : (
                                <div
                                    className="panel_display reading_paragraph"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            data.reading?.replace(/&nbsp;/g, ' ') || ''
                                        ),
                                    }}
                                />
                            )}
                        </div>
                    )}
                    {data.options && data.options?.length !== 0 && (
                        <div className="sel-fitB-container">
                            {data.options.map((option, key) => (
                                <span
                                    key={key}
                                    contentEditable={!isExerciseView}
                                    id={`options-${key}`}
                                    onBlur={handleUpdate}
                                    className="option-fitB"
                                    suppressContentEditableWarning={true}
                                >
                                    {option}
                                </span>
                            ))}
                        </div>
                    )}

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="questions" direction="vertical">
                            {(provided) => (
                                <div
                                    className="outer_container w-full"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {data.questions?.map((question, key) => (
                                        <Draggable
                                            key={key.toString()}
                                            draggableId={key.toString()}
                                            index={key}
                                        >
                                            {(provided) => (
                                                <QuestionWrapper
                                                    showUtility={showUtility}
                                                    showMarkingUtility={
                                                        showMarkingUtility
                                                    }
                                                    isExerciseView={
                                                        isExerciseView
                                                    }
                                                    index={key}
                                                    questionType={question.type}
                                                    utilityDispatch={
                                                        utilityDispatch
                                                    }
                                                    dragHandleProps={
                                                        provided.dragHandleProps
                                                    }
                                                    draggableProps={
                                                        provided.draggableProps
                                                    }
                                                    innerRef={provided.innerRef}
                                                >
                                                    <div
                                                        key={key}
                                                        className="question_container w-full mb-4"
                                                    >
                                                        <div className="paragraph_sq w-full">
                                                            {question.type ===
                                                                QuestionTypeEnum.MCQ && (
                                                                <McQQuestion
                                                                    key={key}
                                                                    index={key}
                                                                    handleUpdate={
                                                                        handleUpdate
                                                                    }
                                                                    question={
                                                                        question
                                                                    }
                                                                    isExerciseView={
                                                                        isExerciseView
                                                                    }
                                                                    isViewMarking={
                                                                        isViewMarking
                                                                    }
                                                                    dragHandleProps={
                                                                        provided.dragHandleProps
                                                                    }
                                                                    showUtility={
                                                                        showUtility
                                                                    }
                                                                    showMarkingUtility={
                                                                        showMarkingUtility
                                                                    }
                                                                    utilityDispatch={
                                                                        utilityDispatch
                                                                    }
                                                                />
                                                            )}
                                                            {(question.type.toLowerCase() ===
                                                                QuestionTypeEnum.FITB.toLowerCase() ||
                                                                question.type ===
                                                                    QuestionTypeEnum.SELFITB ||
                                                                question.type ===
                                                                    QuestionTypeEnum.ARTFITB) && (
                                                                <FitBQuestion
                                                                    index={key}
                                                                    isQuestion={
                                                                        true
                                                                    }
                                                                    handleUpdate={
                                                                        handleUpdate
                                                                    }
                                                                    question={
                                                                        question
                                                                    }
                                                                    isExerciseView={
                                                                        isExerciseView
                                                                    }
                                                                    isViewMarking={
                                                                        isViewMarking
                                                                    }
                                                                    onDelete={(
                                                                        idx: number
                                                                    ) => {
                                                                        utilityDispatch(
                                                                            {
                                                                                type: "DELETE_QUESTION",
                                                                                payload:
                                                                                    {
                                                                                        questionIndex:
                                                                                            idx,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                    dragHandleProps={
                                                                        provided.dragHandleProps
                                                                    }
                                                                    showUtility={
                                                                        showUtility
                                                                    }
                                                                    showMarkingUtility={
                                                                        showMarkingUtility
                                                                    }
                                                                    utilityDispatch={
                                                                        utilityDispatch
                                                                    }
                                                                />
                                                            )}
                                                            {question.type ===
                                                                QuestionTypeEnum.TFNG && (
                                                                <TfngQuestion
                                                                    index={key}
                                                                    isQuestion={
                                                                        true
                                                                    }
                                                                    handleUpdate={
                                                                        handleUpdate
                                                                    }
                                                                    question={
                                                                        question
                                                                    }
                                                                    isExerciseView={
                                                                        isExerciseView
                                                                    }
                                                                    isViewMarking={
                                                                        isViewMarking
                                                                    }
                                                                    onDelete={(
                                                                        idx
                                                                    ) => {
                                                                        utilityDispatch(
                                                                            {
                                                                                type: "DELETE_QUESTION",
                                                                                payload:
                                                                                    {
                                                                                        questionIndex:
                                                                                            idx,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                    dragHandleProps={
                                                                        provided.dragHandleProps
                                                                    }
                                                                    showUtility={
                                                                        showUtility
                                                                    }
                                                                    showMarkingUtility={
                                                                        showMarkingUtility
                                                                    }
                                                                    utilityDispatch={
                                                                        utilityDispatch
                                                                    }
                                                                />
                                                            )}
                                                            {question.type ===
                                                                QuestionTypeEnum.SQ && (
                                                                <SqQuestion
                                                                    index={key}
                                                                    isQuestion={
                                                                        true
                                                                    }
                                                                    handleUpdate={
                                                                        handleUpdate
                                                                    }
                                                                    question={
                                                                        question
                                                                    }
                                                                    isExerciseView={
                                                                        isExerciseView
                                                                    }
                                                                    isViewMarking={
                                                                        isViewMarking
                                                                    }
                                                                    onDelete={(
                                                                        idx: number
                                                                    ) => {
                                                                        utilityDispatch(
                                                                            {
                                                                                type: "DELETE_QUESTION",
                                                                                payload:
                                                                                    {
                                                                                        questionIndex:
                                                                                            idx,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                    dragHandleProps={
                                                                        provided.dragHandleProps
                                                                    }
                                                                    showUtility={
                                                                        showUtility
                                                                    }
                                                                    showMarkingUtility={
                                                                        showMarkingUtility
                                                                    }
                                                                    utilityDispatch={
                                                                        utilityDispatch
                                                                    }
                                                                />
                                                            )}
                                                            {question.type ===
                                                                QuestionTypeEnum.INSTRUCTION && (
                                                                <InstructionText
                                                                    index={key}
                                                                    isQuestion={
                                                                        true
                                                                    }
                                                                    handleUpdate={
                                                                        handleUpdate
                                                                    }
                                                                    question={
                                                                        question
                                                                    }
                                                                    isExerciseView={
                                                                        isExerciseView
                                                                    }
                                                                    isViewMarking={
                                                                        isViewMarking
                                                                    }
                                                                    onDelete={(
                                                                        idx
                                                                    ) => {
                                                                        utilityDispatch(
                                                                            {
                                                                                type: "DELETE_QUESTION",
                                                                                payload:
                                                                                    {
                                                                                        questionIndex:
                                                                                            idx,
                                                                                    },
                                                                            }
                                                                        );
                                                                    }}
                                                                    dragHandleProps={
                                                                        provided.dragHandleProps
                                                                    }
                                                                    showUtility={
                                                                        showUtility
                                                                    }
                                                                    showMarkingUtility={
                                                                        showMarkingUtility
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </QuestionWrapper>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>
        </div>
    );
};

export default ExerciseContentTemplate;
