// Client-safe exports only
export { default } from './page/PDFLibraryPage';
export { PDFCard } from './component/PDFCard';
// Export only types (erased at build time)
export type { PDFLibraryLoaderData, PDFLibraryCardData } from './loader/pdflibraryLoader.server';
export type { PDFLibraryDocument } from './models/PDFLibrary';

// For server-side loader and model, import from "@acessment/core-oes/server"
