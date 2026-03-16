import { NextResponse } from 'next/server';

// Binance symbol → display info mapping
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
    { symbol: 'DOTUSDT',  display: 'Polkadot',  ticker: 'DOT' },
    { symbol: 'SUIUSDT',  display: 'Sui',       ticker: 'SUI' },
    { symbol: 'TONUSDT',  display: 'TON',       ticker: 'TON' },
];

// CoinGecko IDs for fallback
const COINGECKO_IDS = 'bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano,avalanche-2,chainlink,polkadot,sui,the-open-network';

export const dynamic = 'force-dynamic';

// ── Attempt Binance (multiple endpoints) ─────────────────────────────────────
async function fetchBinance(): Promise<{ id: string; symbol: string; name: string; priceUsd: string; changePercent24Hr: string }[]> {
    const symbolsParam = JSON.stringify(COINS.map(c => c.symbol));
    // Try multiple Binance hosts — api3 is often blocked outside Asia
    const hosts = ['api.binance.com', 'api1.binance.com', 'api2.binance.com', 'api3.binance.com'];

    for (const host of hosts) {
        try {
            const url = `https://${host}/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`;
            const res = await fetch(url, {
                cache: 'no-store',
                signal: AbortSignal.timeout(4000),
            });
            if (!res.ok) continue;

            const data: Array<{ symbol: string; lastPrice: string; priceChangePercent: string }> = await res.json();

            return data.map(item => {
                const meta = COINS.find(c => c.symbol === item.symbol);
                return {
                    id:                 meta?.ticker.toLowerCase() ?? item.symbol,
                    symbol:             meta?.ticker ?? item.symbol.replace('USDT', ''),
                    name:               meta?.display ?? item.symbol,
                    priceUsd:           item.lastPrice,
                    changePercent24Hr:  item.priceChangePercent,
                };
            });
        } catch {
            // Try next host
            continue;
        }
    }
    throw new Error('All Binance endpoints failed');
}

// ── CoinGecko fallback (always free, no key needed) ───────────────────────────
async function fetchCoinGecko(): Promise<{ id: string; symbol: string; name: string; priceUsd: string; changePercent24Hr: string }[]> {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);

    const data: Record<string, { usd: number; usd_24h_change: number }> = await res.json();

    // Map CoinGecko IDs → our display format
    const geckoToMeta: Record<string, { ticker: string; name: string }> = {
        'bitcoin':            { ticker: 'BTC',  name: 'Bitcoin'   },
        'ethereum':           { ticker: 'ETH',  name: 'Ethereum'  },
        'solana':             { ticker: 'SOL',  name: 'Solana'    },
        'binancecoin':        { ticker: 'BNB',  name: 'BNB'       },
        'ripple':             { ticker: 'XRP',  name: 'XRP'       },
        'dogecoin':           { ticker: 'DOGE', name: 'Dogecoin'  },
        'cardano':            { ticker: 'ADA',  name: 'Cardano'   },
        'avalanche-2':        { ticker: 'AVAX', name: 'Avalanche' },
        'chainlink':          { ticker: 'LINK', name: 'Chainlink' },
        'polkadot':           { ticker: 'DOT',  name: 'Polkadot'  },
        'sui':                { ticker: 'SUI',  name: 'Sui'       },
        'the-open-network':   { ticker: 'TON',  name: 'TON'       },
    };

    return Object.entries(data).map(([geckoId, prices]) => {
        const meta = geckoToMeta[geckoId] ?? { ticker: geckoId.toUpperCase(), name: geckoId };
        return {
            id:                meta.ticker.toLowerCase(),
            symbol:            meta.ticker,
            name:              meta.name,
            priceUsd:          prices.usd.toString(),
            changePercent24Hr: (prices.usd_24h_change ?? 0).toFixed(3),
        };
    });
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET() {
    let coins;
    let source = 'binance';

    try {
        coins = await fetchBinance();
    } catch (binanceErr) {
        console.warn('[/api/crypto] Binance failed, trying CoinGecko:', binanceErr);
        source = 'coingecko';
        try {
            coins = await fetchCoinGecko();
        } catch (geckoErr) {
            console.error('[/api/crypto] Both sources failed:', geckoErr);
            return NextResponse.json(
                { error: 'All price sources unavailable' },
                { status: 503 }
            );
        }
    }

    console.log(`[/api/crypto] Fetched ${coins.length} coins from ${source}`);

    return NextResponse.json(coins, {
        headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=10',
            'X-Price-Source': source,
        },
    });
}
