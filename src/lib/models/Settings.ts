import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
    key: string;
    value: any;
    description?: string;
    updatedAt?: Date;
}

const SettingsSchema = new Schema<ISettings>(
    {
        key: { type: String, required: true, unique: true, index: true },
        value: { type: Schema.Types.Mixed, required: true },
        description: { type: String },
    },
    {
        timestamps: true,
    }
);

export const Settings = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export const SETTINGS_KEYS = {
    TOTAL_QUESTIONS: "total_questions",
    ASSESSMENT_TIME_LIMIT: "assessment_time_limit",
    ALLOW_GUEST_ASSESSMENTS: "allow_guest_assessments",
    REQUIRE_EMAIL: "require_email",
    SITE_NAME: "site_name",
    DCAS_NAMES: "dcas_names",
};
