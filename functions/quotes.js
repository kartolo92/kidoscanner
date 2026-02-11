// Netlify Function for quotes
const axios = require('axios');

// Get API key from environment variables
const API_KEY = process.env.CMC_API_KEY;
const BASE_URL = 'https://pro-api.coinmarketcap.com';

exports.handler = async function(event, context) {
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
        const { queryStringParameters } = event;
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
        
        const url = `${BASE_URL}/v2/cryptocurrency/quotes/latest?symbol=${symbols}`;
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