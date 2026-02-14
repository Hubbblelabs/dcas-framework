import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionOption {
    label: string;
    text: string;
    dcas_type: "D" | "C" | "A" | "S";
}

export interface IQuestion extends Document {
    text: string;
    options: IQuestionOption[];
    active: boolean;
    tags: string[];
    version: number;
    org_id?: string;
    created_by?: mongoose.Types.ObjectId;
    updated_by?: mongoose.Types.ObjectId;
}

const QuestionSchema = new Schema<IQuestion>(
    {
        text: { type: String, required: true },
        options: [
            {
                label: { type: String, required: true },
                text: { type: String, required: true },
                dcas_type: {
                    type: String,
                    enum: ["D", "C", "A", "S"],
                    required: true,
                },
            },
        ],
        active: { type: Boolean, default: true, index: true },
        tags: [{ type: String, index: true }],
        version: { type: Number, default: 1 },
        org_id: { type: String, index: true },
        created_by: { type: Schema.Types.ObjectId, ref: "User" },
        updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

export const Question = mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
