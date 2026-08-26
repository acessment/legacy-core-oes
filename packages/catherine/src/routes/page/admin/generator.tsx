import {
    CompleteExercisePlugin,
    DownloadJsonPlugin,
    GeneratorCorePage,
    UploadJsonPlugin,
} from "@acessment/core-oes";

export default function AdminGenerator() {
    return (
        <GeneratorCorePage
            uploadJsonPlugin={<UploadJsonPlugin size="xs" />}
            downloadJsonPlugin={<DownloadJsonPlugin />}
            completeExercisePlugin={<CompleteExercisePlugin />}
        />
    );
}
