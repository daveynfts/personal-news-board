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

const FALLBACK: CoinData[] = [
    { id: 'btc',  symbol: 'BTC',  name: 'Bitcoin',   priceUsd: '83500.00', changePercent24Hr: '0.00' },
    { id: 'eth',  symbol: 'ETH',  name: 'Ethereum',  priceUsd: '1850.00',  changePercent24Hr: '0.00' },
    { id: 'sol',  symbol: 'SOL',  name: 'Solana',    priceUsd: '120.00',   changePercent24Hr: '0.00' },
    { id: 'bnb',  symbol: 'BNB',  name: 'BNB',       priceUsd: '580.00',   changePercent24Hr: '0.00' },
    { id: 'xrp',  symbol: 'XRP',  name: 'XRP',       priceUsd: '2.10',     changePercent24Hr: '0.00' },
    { id: 'doge', symbol: 'DOGE', name: 'Dogecoin',  priceUsd: '0.18',     changePercent24Hr: '0.00' },
    { id: 'ada',  symbol: 'ADA',  name: 'Cardano',   priceUsd: '0.65',     changePercent24Hr: '0.00' },
    { id: 'avax', symbol: 'AVAX', name: 'Avalanche', priceUsd: '22.00',    changePercent24Hr: '0.00' },
    { id: 'link', symbol: 'LINK', name: 'Chainlink', priceUsd: '13.50',    changePercent24Hr: '0.00' },
    { id: 'dot',  symbol: 'DOT',  name: 'Polkadot',  priceUsd: '4.50',     changePercent24Hr: '0.00' },
];

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
    const [loaded, setLoaded] = useState(false);

    async function fetchPrices() {
        try {
            const res = await fetch('/api/crypto', { cache: 'no-store' });
            if (!res.ok) throw new Error('API error');
            const data: CoinData[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setCoins(data);
            }
        } catch {
            if (!loaded) setCoins(FALLBACK);
        } finally {
            setLoaded(true);
        }
    }

    useEffect(() => {
        fetchPrices();
        // Refresh every 60 seconds
        const interval = setInterval(fetchPrices, 60_000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (coins.length === 0) return null;

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
