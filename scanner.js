// KidoScanner Frontend JavaScript
class KidoScanner {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://pro-api.coinmarketcap.com';
        this.demoMode = true;
        this.init();
    }

    async init() {
        // Try to get API key from multiple sources for Netlify compatibility
        this.apiKey = this.getApiKey();
        
        // Check if we should use demo mode
        const urlParams = new URLSearchParams(window.location.search);
        this.demoMode = urlParams.get('demo') !== 'false' && !this.apiKey;
        
        console.log('KidoScanner initialized', { 
            demoMode: this.demoMode,
            hasApiKey: !!this.apiKey 
        });
    }

    getApiKey() {
        // Try multiple sources for the API key
        // 1. Netlify environment variable (injected during build)
        if (typeof window !== 'undefined' && window.CMC_API_KEY) {
            return window.CMC_API_KEY;
        }
        
        // 2. Global variable from script injection
        if (typeof window !== 'undefined' && window.NETLIFY_API_KEY) {
            return window.NETLIFY_API_KEY;
        }
        
        // 3. Hardcoded fallback (for demo purposes)
        return '141234c09b9d4da5b8921dd2c1ba328f';
    }

    async fetchCryptocurrencies() {
        if (this.demoMode) {
            return this.getDemoCryptocurrencies();
        }

        try {
            const response = await fetch(`${this.baseUrl}/v1/cryptocurrency/listings/latest?limit=100`, {
                headers: {
                    'X-CMC_PRO_API_KEY': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching cryptocurrencies:', error);
            // Fallback to demo data
            return this.getDemoCryptocurrencies();
        }
    }

    async fetchQuotes(symbols) {
        if (this.demoMode) {
            return this.getDemoQuotes(symbols);
        }

        try {
            const response = await fetch(`${this.baseUrl}/v2/cryptocurrency/quotes/latest?symbol=${symbols}`, {
                headers: {
                    'X-CMC_PRO_API_KEY': this.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching quotes:', error);
            // Fallback to demo data
            return this.getDemoQuotes(symbols);
        }
    }

    getDemoCryptocurrencies() {
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
            { id: 4687, symbol: 'UNI', name: 'Uniswap' }
        ];

        return { data: cryptocurrencies };
    }

    getDemoQuotes(symbols) {
        const symbolList = symbols.split(',');
        const quotes = {};

        symbolList.forEach(symbol => {
            const basePrice = Math.random() * 1000 + 1;
            const volume24h = Math.random() * 1000000000;
            const marketCap = Math.random() * 50000000000;
            const priceChange24h = (Math.random() - 0.5) * 20;

            quotes[symbol] = [{
                id: Math.floor(Math.random() * 10000),
                name: `${symbol} Token`,
                symbol: symbol.trim(),
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

        return { data: quotes };
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: price < 1 ? 6 : 2
        }).format(price);
    }

    formatVolume(volume) {
        if (volume >= 1e9) {
            return `$${(volume / 1e9).toFixed(2)}B`;
        } else if (volume >= 1e6) {
            return `$${(volume / 1e6).toFixed(2)}M`;
        }
        return `$${volume.toLocaleString()}`;
    }

    getChangeClass(change) {
        return change >= 0 ? 'change-positive' : 'change-negative';
    }

    getChangeSymbol(change) {
        return change >= 0 ? '▲' : '▼';
    }
}

// Export for use in HTML files
window.KidoScanner = KidoScanner;