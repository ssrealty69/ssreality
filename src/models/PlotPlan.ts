import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlot {
  number: string;                     // e.g., "12", "A-15"
  status: 'available' | 'sold' | 'reserved';
  sizeGaj: number;                    // Size in Gaj
  isCorner: boolean;                  // True if corner plot
  facing?: string;                    // Facing e.g. "East"
  price?: number;                     // Optional price
  notes?: string;                     // Optional admin notes
}

export interface IBlock {
  blockName: string;                  // e.g., "Block A", "Block B"
  plots: IPlot[];
}

export interface IPlotPlan extends Document {
  propertyId: mongoose.Types.ObjectId; // Reference to Property
  blocks: IBlock[];
  createdAt: Date;
  updatedAt: Date;
}

const PlotSchema = new Schema<IPlot>({
  number: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['available', 'sold', 'reserved'], 
    default: 'available' 
  },
  sizeGaj: { type: Number, required: true },
  isCorner: { type: Boolean, default: false },
  facing: { type: String },
  price: { type: Number },
  notes: { type: String }
});

const BlockSchema = new Schema<IBlock>({
  blockName: { type: String, required: true },
  plots: [PlotSchema]
});

const PlotPlanSchema = new Schema<IPlotPlan>(
  {
    propertyId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Property', 
      required: true, 
      unique: true,
      index: true 
    },
    blocks: [BlockSchema]
  },
  { timestamps: true }
);

const PlotPlan: Model<IPlotPlan> =
  mongoose.models.PlotPlan || mongoose.model<IPlotPlan>('PlotPlan', PlotPlanSchema);

export default PlotPlan;
