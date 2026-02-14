import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    phone?: string;
    role: "student" | "admin" | "superadmin";
    org_id?: string;
    meta: {
        batch?: string;
        roll_no?: string;
        class?: string;
        extra?: Map<string, any>;
    };
    auth_provider?: {
        type: "email" | "google" | "sso";
        provider_id?: string;
    };
    last_login?: Date;
    created_at: Date;
    updated_at: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: { type: String, select: false },
        name: { type: String, required: true, trim: true },
        phone: { type: String, trim: true },
        role: {
            type: String,
            enum: ["student", "admin", "superadmin"],
            default: "student",
            index: true,
        },
        org_id: { type: String, index: true },
        meta: {
            batch: String,
            roll_no: String,
            class: String,
            extra: { type: Map, of: String },
        },
        auth_provider: {
            type: { type: String, enum: ["email", "google", "sso"], default: "email" },
            provider_id: String,
        },
        last_login: Date,
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
