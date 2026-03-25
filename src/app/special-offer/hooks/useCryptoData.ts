import { useState, useEffect, useCallback } from 'react';
import { ExchangeData, RadarPreview } from '../types';

const defaultExchanges: ExchangeData[] = [
  { name: 'Binance', badge: 'Best for P2P', badgeColor: '#f0b90b', bonus: 'Up to $600 Bonus', gradient: 'linear-gradient(135deg, #f0b90b 0%, #d4a20a 50%, #b8890a 100%)', glowColor: 'rgba(240, 185, 11, 0.3)', logo: '', features: ['Lowest spot fees', '350+ cryptos', '#1 by volume'], link: '#' },
  { name: 'Bybit', badge: 'Lowest Futures Fees', badgeColor: '#f7a600', bonus: 'Up to $500 Bonus', gradient: 'linear-gradient(135deg, #f7a600 0%, #ff6b00 50%, #e85d00 100%)', glowColor: 'rgba(247, 166, 0, 0.3)', logo: '', features: ['Copy trading', 'Leveraged tokens', 'Fast execution'], link: '#' },
  { name: 'OKX', badge: 'Best for DeFi', badgeColor: '#00d4aa', bonus: 'Up to $500 Bonus', gradient: 'linear-gradient(135deg, #00d4aa 0%, #00b894 50%, #009d80 100%)', glowColor: 'rgba(0, 212, 170, 0.3)', logo: '', features: ['Web3 wallet', 'DEX aggregator', 'Earn up to 20% APY'], link: '#' },
];

const defaultRadarPreviews: RadarPreview[] = [
  { status: 'live', statusLabel: 'LIVE', name: 'Binance Launchpool', token: '$KERNEL', apr: 'Est. APR: ~45%' },
  { status: 'upcoming', statusLabel: 'UPCOMING', name: 'Binance Megadrop', token: '$SOLV', apr: 'Snapshot in 3 days' },
  { status: 'hot', statusLabel: 'HOT', name: 'Bybit Launchpool', token: '$INIT', apr: 'Est. APR: ~32%' },
];

export function useCryptoData() {
  const [exchanges, setExchanges] = useState<ExchangeData[]>(defaultExchanges);
  const [radarPreviews, setRadarPreviews] = useState<RadarPreview[]>(defaultRadarPreviews);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/exchanges');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setExchanges(data.map((ex: any) => ({
          ...ex,
          features: (() => { try { return typeof ex.features === 'string' ? JSON.parse(ex.features) : ex.features; } catch { return []; } })(),
        })));
      }
    } catch { /* use defaults */ }

    try {
      const res = await fetch('/api/crypto-events');
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
