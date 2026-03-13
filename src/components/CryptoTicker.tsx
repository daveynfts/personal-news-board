import Image from 'next/image';

interface CoinData {
    id: string;
    symbol: string;
    name: string;
    priceUsd: string;
    changePercent24Hr: string;
}

const fallbackData: CoinData[] = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', priceUsd: '95245.20', changePercent24Hr: '1.25' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', priceUsd: '3450.10', changePercent24Hr: '2.10' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', priceUsd: '185.34', changePercent24Hr: '4.50' },
    { id: 'binance-coin', symbol: 'BNB', name: 'BNB', priceUsd: '620.00', changePercent24Hr: '-0.50' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', priceUsd: '1.85', changePercent24Hr: '12.40' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', priceUsd: '0.42', changePercent24Hr: '-1.20' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', priceUsd: '0.98', changePercent24Hr: '3.10' },
    { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', priceUsd: '45.70', changePercent24Hr: '0.80' },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', priceUsd: '21.50', changePercent24Hr: '-2.10' },
    { id: 'polkadot', symbol: 'DOT', name: 'Polkadot', priceUsd: '8.90', changePercent24Hr: '1.10' },
];

async function getCryptoData(): Promise<CoinData[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch('https://api.coincap.io/v2/assets?limit=20', {
            next: { revalidate: 60 },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Failed to fetch crypto data');
        const json = await res.json();
        return json.data;
    } catch {
        // Silently fallback - this is expected when offline or API is unreachable
        return fallbackData;
    }
}

export default async function CryptoTicker() {
    const coins = await getCryptoData();

    if (!coins || coins.length === 0) return null;

    return (
        <div className="crypto-ticker-container">
            <div className="crypto-ticker-track">
                {coins.map((coin) => {
                    const price = parseFloat(coin.priceUsd);
                    const change = parseFloat(coin.changePercent24Hr);
                    const isPositive = change >= 0;

                    return (
                        <div key={coin.id} className="crypto-item">
                            <Image
                                src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                                alt={coin.symbol}
                                width={20}
                                height={20}
                                className="crypto-icon"
                            />
                            <span className="crypto-name">{coin.name}</span>
                            <span className="crypto-price">${price < 0.01 ? price.toFixed(6) : price.toFixed(2)}</span>
                            <span className={`crypto-change ${isPositive ? 'positive' : 'negative'}`}>
                                {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
                {/* Duplicate the items to create a seamless infinite scroll effect */}
                {coins.map((coin) => {
                    const price = parseFloat(coin.priceUsd);
                    const change = parseFloat(coin.changePercent24Hr);
                    const isPositive = change >= 0;

                    return (
                        <div key={`dup-${coin.id}`} className="crypto-item">
                            <Image
                                src={`https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`}
                                alt={coin.symbol}
                                width={20}
                                height={20}
                                className="crypto-icon"
                            />
                            <span className="crypto-name">{coin.name}</span>
                            <span className="crypto-price">${price < 0.01 ? price.toFixed(6) : price.toFixed(2)}</span>
                            <span className={`crypto-change ${isPositive ? 'positive' : 'negative'}`}>
                                {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
