import { PaymentStatusEnum } from "@/enum/PaymentStatus.enum";
import { RoleEnum } from "@/enum/RoleEnum";
import { SubscriptionPlanEnum } from "@/enum/SubscriptionPlan.enum";
import { UserStatusEnum } from "@/enum/UserStatus.enum";
import type { Document } from "mongoose";
import mongoose, { Schema, model } from "mongoose";
import Stripe from "stripe";

export interface IUser extends Document {
    id: string;
    username: string;
    roles: RoleEnum[];
    contact: string;
    status: UserStatusEnum;
    classGroupId: Schema.Types.ObjectId[];
    schoolId: Schema.Types.ObjectId;
    grade: string;
    addedClaims: boolean;
    pwResetAt: Date;
    pwResetBy: string;
    updatedAt: Date;
    createdAt: Date;
    createdBy: string;
    updatedBy: string;
    subscriptions?: ISubscription[];
}

export interface ISubscription {
    sessionId: string;
    subscriptionId: string | null;
    productIds: string[];
    customerId: string;
    status: PaymentStatusEnum;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    canceledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true },
        roles: [
            {
                type: String,
                enum: Object.values(RoleEnum),
                default: [RoleEnum.USER],
            },
        ],
        contact: { type: String },
        status: {
            type: String,
            enum: Object.values(UserStatusEnum),
            required: true,
        },
        classGroupId: [
            {
                type: Schema.Types.ObjectId,
                ref: "ClassGroup",
            },
        ],
        schoolId: {
            type: Schema.Types.ObjectId,
            ref: "School",
        },
        grade: { type: String },
        addedClaims: {
            type: Boolean,
            default: false,
        },
        pwResetAt: {
            type: Date,
        },
        pwResetBy: {
            type: String,
        },
        createdBy: { type: String },
        updatedBy: { type: String },
        // Embedded array of subscription
        subscriptions: {
            type: [
                {
                    sessionId: { type: String, required: true },
                    subscriptionId: { type: String, default: null },
                    customerId: { type: String, required: true },
                    productIds: { type: [String], required: true },
                    status: {
                        type: String,
                        enum: Object.values(PaymentStatusEnum),
                        required: true,
                    },
                    currentPeriodStart: { type: Date, default: null },
                    currentPeriodEnd: { type: Date, default: null },
                    cancelAtPeriodEnd: { type: Boolean, required: true },
                    canceledAt: { type: Date, default: null },
                    createdAt: { type: Date, required: true },
                    updatedAt: { type: Date, required: true },
                },
            ],
        },
    },
    {
        timestamps: true,
        _id: false,
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
userSchema.index({ schoolId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ classGroupId: 1 });
userSchema.index({ username: 1, schoolId: 1, status: 1 });
// Indexes for embedded payment queries
userSchema.index({ "subscriptions.subscriptionId": 1 });
userSchema.index({ "subscriptions.status": 1 });
userSchema.index({ "subscriptions.productIds": 1 });

// userSchema.plugin(AuditPlugin, {
//     entityType: AuditEntityType.USER,
//     identifierField: ["username"],
//     omitFields: ["updatedAt", "createdAt", "id", "_id", "__v", "roles"],
// });

// Explicitly set collection name to "User" (overriding Mongoose's auto-pluralization)
// Check if model exists to prevent HMR recompilation errors in development
const User = mongoose.models.User || model<IUser>("User", userSchema, "User");

export default User;
