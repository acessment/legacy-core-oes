import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import { CategoryEnum } from "../enum/Category.enum.js";
import { Grade } from "../enum/Grade.enum.js";

export interface IExercise extends Document {
    id: string;
    title: string;
    grade: Grade[];
    category: CategoryEnum;
    content: object;
    welcomeExercise?: boolean;
    updatedAt: Date;
    createdAt: Date;
    createdBy: string;
    updatedBy: string;
    assignDate?: Date;
    uploadPDFLibrary?: boolean;
}

const ExerciseSchema: Schema = new Schema(
    {
        title: { type: String, required: true, index: true },
        grade: { type: [String], enum: Object.values(Grade), required: true },
        category: { type: String, enum: Object.values(CategoryEnum), required: true },
        content: { type: Schema.Types.Mixed, required: true },
        welcomeExercise: { type: Boolean, default: false },
        createdBy: { type: String },
        updatedBy: { type: String },
        assignDate: { type: Date },
        uploadPDFLibrary: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                (ret as any).id = String(ret._id);
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

ExerciseSchema.index({ title: 1, welcomeExercise: 1, category: 1, grade: 1 });

// Index for auto-assignment cron job queries
ExerciseSchema.index({ autoAssigned: 1, assignDate: 1 });

export default mongoose.model<IExercise>("Exercise", ExerciseSchema, "Exercise");
