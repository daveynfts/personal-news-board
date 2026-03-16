import { NextResponse } from 'next/server';

// Binance symbols → display info mapping
const COINS = [
    { symbol: 'BTCUSDT',  display: 'Bitcoin',   ticker: 'BTC' },
    { symbol: 'ETHUSDT',  display: 'Ethereum',  ticker: 'ETH' },
    { symbol: 'SOLUSDT',  display: 'Solana',    ticker: 'SOL' },
    { symbol: 'BNBUSDT',  display: 'BNB',       ticker: 'BNB' },
    { symbol: 'XRPUSDT',  display: 'XRP',       ticker: 'XRP' },
    { symbol: 'DOGEUSDT', display: 'Dogecoin',  ticker: 'DOGE' },
    { symbol: 'ADAUSDT',  display: 'Cardano',   ticker: 'ADA' },
    { symbol: 'AVAXUSDT', display: 'Avalanche', ticker: 'AVAX' },
    { symbol: 'LINKUSDT', display: 'Chainlink', ticker: 'LINK' },
    { symbol: 'DOTUSDT',  display: 'Polkadot',  ticker: 'DOT'  },
    { symbol: 'SUIUSDT',  display: 'Sui',       ticker: 'SUI'  },
    { symbol: 'TONUSDT',  display: 'TON',       ticker: 'TON'  },
];

// Always fetch fresh — client handles its own 60s refresh interval
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const symbolsParam = JSON.stringify(COINS.map(c => c.symbol));
        const url = `https://api3.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`;

        const res = await fetch(url, {
            // No Next.js cache — client's interval does the throttling
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) throw new Error(`Binance API error: ${res.status}`);

        const data: Array<{
            symbol: string;
            lastPrice: string;
            priceChangePercent: string;
        }> = await res.json();

        // Map to a clean format consumed by the ticker
        const coins = data.map(item => {
            const meta = COINS.find(c => c.symbol === item.symbol);
            return {
                id: meta?.ticker.toLowerCase() ?? item.symbol,
                symbol: meta?.ticker ?? item.symbol.replace('USDT', ''),
                name: meta?.display ?? item.symbol,
                priceUsd: item.lastPrice,
                changePercent24Hr: item.priceChangePercent,
            };
        });

        return NextResponse.json(coins, {
            // Short CDN cache — fresh enough, not hammering Binance
            headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=10' },
        });
    } catch (err) {
        console.error('[/api/crypto] fetch failed:', err);
        return NextResponse.json({ error: 'Failed to fetch crypto data' }, { status: 500 });
    }
}
