import mongoose, { Schema, Document } from "mongoose";

export interface IUserResult {
  session_id?: mongoose.Types.ObjectId;
  score?: {
    raw: { D: number; C: number; A: number; S: number };
    percent: { D: number; C: number; A: number; S: number };
    primary: "D" | "C" | "A" | "S";
    secondary?: "D" | "C" | "A" | "S";
  };
  completed_at?: Date;
}

export interface IUserReport {
  pdf_path?: string;
  generated_at?: Date;
  public_link?: string;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  phone?: string;
  institution?: string;
  role: "student" | "admin" | "superadmin";
  org_id?: string;
  preferred_language?: string;
  followup_status?: "none" | "needs_followup" | "in_progress" | "completed";
  last_followup_at?: Date;
  meta: {
    batch?: string;
    roll_no?: string;
    class?: string;
    institution?: string;
    extra?: Map<string, any>;
  };
  auth_provider?: {
    type: "email" | "google" | "sso";
    provider_id?: string;
  };
  result?: IUserResult;
  report?: IUserReport;
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
    preferred_language: {
      type: String,
      default: undefined,
    },
    followup_status: {
      type: String,
      enum: ["none", "needs_followup", "in_progress", "completed"],
      default: "none",
      index: true,
    },
    last_followup_at: Date,
    password: { type: String, select: false },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    institution: { type: String, trim: true },
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
      institution: String,
      extra: { type: Map, of: String },
    },
    auth_provider: {
      type: {
        type: String,
        enum: ["email", "google", "sso"],
        default: "email",
      },
      provider_id: String,
    },
    result: {
      session_id: { type: Schema.Types.ObjectId, ref: "Session" },
      score: {
        raw: {
          D: { type: Number, default: 0 },
          C: { type: Number, default: 0 },
          A: { type: Number, default: 0 },
          S: { type: Number, default: 0 },
        },
        percent: {
          D: { type: Number, default: 0 },
          C: { type: Number, default: 0 },
          A: { type: Number, default: 0 },
          S: { type: Number, default: 0 },
        },
        primary: { type: String, enum: ["D", "C", "A", "S"] },
        secondary: { type: String, enum: ["D", "C", "A", "S"] },
      },
      completed_at: Date,
    },
    report: {
      pdf_path: String,
      generated_at: Date,
      public_link: String,
    },
    last_login: Date,
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
