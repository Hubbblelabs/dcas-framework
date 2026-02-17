import mongoose, { Schema, Document } from "mongoose";

export interface IAssessmentTemplate extends Document {
  name: string;
  questions: mongoose.Types.ObjectId[];
  org_id?: string;
  settings: {
    time_limit?: number;
    randomized: boolean;
    shuffle_options: boolean;
    forced_response: boolean;
    language: string;
  };
  selection_method: "manual" | "random";
  question_count: number;
  active: boolean;
  isLive: boolean;
  created_by?: mongoose.Types.ObjectId;
}

const AssessmentTemplateSchema = new Schema<IAssessmentTemplate>(
  {
    name: { type: String, required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    org_id: { type: String, index: true },
    settings: {
      time_limit: { type: Number, default: 0 },
      randomized: { type: Boolean, default: false },
      shuffle_options: { type: Boolean, default: false },
      forced_response: { type: Boolean, default: true },
      language: { type: String, default: "en" },
    },
    selection_method: {
      type: String,
      enum: ["manual", "random"],
      default: "manual",
    },
    question_count: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    isLive: { type: Boolean, default: false, index: true },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

export const AssessmentTemplate =
  mongoose.models.AssessmentTemplate ||
  mongoose.model<IAssessmentTemplate>(
    "AssessmentTemplate",
    AssessmentTemplateSchema,
  );
