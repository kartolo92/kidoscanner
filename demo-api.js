// Demo API for KidoScanner - Works without server or functions
class DemoAPI {
    constructor() {
        this.demoData = this.generateDemoData();
    }

    generateDemoData() {
        const cryptocurrencies = [
            { id: 1, symbol: 'BTC', name: 'Bitcoin' },
            { id: 1027, symbol: 'ETH', name: 'Ethereum' },
            { id: 1839, symbol: 'BNB', name: 'Binance Coin' },
            { id: 74, symbol: 'DOGE', name: 'Dogecoin' },
            { id: 52, symbol: 'XRP', name: 'Ripple' },
            { id: 825, symbol: 'USDT', name: 'Tether' },
            { id: 2, symbol: 'LTC', name: 'Litecoin' },
            { id: 2010, symbol: 'ADA', name: 'Cardano' },
            { id: 5426, symbol: 'SOL', name: 'Solana' },
            { id: 7083, symbol: 'AVAX', name: 'Avalanche' },
            { id: 1831, symbol: 'DOT', name: 'Polkadot' },
            { id: 3890, symbol: 'MATIC', name: 'Polygon' },
            { id: 1975, symbol: 'LINK', name: 'Chainlink' },
            { id: 4687, symbol: 'UNI', name: 'Uniswap' },
            { id: 1958, symbol: 'TRX', name: 'TRON' }
        ];

        const quotes = {};
        
        cryptocurrencies.forEach(crypto => {
            const basePrice = this.getCryptoPrice(crypto.symbol);
            const volume24h = Math.random() * 1000000000;
            const marketCap = basePrice * (Math.random() * 1000000000 + 10000000);
            const priceChange24h = (Math.random() - 0.5) * 20;
            
            quotes[crypto.symbol] = [{
                id: crypto.id,
                name: crypto.name,
                symbol: crypto.symbol,
                quote: {
                    USD: {
                        price: basePrice,
                        volume_24h: volume24h,
                        market_cap: marketCap,
                        percent_change_24h: priceChange24h
                    }
                }
            }];
        });

        return { cryptocurrencies, quotes };
    }

    getCryptoPrice(symbol) {
        const prices = {
            'BTC': 43000 + Math.random() * 2000,
            'ETH': 2600 + Math.random() * 200,
            'BNB': 300 + Math.random() * 50,
            'DOGE': 0.08 + Math.random() * 0.02,
            'XRP': 0.5 + Math.random() * 0.1,
            'USDT': 0.999 + Math.random() * 0.002,
            'LTC': 70 + Math.random() * 10,
            'ADA': 0.4 + Math.random() * 0.1,
            'SOL': 100 + Math.random() * 20,
            'AVAX': 35 + Math.random() * 5,
            'DOT': 6 + Math.random() * 1,
            'MATIC': 0.8 + Math.random() * 0.2,
            'LINK': 14 + Math.random() * 2,
            'UNI': 6 + Math.random() * 1,
            'TRX': 0.1 + Math.random() * 0.02
        };
        return prices[symbol] || Math.random() * 1000 + 1;
    }

    async fetchCryptocurrencyListings() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.demoData.cryptocurrencies);
            }, 300 + Math.random() * 700); // Simulate network delay
        });
    }

    async fetchQuotes(symbols) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const requestedQuotes = {};
                const symbolList = symbols.split(',');
                
                symbolList.forEach(symbol => {
                    if (this.demoData.quotes[symbol]) {
                        requestedQuotes[symbol] = this.demoData.quotes[symbol];
                    }
                });
                
                resolve(requestedQuotes);
            }, 200 + Math.random() * 500); // Simulate network delay
        });
    }
}

// Replace the original API functions with demo API
const demoAPI = new DemoAPI();

// Override global API functions
window.fetchCryptocurrencyListings = demoAPI.fetchCryptocurrencyListings.bind(demoAPI);
window.fetchQuotes = demoAPI.fetchQuotes.bind(demoAPI);

// Also update the global script functions to use demo API
if (typeof fetchCryptocurrencyListings !== 'undefined') {
    fetchCryptocurrencyListings = demoAPI.fetchCryptocurrencyListings.bind(demoAPI);
}

if (typeof fetchQuotes !== 'undefined') {
    fetchQuotes = demoAPI.fetchQuotes.bind(demoAPI);
}

console.log('📊 Demo API loaded - KidoScanner ready!');