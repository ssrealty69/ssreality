import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLocationLog from '@/models/AgentLocationLog';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in KM
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getISTDateString(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');
    const date = searchParams.get('date') || getISTDateString();

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'agentId query parameter is required' },
        { status: 400 }
      );
    }

    const pings = await AgentLocationLog.find({ agentId, date })
      .sort({ timestamp: 1 })
      .lean();

    let totalDistanceKm = 0;
    for (let i = 1; i < pings.length; i++) {
      const prev = pings[i - 1];
      const curr = pings[i];
      const dist = calculateDistanceKm(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
      // Filter out GPS jump glitches (> 120 km/h)
      if (dist < 10) {
        totalDistanceKm += dist;
      }
    }

    return NextResponse.json({
      success: true,
      agentId,
      date,
      totalPings: pings.length,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
      path: pings.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
        speed: p.speed,
        battery: p.batteryLevel,
        status: p.status,
        timestamp: p.timestamp,
        distanceFromOfficeMeters: p.distanceFromOfficeMeters,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching tracking history:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
