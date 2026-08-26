import { SingleHomeworkCorePage, ScriptPassagePlugin, DownloadHomeworkPdfPlugin } from "@acessment/core-oes";

export default function UserHomeworkSingle() {
    return <SingleHomeworkCorePage readingPassagePlugin={<ScriptPassagePlugin />} downloadMarkingPDFPlugin={<DownloadHomeworkPdfPlugin buttonText="Marking"/>} />;
}
