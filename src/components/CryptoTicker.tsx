'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface CoinData {
    id: string;
    symbol: string;
    name: string;
    priceUsd: string;
    changePercent24Hr: string;
}

// No static fallback — we never want to show 0.00% fake changes.
// The ticker stays hidden until real data arrives from Binance.

// CoinGecko icon IDs for matching symbols
const ICON_MAP: Record<string, string> = {
    BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
    XRP: 'ripple', DOGE: 'dogecoin', ADA: 'cardano', AVAX: 'avalanche-2',
    LINK: 'chainlink', DOT: 'polkadot', SUI: 'sui', TON: 'the-open-network',
};

function TickerItem({ coin, keyPrefix }: { coin: CoinData; keyPrefix: string }) {
    const price = parseFloat(coin.priceUsd);
    const change = parseFloat(coin.changePercent24Hr);
    const isPositive = change >= 0;
    const geckoId = ICON_MAP[coin.symbol] ?? coin.symbol.toLowerCase();

    return (
        <div key={`${keyPrefix}-${coin.id}`} className="crypto-item">
            <Image
                src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                alt={coin.symbol}
                width={20}
                height={20}
                className="crypto-icon"
                onError={(e) => {
                    // Fallback to CoinGecko thumb if CoinCap icon fails
                    (e.target as HTMLImageElement).src =
                        `https://img.icons8.com/color/48/${geckoId}.png`;
                }}
            />
            <span className="crypto-name">{coin.name}</span>
            <span className="crypto-price">
                ${price < 0.01 ? price.toFixed(6) : price < 1 ? price.toFixed(4) : price.toFixed(2)}
            </span>
            <span className={`crypto-change ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </span>
        </div>
    );
}

export default function CryptoTicker() {
    const [coins, setCoins] = useState<CoinData[]>([]);

    async function fetchPrices() {
        try {
            // Force fresh data — bypass any browser cache
            const res = await fetch('/api/crypto', {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' },
            });
            if (!res.ok) throw new Error(`API error ${res.status}`);
            const data: CoinData[] = await res.json();
            // Guard: only update if we get real % data (not zeros)
            const hasRealChanges = Array.isArray(data) &&
                data.length > 0 &&
                data.some(c => parseFloat(c.changePercent24Hr) !== 0);
            if (hasRealChanges) {
                setCoins(data);
            } else if (Array.isArray(data) && data.length > 0) {
                // Accept data even if all happen to be 0% (very unlikely)
                setCoins(data);
            }
        } catch (err) {
            console.warn('[CryptoTicker] fetch failed, keeping current data:', err);
            // Don't reset to empty — keep whatever we had before
        }
    }

    useEffect(() => {
        fetchPrices();
        // Refresh every 60 seconds
        const interval = setInterval(fetchPrices, 60_000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Show skeleton while loading to prevent layout shift
    // (never show fake 0% data, but DO reserve the space)
    if (coins.length === 0) {
        return (
            <div className="crypto-ticker-container">
                <div className="crypto-ticker-inner">
                    <div className="crypto-live-badge" style={{ opacity: 0.4 }}>
                        <span className="crypto-live-dot" style={{ animationPlayState: 'paused' }} />
                        LIVE
                    </div>
                    <div style={{ display: 'flex', gap: '24px', paddingLeft: '24px', overflow: 'hidden', flex: 1 }}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="crypto-item" style={{ opacity: 0.15 }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                                <div style={{ width: 52, height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.3)' }} />
                                <div style={{ width: 64, height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.3)' }} />
                                <div style={{ width: 42, height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="crypto-ticker-container">
            <div className="crypto-ticker-inner">
                {/* Live indicator badge */}
                <div className="crypto-live-badge">
                    <span className="crypto-live-dot" />
                    LIVE
                </div>

                {/* Scrolling price track */}
                <div className="crypto-ticker-track">
                    {coins.map(coin => <TickerItem key={coin.id} coin={coin} keyPrefix="a" />)}
                    {/* Duplicate for seamless infinite scroll */}
                    {coins.map(coin => <TickerItem key={`dup-${coin.id}`} coin={coin} keyPrefix="b" />)}
                </div>
            </div>
        </div>
    );
}
