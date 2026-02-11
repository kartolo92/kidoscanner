// Netlify Function for CoinMarketCap API proxy
const axios = require('axios');

// Get API key from environment variables
const API_KEY = process.env.CMC_API_KEY;
const BASE_URL = 'https://pro-api.coinmarketcap.com';

exports.handler = async function(event, context) {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers
        };
    }

    try {
        const { path, queryStringParameters } = event;
        
        // Check if API key is available
        if (!API_KEY) {
            // Return demo data if no API key
            const demoData = {
                data: [
                    { id: 1, symbol: 'BTC', name: 'Bitcoin' },
                    { id: 1027, symbol: 'ETH', name: 'Ethereum' },
                    { id: 1839, symbol: 'BNB', name: 'Binance Coin' },
                    { id: 74, symbol: 'DOGE', name: 'Dogecoin' },
                    { id: 52, symbol: 'XRP', name: 'Ripple' },
                    { id: 825, symbol: 'USDT', name: 'Tether' },
                    { id: 2, symbol: 'LTC', name: 'Litecoin' },
                    { id: 2010, symbol: 'ADA', name: 'Cardano' },
                    { id: 5426, symbol: 'SOL', name: 'Solana' },
                    { id: 7083, symbol: 'AVAX', name: 'Avalanche' }
                ]
            };
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(demoData)
            };
        }

        let url;
        
        // Route to appropriate CoinMarketCap endpoint
        if (path.includes('/cryptocurrencies')) {
            url = `${BASE_URL}/v1/cryptocurrency/listings/latest?limit=100`;
        } else if (path.includes('/quotes')) {
            const symbols = queryStringParameters.symbol || 'BTC,ETH,BNB';
            
            // Return demo data if no API key
            if (!API_KEY) {
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
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ data: quotes })
                };
            }
            
            url = `${BASE_URL}/v2/cryptocurrency/quotes/latest?symbol=${symbols}`;
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Endpoint not found' })
            };
        }

        console.log(`Fetching data from: ${url}`);
        
        const response = await axios.get(url, {
            headers: {
                'X-CMC_PRO_API_KEY': API_KEY,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response.data)
        };

    } catch (error) {
        console.error('API Error:', error.message);
        
        return {
            statusCode: error.response?.status || 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to fetch data from CoinMarketCap',
                details: error.message 
            })
        };
    }
};