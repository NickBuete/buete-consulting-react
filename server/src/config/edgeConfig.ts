/**
 * Vercel Edge Config integration for feature flags
 * Provides ultra-fast (< 1ms) global configuration without database queries
 */

import { get, getAll } from '@vercel/edge-config';

interface FeatureFlags {
  maintenanceMode?: boolean;
  newBookingFlowEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  smsNotificationsEnabled?: boolean;
  calendarSyncEnabled?: boolean;
  aiAssistanceEnabled?: boolean;
}

/**
 * Get feature flag value from Edge Config
 * Falls back to environment variable if Edge Config is not available
 */
export const getFeatureFlag = async (
  key: keyof FeatureFlags,
  defaultValue: boolean = false
): Promise<boolean> => {
  try {
    // Try Edge Config first (cached at edge, no function invocation)
    const value = await get<boolean>(key);
    if (typeof value === 'boolean') {
      return value;
    }
  } catch (error) {
    // Edge Config not configured, fall back to env var
  }

  // Fallback to environment variable
  const envKey = `FEATURE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
  const envValue = process.env[envKey];
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1';
  }

  return defaultValue;
};

/**
 * Get all feature flags at once
 */
export const getAllFeatureFlags = async (): Promise<FeatureFlags> => {
  try {
    const flags = await getAll<FeatureFlags>();
    if (flags) {
      return flags;
    }
  } catch (error) {
    // Edge Config not configured
  }

  // Fallback to environment variables
  return {
    maintenanceMode: process.env.FEATURE_MAINTENANCE_MODE === 'true',
    newBookingFlowEnabled: process.env.FEATURE_NEW_BOOKING_FLOW_ENABLED === 'true',
    emailNotificationsEnabled: process.env.FEATURE_EMAIL_NOTIFICATIONS_ENABLED !== 'false',
    smsNotificationsEnabled: process.env.FEATURE_SMS_NOTIFICATIONS_ENABLED !== 'false',
    calendarSyncEnabled: process.env.FEATURE_CALENDAR_SYNC_ENABLED !== 'false',
    aiAssistanceEnabled: process.env.FEATURE_AI_ASSISTANCE_ENABLED === 'true',
  };
};

/**
 * Check if maintenance mode is active
 */
export const isMaintenanceMode = async (): Promise<boolean> => {
  return getFeatureFlag('maintenanceMode', false);
};
