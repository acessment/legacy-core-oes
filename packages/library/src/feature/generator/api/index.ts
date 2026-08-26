import customAxios from "../../../api/customAxios";
import useSWRMutation from "swr/mutation";
import { swrFetcher } from "../../../api/httpClient";
import { toast } from "react-toastify/unstyled";
import {
    CreateExerciseRequest,
    DiyRequest,
    GeneratePdfRequest,
    GrammarExerciseRequest,
    ListeningAudioRequest,
    ListeningExerciseRequest,
    ListeningRequest,
    ListeningScriptRequest,
    ReadingArticleRequest,
    ReadingExerciseRequest,
    ReadingRequest,
    ExplanationV2Request,
} from "../type";

const generateDiyExercise = async (params: DiyRequest) => {
    const res = await customAxios.post("/generate/diy", params, {
        timeout: 1000 * 90, // 90 seconds timeout
    });
    return res.data;
};

const generateReadingExercise = async (params: ReadingExerciseRequest) => {
    const res = await customAxios.post("/generate/reading/exercise", params, {
        timeout: 1000 * 90, // 90 seconds timeout
    });
    return res.data;
};

const generateReading = async (params: ReadingRequest) => {
    const res = await customAxios.post("/generate/reading", params, {
        timeout: 1000 * 90, // 90 seconds timeout
    });
    return res.data;
};

const generateListeningExercise = async (params: ListeningExerciseRequest) => {
    const res = await customAxios.post("/generate/listening/exercise", params, {
        timeout: 1000 * 120, // 120 seconds timeout
    });
    return res.data;
};

const generateListening = async (params: ListeningRequest) => {
    const res = await customAxios.post("/generate/listening", params, {
        timeout: 1000 * 300, // 300 seconds timeout
    });
    return res.data;
};

const generateReadingArticle = async (params: ReadingArticleRequest) => {
    const res = await customAxios.post("/generate/reading/article", params, {
        timeout: 1000 * 90, // 90 seconds timeout
    });
    return res.data;
};

const generateListeningScript = async (params: ListeningScriptRequest) => {
    const res = await customAxios.post("/generate/listening/script", params, {
        timeout: 1000 * 90, // 90 seconds timeout
    });
    return res.data;
};

const getGrammarTenses = async () => {
    const res = await customAxios.get("/generate/grammar/tenses");
    return res.data;
};

const getGrammarTypes = async () => {
    const res = await customAxios.get("/generate/grammar/types");
    return res.data;
};

const generateGrammarExercise = async (params: GrammarExerciseRequest) => {
    const res = await customAxios.post("/generate/grammar/exercise", params, {
        timeout: 1000 * 60, // 60 seconds timeout
    });
    return res.data;
};

const generateListeningAudio = async (params: ListeningAudioRequest) => {
    const res = await customAxios.post("/generate/listening/audio", params, {
        timeout: 1000 * 180, // 180 seconds timeout
    });
    return res.data;
};

const generatePdf = async (params: GeneratePdfRequest) => {
    const res = await customAxios.post("/generate/pdf", params, {
        timeout: 1000 * 60, // 20 seconds timeout
    });
    return res.data;
};

const getUserGeneratorToken = async () => {
    const res = await customAxios.get("/generate/tokens");
    return res.data;
};

const createExercise = async (body: CreateExerciseRequest) => {
    const res = await customAxios.post("/exercises/", body);
    return res.data;
};

const generateExerciseClone = async (formData: FormData) => {
    const res = await customAxios.post("/generate/clone", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        timeout: 1000 * 600,
    });
    return res.data;
};

// SWR mutation fetcher for explanation/v2
const explanationV2Fetcher = async (url: string, { arg }: { arg: ExplanationV2Request }) => {
    return await swrFetcher.post(url, arg);
};

// SWR hook for explanation/v2 API
const useExplanationV2 = () => {
    const { trigger, isMutating, error, data } = useSWRMutation<string, Error, string, ExplanationV2Request>(
        "/generate/explanation",
        explanationV2Fetcher,
        {
            onSuccess: (data) => {
                // toast.success('Explanation generated successfully!');
                console.log("Explanation V2 response:", data);
            },
            onError: (error) => {
                console.error("Failed to generate explanation:", error);
            },
        }
    );

    return {
        generateExplanation: trigger,
        isGenerating: isMutating,
        error,
        data: data as string | undefined,
    };
};

export {
    generateDiyExercise,
    generateReadingExercise,
    generateListeningExercise,
    generateReadingArticle,
    generateListeningScript,
    getGrammarTenses,
    getGrammarTypes,
    generateGrammarExercise,
    generateListeningAudio,
    generatePdf,
    getUserGeneratorToken,
    generateReading,
    generateListening,
    createExercise,
    generateExerciseClone,
    useExplanationV2,
};
