import { useState, useEffect, useCallback } from 'react';
import { ExchangeData, RadarPreview } from '../types';

const defaultExchanges: ExchangeData[] = [];
const defaultRadarPreviews: RadarPreview[] = [];

export function useCryptoData() {
  const [exchanges, setExchanges] = useState<ExchangeData[]>(defaultExchanges);
  const [radarPreviews, setRadarPreviews] = useState<RadarPreview[]>(defaultRadarPreviews);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/exchanges', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setExchanges(data.map((ex: any) => ({
          ...ex,
          features: (() => { try { return typeof ex.features === 'string' ? JSON.parse(ex.features) : ex.features; } catch { return []; } })(),
        })));
      }
    } catch { /* use defaults */ }

    try {
      const res = await fetch('/api/crypto-events', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const statusMap: Record<string, string> = { live: 'LIVE', upcoming: 'UPCOMING', ended: 'ENDED' };
        setRadarPreviews(data.slice(0, 3).map((ev: any) => ({
          status: ev.status === 'live' ? 'live' : ev.status === 'upcoming' ? 'upcoming' : 'hot',
          statusLabel: statusMap[ev.status] || 'HOT',
          name: `${ev.platform} ${ev.eventType}`,
          token: `$${ev.tokenSymbol}`,
          apr: ev.apr ? `Est. APR: ${ev.apr}` : '',
        })));
      }
    } catch { /* use defaults */ }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  return { exchanges, radarPreviews };
}
