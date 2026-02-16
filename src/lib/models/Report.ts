import mongoose, { Schema, Document } from "mongoose";
import "./User";

export interface IReport extends Document {
  session_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  pdf_path?: string;
  generated_at: Date;
  template_version?: string;
  public_link?: string;
  expires_at?: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    session_id: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      unique: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pdf_path: String,
    generated_at: { type: Date, default: Date.now },
    template_version: String,
    public_link: String,
    expires_at: Date,
  },
  {
    timestamps: true,
  },
);

export const Report =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
