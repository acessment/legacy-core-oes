import { type IExerciseContentJsonData } from "../../type";
import QuestionTypeEnum from "../../enum/QuestionTypeEnum";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";
import MMcqQuestion from "./MMcqQuestion";
import MFitBQuestion from "./MFitBQuestion";
import MSqQuestion from "./MSqQuestion";
import MTFNGQuestion from "./MTFNGQuestion";
import MInstructionText from "./MInstructionText";
import QuestionWrapper from "../QuestionWrapper";
import { useEffect, useState } from "react";
import { UtilityAction } from "../../reducer/actionTypes";
import { ReactQuillClient } from "../ReactQuillClient";

interface Props {
    data: IExerciseContentJsonData;
    logoUrl?: string;
    headerText?: string;
    isExerciseView?: boolean;
    isViewMarking?: boolean;
    showUtility?: boolean;
    showMarkingUtility?: boolean;
    handleUpdate: (e: any, val?: string) => void;
    utilityDispatch: React.Dispatch<UtilityAction>;
}

const MExerciseContentTemplate = ({
    data,
    isExerciseView,
    isViewMarking,
    showUtility,
    showMarkingUtility,
    handleUpdate,
    utilityDispatch,
    logoUrl,
    headerText,
}: Props) => {
    const [readingContent, setReadingContent] = useState(data.reading || "");

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex !== destinationIndex) {
            utilityDispatch({
                type: "REORDER_QUESTIONS",
                payload: {
                    sourceIndex,
                    destinationIndex,
                },
            });
        }
    };

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
                "MExerciseContentTemplate useEffect - question numbers calculated"
            );
        }
    }, [data, utilityDispatch]);
    return (
        <div className="flex flex-col gap-4">
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
                                {data.maxScore ? `${data.maxScore}` : ""}
                            </span>
                        </p>
                    </div>
                </div>
            )}
            <h2
                id="title"
                contentEditable={showUtility}
                className="font-semibold text-xl"
                onBlur={(e) => handleUpdate(e)}
                style={{ fontFamily: "inherit" }}
            >
                {data.title || ""}
            </h2>
            <p
                id="instruction"
                contentEditable={showUtility}
                className="font-semibold text-base"
                onBlur={(e) => handleUpdate(e)}
                style={{ fontFamily: "inherit" }}
            >
                {data.instruction || ""}
            </p>
            {data.options && data.options?.length !== 0 && (
                <div className="sel-fitB-container">
                    {data.options.map((option, key) => (
                        <span
                            key={key}
                            contentEditable={showUtility}
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
            {data.reading && (
                <div className="panel_reading" id="">
                    {showUtility ? (
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
                            className="panel_reading reading_paragraph"
                            dangerouslySetInnerHTML={{
                                __html: data.reading?.replace(/&nbsp;/g, ' ') || "",
                            }}
                        />
                    )}
                </div>
            )}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions" direction="vertical">
                    {(provided) => (
                        <div
                            className="w-full"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {data?.questions?.map((question, key) => (
                                <Draggable
                                    key={key.toString()}
                                    draggableId={key.toString()}
                                    index={key}
                                >
                                    {(provided) => (
                                        <QuestionWrapper
                                            questionType={question.type}
                                            showUtility={showUtility}
                                            showMarkingUtility={
                                                showMarkingUtility
                                            }
                                            isExerciseView={isExerciseView}
                                            index={key}
                                            utilityDispatch={utilityDispatch}
                                            dragHandleProps={
                                                provided.dragHandleProps
                                            }
                                            draggableProps={
                                                provided.draggableProps
                                            }
                                            innerRef={provided.innerRef}
                                        >
                                            {question.type ==
                                                QuestionTypeEnum.MCQ && (
                                                <MMcqQuestion
                                                    key={key}
                                                    index={key}
                                                    question={question}
                                                    isExerciseView={
                                                        isExerciseView
                                                    }
                                                    isViewMarking={
                                                        isViewMarking
                                                    }
                                                    showUtility={showUtility}
                                                    showMarkingUtility={
                                                        showMarkingUtility
                                                    }
                                                    handleUpdate={handleUpdate}
                                                    utilityDispatch={
                                                        utilityDispatch
                                                    }
                                                />
                                            )}
                                            {question.type ==
                                                QuestionTypeEnum.FITB && (
                                                <MFitBQuestion
                                                    key={key}
                                                    index={key}
                                                    question={question}
                                                    isExerciseView={
                                                        isExerciseView
                                                    }
                                                    isViewMarking={
                                                        isViewMarking
                                                    }
                                                    showUtility={showUtility}
                                                    showMarkingUtility={
                                                        showMarkingUtility
                                                    }
                                                    handleUpdate={handleUpdate}
                                                    utilityDispatch={
                                                        utilityDispatch
                                                    }
                                                />
                                            )}
                                            {question.type ==
                                                QuestionTypeEnum.SQ && (
                                                <MSqQuestion
                                                    key={key}
                                                    index={key}
                                                    question={question}
                                                    isExerciseView={
                                                        isExerciseView
                                                    }
                                                    isViewMarking={
                                                        isViewMarking
                                                    }
                                                    showUtility={showUtility}
                                                    showMarkingUtility={
                                                        showMarkingUtility
                                                    }
                                                    handleUpdate={handleUpdate}
                                                    utilityDispatch={
                                                        utilityDispatch
                                                    }
                                                />
                                            )}
                                            {question.type ==
                                                QuestionTypeEnum.TFNG && (
                                                <MTFNGQuestion
                                                    key={key}
                                                    index={key}
                                                    question={question}
                                                    isExerciseView={
                                                        isExerciseView
                                                    }
                                                    isViewMarking={
                                                        isViewMarking
                                                    }
                                                    showUtility={showUtility}
                                                    showMarkingUtility={
                                                        showMarkingUtility
                                                    }
                                                    handleUpdate={handleUpdate}
                                                    utilityDispatch={
                                                        utilityDispatch
                                                    }
                                                />
                                            )}
                                            {question.type ==
                                                QuestionTypeEnum.INSTRUCTION && (
                                                <MInstructionText
                                                    key={key}
                                                    index={key}
                                                    question={question}
                                                    isExerciseView={
                                                        isExerciseView
                                                    }
                                                    isViewMarking={
                                                        isViewMarking
                                                    }
                                                    showUtility={showUtility}
                                                    showMarkingUtility={
                                                        showMarkingUtility
                                                    }
                                                    handleUpdate={handleUpdate}
                                                    utilityDispatch={
                                                        utilityDispatch
                                                    }
                                                />
                                            )}
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
    );
};

export default MExerciseContentTemplate;
