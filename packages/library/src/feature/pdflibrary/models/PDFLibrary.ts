import * as mongoose from 'mongoose';

/**
 * PDFLibrary Model
 * 
 * Flexible schema that accepts any fields from the Exercise collection.
 * Uses strict: false to allow dynamic fields.
 */
const PDFLibrarySchema = new mongoose.Schema({
  // Define schema as flexible since we don't know the exact fields
  // This will accept any fields from the collection
}, { 
  strict: false,  // Allow fields not defined in schema
  collection: 'Exercise'  // Explicitly set collection name
});

/**
 * PDFLibrary Model
 * Prevent model recompilation in development (hot reload)
 */
export const PDFLibraryModel = mongoose.models?.PDFLibrary || mongoose.model('PDFLibrary', PDFLibrarySchema);

/**
 * Type for PDFLibrary documents (flexible)
 */
export type PDFLibraryDocument = {
  _id: string;
  title: string;
  exercise_id: string;
  category: string;
  [key: string]: any;
};
