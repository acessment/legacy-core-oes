import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import { CategoryEnum } from "../enum/Category.enum.js";
import { Grade } from "../enum/Grade.enum.js";

// import AuditPlugin from "../plugins/AuditPlugin/index.js";
// import { AuditEntityType } from "../enums/auditEntityType.enum.js";

export interface IHomework extends Document {
    id: string;
    title: string;
    category: CategoryEnum;
    grade: Grade[];
    exerciseId: string;
    assignedTeacherId: string;
    assignedStudentId: string;
    startDate?: Date;
    expiryDate: Date;
    username: string;
    score: number;
    maxScore: number;
    submittedJson: object;
    submittedDate: Date;
    isDemoHomework?: Boolean;
    markingJson?: object;
    markedAt?: Date;
    markedBy?: string;
    updatedAt: Date;
    createdAt: Date;
    createdBy: string;
    updatedBy: string;
}

const HomeworkSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        category: { type: String, enum: Object.values(CategoryEnum), required: true },
        grade: { type: [String], enum: Object.values(Grade), required: true },
        exerciseId: { type: String, required: true, index: true },
        assignedTeacherId: { type: String },
        assignedStudentId: { type: String, required: true, index: true },
        startDate: { type: Date },
        expiryDate: { type: Date, required: true },
        username: { type: String },
        score: { type: Number, default: 0 },
        maxScore: { type: Number, default: 0 },
        isDemoHomework: { type: Boolean, default: false },
        submittedJson: { type: Object },
        submittedDate: { type: Date },
        markingJson: { type: Object },
        markedAt: { type: Date },
        markedBy: { type: String },
        createdBy: { type: String },
        updatedBy: { type: String },
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

// Index for getUserHomeworkList - optimizes date range + user queries
HomeworkSchema.index({ assignedStudentId: 1, startDate: 1, expiryDate: 1 });

// Index for non-subscribed users - optimizes demo homework queries
HomeworkSchema.index({ assignedStudentId: 1, isDemoHomework: 1 });

// Index for exercise-based lookups
HomeworkSchema.index({ exerciseId: 1 });

// Legacy indexes
HomeworkSchema.index({ assignedStudentId: 1 });
HomeworkSchema.index({ exerciseId: 1, assignedStudentId: 1, username: 1, category: 1, grade: 1 });

// HomeworkSchema.plugin(AuditPlugin, {
//     entityType: AuditEntityType.HOMEWORK,
//     identifierField: ["title", "username", "startDate", "expiryDate"],
//     omitFields: ["updatedAt", "createdAt", "id", "_id", "__v", "submittedJson", "markingJson"],
// });

export default mongoose.model<IHomework>("Homework", HomeworkSchema, "Homework");
