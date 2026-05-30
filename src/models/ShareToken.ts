import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShareToken extends Document {
  token: string;
  propertyId: string;
  snapshot: {
    property: Record<string, unknown>;
    floorPlan: Record<string, unknown> | null;
    plotPlan: Record<string, unknown> | null;
  };
  createdAt: Date;
  expiresAt: Date;
}

const ShareTokenSchema = new Schema<IShareToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    propertyId: {
      type: String,
      required: true,
    },
    snapshot: {
      property: { type: Schema.Types.Mixed, required: true },
      floorPlan: { type: Schema.Types.Mixed, default: null },
      plotPlan:  { type: Schema.Types.Mixed, default: null },
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL index — documents are auto-deleted after expiresAt
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

const ShareToken: Model<IShareToken> =
  mongoose.models.ShareToken ||
  mongoose.model<IShareToken>('ShareToken', ShareTokenSchema);

export default ShareToken;
