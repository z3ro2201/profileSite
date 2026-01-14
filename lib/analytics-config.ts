export const analyticsConfig = {
  enableTracking: true,
  enableGeoLocation: true,
  geoApiTimeout: 2000,
  adminAuthRequired: true,
  logErrors: false,
} as const;

export const config = analyticsConfig;
