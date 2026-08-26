import type { Document } from "mongoose";
import { Schema, model } from "mongoose";
// import AuditPlugin from "../plugins/AuditPlugin/index.js";
// import { AuditEntityType } from "../enums/auditEntityType.enum.js";

export interface ISchool extends Document {
    id: string;
    name: string;
    updatedAt: Date;
    createdAt: Date;
    createdBy: string;
    updatedBy: string;
    _currentUser?: any; // Added by AuditPlugin for tracking who made changes
}

const SchoolSchema = new Schema<ISchool>(
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
                delete (ret as any).__v;
                return ret;
            },
        },
        toObject: { virtuals: true },
    }
);

SchoolSchema.index({ name: 1 }, { unique: true });

// Correct usage: pass schema, entity type, and options (omitFields is optional)
// SchoolSchema.plugin(AuditPlugin, {
//     entityType: AuditEntityType.SCHOOL,
//     identifierField: ["name"],
//     omitFields: ["updatedAt", "createdAt", "id", "_id", "__v"],
// });

const School = model<ISchool>("School", SchoolSchema, "School");

export default School;
