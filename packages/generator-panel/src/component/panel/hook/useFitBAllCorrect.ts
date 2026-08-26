import { useState, useEffect } from 'react';
import { IFitBQuestionSeq } from '../type';

export const useFitBAllCorrect = (questionSequence?: IFitBQuestionSeq[]) => {
    const [isCorrect, setIsCorrect] = useState<boolean>(true);

    useEffect(() => {
        const allCorrect = questionSequence?.every((blankText: IFitBQuestionSeq) => 
            blankText.type === "blank" ? blankText.is_correct ?? false : true
        ) ?? true;
        setIsCorrect(allCorrect);
    }, [questionSequence]);

    return isCorrect;
};