import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLocationLog from '@/models/AgentLocationLog';
import { getGeofenceSettings } from '@/lib/geofenceConfig';

function getISTDateString(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const todayStr = getISTDateString();

    // Group by agentId and get latest ping for each agent today
    const latestPings = await AgentLocationLog.aggregate([
      { $match: { date: todayStr } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$agentId',
          agentId: { $first: '$agentId' },
          agentName: { $first: '$agentName' },
          latitude: { $first: '$latitude' },
          longitude: { $first: '$longitude' },
          status: { $first: '$status' },
          speed: { $first: '$speed' },
          batteryLevel: { $first: '$batteryLevel' },
          distanceFromOfficeMeters: { $first: '$distanceFromOfficeMeters' },
          address: { $first: '$address' },
          lastPing: { $first: '$timestamp' },
          pingCount: { $sum: 1 },
        },
      },
    ]);

    const formattedAgents = latestPings.map((doc: any) => {
      const meters = doc.distanceFromOfficeMeters || 0;
      const km = (meters / 1000).toFixed(2);
      const isInside = meters < 200;
      return {
        ...doc,
        distanceKm: Number(km),
        distanceFormatted: isInside ? `Inside Office (${meters}m)` : `${km} km away from Office`,
      };
    });

    const geofence = await getGeofenceSettings();

    return NextResponse.json({
      success: true,
      date: todayStr,
      office: {
        name: 'SS REALTY',
        address: geofence.officeAddress || 'Dalmia farm, Plot no-2, Jona Pur, Jaunapur, New Delhi, Delhi 110047',
        latitude: geofence.officeLat || 28.4624272,
        longitude: geofence.officeLng || 77.1515298,
        radiusMeters: geofence.geofenceRadiusMeters || 200,
      },
      agents: formattedAgents,
    });
  } catch (error: any) {
    console.error('Error fetching live agent tracking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
