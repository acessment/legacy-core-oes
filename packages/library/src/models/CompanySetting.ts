import type { Document } from "mongoose";
import { Schema, model } from "mongoose";

export interface ICompanySetting extends Document {
    id: string;
    description: string;
    footerText: string;
    icon: string;
    updatedAt: Date;
    createdAt: Date;
    createdBy: string;
    updatedBy: string;
}

const CompanySettingSchema = new Schema<ICompanySetting>(
    {
        description: { type: String },
        footerText: { type: String },
        icon: { type: String },
        createdBy: { type: String },
        updatedBy: { type: String },
    },
    { timestamps: true }
);

const CompanySetting = model<ICompanySetting>("CompanySetting", CompanySettingSchema, "CompanySetting");

export default CompanySetting;
