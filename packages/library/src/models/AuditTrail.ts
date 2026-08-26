import type { Document } from "mongoose";
import { Schema, model } from "mongoose";
import type { AuditActionType } from "../enum/AuditActionType.enum.ts";
import { AuditEntityType } from "../enum/AuditEntityType.enum.js";

export interface IAuditTrail extends Document {
    id: string;
    refId?: string;
    entityType: AuditEntityType;
    actionBy: string;
    actionType: AuditActionType;
    action: string;
}

const AuditTrailSchema = new Schema<IAuditTrail>(
    {
        actionBy: { type: String, required: true, ref: "User" },
        entityType: {
            type: String,
            enum: Object.values(AuditEntityType),
            required: true,
        },
        actionType: {
            type: String,
            enum: ["CREATE", "UPDATE", "DELETE"],
            required: true,
        },
        action: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

AuditTrailSchema.index({ entityType: 1 });
AuditTrailSchema.index({ actionBy: 1 });
AuditTrailSchema.index({ actionType: 1 });

const AuditTrail = model<IAuditTrail>("AuditTrail", AuditTrailSchema, "AuditTrail");

export default AuditTrail;
