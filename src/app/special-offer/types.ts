export interface ExchangeData {
  name: string;
  badge: string;
  badgeColor: string;
  bonus: string;
  gradient: string;
  glowColor: string;
  logo: string;
  features: string[];
  link: string;
}

export interface RadarPreview {
  status: 'live' | 'upcoming' | 'hot';
  statusLabel: string;
  name: string;
  token: string;
  apr: string;
}
