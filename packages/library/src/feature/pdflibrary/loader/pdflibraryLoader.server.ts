import type { LoaderFunctionArgs } from "react-router";
import { dbConnect } from "@/database/mongoose.server";
import { PDFLibraryModel } from "../models/PDFLibrary";
import type { PDFLibraryDocument } from "../models/PDFLibrary";

export type PDFLibraryCardData = {
    _id: string;
    title: string;
    exercise_id: string;
    category: string;
    [key: string]: any;
};

export type PDFLibraryLoaderData = {
    documents: PDFLibraryDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    error: string | null;
};

/**
 * Server-side loader for PDFLibrary page
 * Fetches paginated documents from the Exercise collection
 * Only shows records where uploadPDFLibrary is true
 * Supports filtering by category, grades, and search
 */
export async function loader({ request }: LoaderFunctionArgs): Promise<PDFLibraryLoaderData> {
    // Authentication is handled by parent route wrapper
    // This loader only runs if user is authenticated
    
    try {
        // Parse URL for pagination and filter params
        const url = new URL(request.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
        const limit = 12; // Fixed items per page
        const skip = (page - 1) * limit;

        // Parse filter parameters
        const search = url.searchParams.get('search') || '';
        const categoriesParam = url.searchParams.get('categories') || '';
        const gradesParam = url.searchParams.get('grades') || '';

        // Build MongoDB query with AND operation for all filters
        const query: any = {
            uploadPDFLibrary: true  // Only show records from PDFLibrary migration
        };

        // Search filter (title or description)
        if (search.trim()) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter (multi-select)
        if (categoriesParam) {
            const categories = categoriesParam.split(',').filter(c => c && c !== 'All');
            if (categories.length > 0) {
                query.category = { $in: categories };
            }
        }

        // Grade filter (multi-select, check if array contains any of the selected grades)
        if (gradesParam) {
            const grades = gradesParam.split(',').filter(g => g);
            if (grades.length > 0) {
                query.grade = { $in: grades };
            }
        }

        // Connect to MongoDB (server-side only)
        await dbConnect('inst-acessment');
        
        // Get paginated documents and total count with filters
        const [documents, total] = await Promise.all([
            PDFLibraryModel.find(query).skip(skip).limit(limit).lean(),
            PDFLibraryModel.countDocuments(query)
        ]);

        // Convert ObjectId to string for serialization
        const serializedDocuments = documents.map(doc => ({
            ...doc,
            _id: doc._id.toString()
        }));

        const totalPages = Math.ceil(total / limit);
        
        return {
            documents: serializedDocuments as any,
            total,
            page,
            limit,
            totalPages,
            error: null
        };
    } catch (error) {
        console.error('MongoDB error:', error);
        return {
            documents: [],
            total: 0,
            page: 1,
            limit: 12,
            totalPages: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
