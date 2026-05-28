import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrendHistoryItem {
  year: number;
  price: number;
}

export interface ILocationTrend extends Document {
  name: string;
  currentPrice: number;    // Average price per sq.ft (INR)
  cagr: number;            // Projected 5-year CAGR % (e.g. 14.5)
  connectivity: number;     // Index out of 10
  infrastructure: number;   // Index out of 10
  livability: number;       // Index out of 10
  commercialProximity: number; // Index out of 10
  growthDrivers: string[];
  verdict: string;
  trendHistory: ITrendHistoryItem[];
  lastUpdated: Date;
}

const LocationTrendSchema = new Schema<ILocationTrend>({
  name: { type: String, required: true, unique: true, index: true },
  currentPrice: { type: Number, required: true },
  cagr: { type: Number, required: true },
  connectivity: { type: Number, required: true },
  infrastructure: { type: Number, required: true },
  livability: { type: Number, required: true },
  commercialProximity: { type: Number, required: true },
  growthDrivers: { type: [String], default: [] },
  verdict: { type: String, default: '' },
  trendHistory: [
    {
      year: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  lastUpdated: { type: Date, default: Date.now }
});

const LocationTrend: Model<ILocationTrend> =
  mongoose.models.LocationTrend ||
  mongoose.model<ILocationTrend>('LocationTrend', LocationTrendSchema);

export default LocationTrend;
