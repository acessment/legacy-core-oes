import type { Document } from "mongoose";
import { Schema, model } from "mongoose";

export interface IGenerateRecord extends Document {
    id: string;
    userId: string;
    count: number;

    createdAt: Date;
    updatedAt: Date;
}

export const generateRecordSchema = new Schema<IGenerateRecord>(
    {
        userId: { type: String, required: true, index: true },
        count: { type: Number, required: true, default: 0 },
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
        toObject: { virtuals: true },
    }
);

// Index for efficient queries by userId
generateRecordSchema.index({ userId: 1 });

// Explicitly set collection name to "GenerateRecord"
const GenerateRecord = model<IGenerateRecord>("GenerateRecord", generateRecordSchema, "GenerateRecord");

export default GenerateRecord;
