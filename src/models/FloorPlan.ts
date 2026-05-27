import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFlat {
  number: string;                     // e.g. "101", "A-3"
  status: 'available' | 'sold' | 'reserved';
  bedrooms?: number;                  // e.g., 2 (for 2 BHK), 3 (for 3 BHK)
  price?: number;                     // Optional price
  notes?: string;                     // Optional private admin notes
}

export interface IFloor {
  floorNumber: number;                // e.g., 0 for Ground, 1 for 1st Floor
  floorName: string;                  // e.g., "Ground Floor", "5th Floor"
  flats: IFlat[];
}

export interface IFloorPlan extends Document {
  propertyId: mongoose.Types.ObjectId; // Reference to Property
  totalFloors: number;
  flatsPerFloor: number;
  floors: IFloor[];
  createdAt: Date;
  updatedAt: Date;
}

const FlatSchema = new Schema<IFlat>({
  number: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['available', 'sold', 'reserved'], 
    default: 'available' 
  },
  bedrooms: { type: Number },
  price: { type: Number },
  notes: { type: String }
});

const FloorSchema = new Schema<IFloor>({
  floorNumber: { type: Number, required: true },
  floorName: { type: String, required: true },
  flats: [FlatSchema]
});

const FloorPlanSchema = new Schema<IFloorPlan>(
  {
    propertyId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Property', 
      required: true, 
      unique: true,
      index: true 
    },
    totalFloors: { type: Number, required: true },
    flatsPerFloor: { type: Number, required: true },
    floors: [FloorSchema]
  },
  { timestamps: true }
);

const FloorPlan: Model<IFloorPlan> =
  mongoose.models.FloorPlan || mongoose.model<IFloorPlan>('FloorPlan', FloorPlanSchema);

export default FloorPlan;
