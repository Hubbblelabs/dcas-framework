import mongoose, { Schema, Document } from "mongoose";
import "./User";
import "./AssessmentTemplate";

export interface ISessionResponse {
    question_id: mongoose.Types.ObjectId;
    selected_option_label: string;
    dcas_type: "D" | "C" | "A" | "S";
    responded_at: Date;
}

export interface ISession extends Document {
    user_id: mongoose.Types.ObjectId;
    template_id: mongoose.Types.ObjectId;
    status: "in_progress" | "completed" | "abandoned";
    started_at: Date;
    completed_at?: Date;
    responses: ISessionResponse[];
    score?: {
        raw: { D: number; C: number; A: number; S: number };
        percent: { D: number; C: number; A: number; S: number };
        primary: "D" | "C" | "A" | "S";
        secondary?: "D" | "C" | "A" | "S";
    };
    metadata: {
        ip?: string;
        user_agent?: string;
    };
    fraud_flags?: string[];
    report_id?: mongoose.Types.ObjectId;
    assigned_questions: mongoose.Types.ObjectId[];
}

const SessionSchema = new Schema<ISession>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        template_id: { type: Schema.Types.ObjectId, ref: "AssessmentTemplate", required: true, index: true },
        status: {
            type: String,
            enum: ["in_progress", "completed", "abandoned"],
            default: "in_progress",
            index: true,
        },
        started_at: { type: Date, default: Date.now },
        completed_at: Date,
        responses: [
            {
                question_id: { type: Schema.Types.Mixed, required: true },
                selected_option_label: { type: String, required: true },
                dcas_type: { type: String, enum: ["D", "C", "A", "S"], required: true },
                responded_at: { type: Date, default: Date.now },
            },
        ],
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
        metadata: {
            ip: String,
            user_agent: String,
        },
        fraud_flags: [String],
        report_id: { type: Schema.Types.ObjectId, ref: "Report" },
        assigned_questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    },
    {
        timestamps: true,
    }
);

SessionSchema.index({ user_id: 1, template_id: 1 });

export const Session = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);
