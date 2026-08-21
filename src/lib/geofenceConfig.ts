import { connectDB } from '@/lib/mongodb';
import Setting from '@/models/Setting';

export interface GeofenceSettings {
  geofenceEnabled: boolean; // Master toggle for location enforcement on Punch-In
  officeAddress: string;
  officeLat: number;
  officeLng: number;
  geofenceRadiusMeters: number;
  emergencyModeReason?: string;
  updatedAt?: string;
}

export const DEFAULT_GEOFENCE_SETTINGS: GeofenceSettings = {
  geofenceEnabled: true,
  officeAddress: 'Dalmia farm, Plot no-2, Jona Pur, Jaunapur, New Delhi, Delhi 110047',
  officeLat: 28.4624272,
  officeLng: 77.1515298,
  geofenceRadiusMeters: 200,
  emergencyModeReason: '',
};

const SETTING_KEY = 'attendance_geofence_settings';

export async function getGeofenceSettings(): Promise<GeofenceSettings> {
  await connectDB();
  try {
    const record = await Setting.findOne({ key: SETTING_KEY }).lean();
    if (!record || !record.value) {
      return { ...DEFAULT_GEOFENCE_SETTINGS };
    }
    const parsed = JSON.parse(record.value);
    return {
      ...DEFAULT_GEOFENCE_SETTINGS,
      ...parsed,
      updatedAt: (record as any).updatedAt?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching geofence settings:', error);
    return { ...DEFAULT_GEOFENCE_SETTINGS };
  }
}

export async function saveGeofenceSettings(newSettings: Partial<GeofenceSettings>): Promise<GeofenceSettings> {
  await connectDB();
  const current = await getGeofenceSettings();
  const updated: GeofenceSettings = {
    ...current,
    ...newSettings,
  };

  await Setting.findOneAndUpdate(
    { key: SETTING_KEY },
    { key: SETTING_KEY, value: JSON.stringify(updated) },
    { upsert: true, new: true }
  );

  return updated;
}
