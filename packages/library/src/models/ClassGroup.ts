import type { Document } from "mongoose";
import { Schema, model } from "mongoose";

export interface IClassGroup extends Document {
    id: string;
    name: string;
    updatedAt: Date;
    createdAt: Date;
    createdBy: string;
    updatedBy: string;
}

const ClassGroupSchema = new Schema<IClassGroup>(
    {
        name: { type: String, required: true },
        createdBy: { type: String },
        updatedBy: { type: String },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                ret.id = String(ret._id);
                // @ts-expect-error - Deleting _id property from Mongoose document
                delete ret._id;
                delete (ret as any).__v;
                return ret;
            },
        },
        toObject: { virtuals: true },
    }
);
ClassGroupSchema.index({ institutionId: 1 });

ClassGroupSchema.index({ institutionId: 1, name: 1 }, { unique: true });

const ClassGroup = model<IClassGroup>("ClassGroup", ClassGroupSchema, "ClassGroup");

export default ClassGroup;
