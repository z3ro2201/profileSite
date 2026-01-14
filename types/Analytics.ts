export interface VisitorData {
  visitor_id: string;
  session_id: string;
  page_path: string;
  referrer: string;
  user_agent: string;
  device_type: string;
  browser: string;
  os: string;
  screen_resolution: string;
  language: string;
}

export interface PageViewStat {
  page_path: string;
  views: number;
  unique_visitors: number;
}

export interface ReferrerStat {
  source: string;
  visits: number;
  unique_visitors: number;
}

export interface DeviceStat {
  device_type: string | null;
  count: number;
  unique_visitors: number;
}

export interface BrowserStat {
  browser: string | null;
  count: number;
}

export interface OSStat {
  os: string | null;
  count: number;
}

export interface CountryStat {
  country: string;
  visits: number;
  unique_visitors: number;
}

export interface HourlyStat {
  hour: number;
  visits: number;
}

export interface RecentVisit {
  id: string;
  visitor_id: string;
  session_id: string;
  page_path: string;
  referrer: string;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  visited_at: Date;
}

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  sessions: number;
  avgPagesPerSession: string;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  pageViews: PageViewStat[];
  referrers: ReferrerStat[];
  devices: DeviceStat[];
  browsers: BrowserStat[];
  operatingSystems: OSStat[];
  countries: CountryStat[];
  hourlyStats: HourlyStat[];
  recentVisits: RecentVisit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type PeriodType = "today" | "yesterday" | "week" | "month" | "year";

export interface GeoLocation {
  status: string;
  country?: string;
  city?: string;
}
