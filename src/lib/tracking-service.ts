import { connectDB } from './mongodb';
import TrackingSettings, { ITrackingSettings } from '@/models/TrackingSettings';
import { getCached, setCached, invalidateCache } from './redis';

const CACHE_KEY = 'marketing_tracking_settings';
const CACHE_TTL = 86400; // 24 hours

export async function getTrackingSettings(): Promise<ITrackingSettings | null> {
  try {
    // 1. Try to fetch from Redis Cache
    const cached = await getCached<ITrackingSettings>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    // 2. Fetch from MongoDB
    await connectDB();
    let settings = await TrackingSettings.findOne().lean() as ITrackingSettings | null;

    if (!settings) {
      // Create seed settings if it doesn't exist
      settings = await TrackingSettings.create({
        isEnabled: false,
        googleTagManagerId: '',
        metaPixelId: '',
        googleAdsConversionId: '',
        googleAdsRemarketingLabel: '',
        ga4MeasurementId: '',
        enableAdvancedMatching: false,
        enableEventLog: false,
        lastUpdated: new Date(),
        updatedBy: 'System Seed'
      }) as ITrackingSettings;
    }

    // 3. Cache settings in Redis
    await setCached(CACHE_KEY, settings, CACHE_TTL);

    return settings;
  } catch (error) {
    console.error('Error fetching tracking settings:', error);
    // Fallback default in case of DB failure
    return null;
  }
}

export async function updateTrackingSettings(data: Partial<ITrackingSettings>, updatedBy: string): Promise<ITrackingSettings> {
  await connectDB();
  
  let settings = await TrackingSettings.findOne();
  if (!settings) {
    settings = new TrackingSettings();
  }

  // Update fields
  settings.isEnabled = data.isEnabled ?? settings.isEnabled;
  settings.googleTagManagerId = (data.googleTagManagerId ?? settings.googleTagManagerId)?.trim();
  settings.metaPixelId = (data.metaPixelId ?? settings.metaPixelId)?.trim();
  settings.googleAdsConversionId = (data.googleAdsConversionId ?? settings.googleAdsConversionId)?.trim();
  settings.googleAdsRemarketingLabel = (data.googleAdsRemarketingLabel ?? settings.googleAdsRemarketingLabel)?.trim();
  settings.ga4MeasurementId = (data.ga4MeasurementId ?? settings.ga4MeasurementId)?.trim();
  settings.enableAdvancedMatching = data.enableAdvancedMatching ?? settings.enableAdvancedMatching;
  settings.enableEventLog = data.enableEventLog ?? settings.enableEventLog;
  settings.lastUpdated = new Date();
  settings.updatedBy = updatedBy;

  await settings.save();

  // Invalidate Redis cache
  await invalidateCache(CACHE_KEY);

  return settings;
}
