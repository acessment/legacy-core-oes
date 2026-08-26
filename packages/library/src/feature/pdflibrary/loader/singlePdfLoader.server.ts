import type { LoaderFunctionArgs } from "react-router";
import { dbConnect } from "../../../database/mongoose.server";
import { PDFLibraryModel, type PDFLibraryDocument } from "../models/PDFLibrary";

export type SinglePDFLoaderData = {
    document: PDFLibraryDocument | null;
    error: string | null;
};

export async function singlePdfLoader({ params }: LoaderFunctionArgs): Promise<SinglePDFLoaderData> {
    // Authentication is handled by parent route wrapper
    // This loader only runs if user is authenticated
    
    try {
        const { exercise_id } = params;

        if (!exercise_id) {
            return { document: null, error: "Exercise ID is required" };
        }

        await dbConnect('inst-acessment');
        
        const document = await PDFLibraryModel.findById(exercise_id).lean();

        if (!document) {
            return { document: null, error: "PDF not found" };
        }

        return { document, error: null };
    } catch (error) {
        console.error('MongoDB error:', error);
        return {
            document: null,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
