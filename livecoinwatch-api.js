// LiveCoinWatch Direct API Client
class LiveCoinWatchAPI {
    constructor() {
        this.apiKey = '001020d6-7b72-4246-8add-dacb61a40cb0';
        this.baseUrl = 'https://api.livecoinwatch.com';
    }

    async fetchCryptocurrencyListings() {
        try {
            const payload = {
                currency: "USD",
                sort: "rank",
                order: "ascending",
                offset: 0,
                limit: 50,
                meta: true
            };

            const response = await fetch(`${this.baseUrl}/coins/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Transform LiveCoinWatch data to match expected format
            return {
                data: data.map(coin => ({
                    id: coin.code,
                    symbol: coin.code,
                    name: coin.name || coin.code
                }))
            };
        } catch (error) {
            console.error('Error fetching cryptocurrency listings:', error);
            throw error;
        }
    }

    async fetchQuotes(cryptocurrencies) {
        const symbols = cryptocurrencies.map(crypto => crypto.symbol).join(',');
        
        try {
            const quotes = {};
            
            // Fetch each coin individually (LiveCoinWatch API limitation)
            for (const symbol of symbols.split(',')) {
                const payload = {
                    currency: "USD",
                    code: symbol.trim(),
                    meta: true
                };

                const response = await fetch(`${this.baseUrl}/coins/single`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.error(`Error fetching ${symbol}:`, response.status);
                    continue;
                }

                const data = await response.json();
                
                // Transform LiveCoinWatch data to match expected format
                quotes[symbol] = [{
                    id: data.code,
                    name: data.name || data.code,
                    symbol: data.code,
                    quote: {
                        USD: {
                            price: data.rate,
                            volume_24h: data.volume || 0,
                            market_cap: data.cap || 0,
                            percent_change_24h: ((data.delta || 1) - 1) * 100
                        }
                    }
                }];
            }

            return { data: quotes };
        } catch (error) {
            console.error('Error fetching quotes:', error);
            throw error;
        }
    }
}

// Replace the API functions with LiveCoinWatch direct calls
const liveCoinWatchAPI = new LiveCoinWatchAPI();

// Override global functions
window.fetchCryptocurrencyListings = liveCoinWatchAPI.fetchCryptocurrencyListings.bind(liveCoinWatchAPI);
window.fetchQuotes = liveCoinWatchAPI.fetchQuotes.bind(liveCoinWatchAPI);

// Also update script functions if they exist
if (typeof fetchCryptocurrencyListings !== 'undefined') {
    fetchCryptocurrencyListings = liveCoinWatchAPI.fetchCryptocurrencyListings.bind(liveCoinWatchAPI);
}

if (typeof fetchQuotes !== 'undefined') {
    fetchQuotes = liveCoinWatchAPI.fetchQuotes.bind(liveCoinWatchAPI);
}

console.log('📊 LiveCoinWatch API loaded - KidoScanner ready with real data!');