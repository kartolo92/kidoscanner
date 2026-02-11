// Netlify Function for quotes
const axios = require('axios');

// Get API key from environment variables
const API_KEY = process.env.CMC_API_KEY || '001020d6-7b72-4246-8add-dacb61a40cb0';
const BASE_URL = 'https://api.livecoinwatch.com';

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
        
        // Use LiveCoinWatch API for quotes
        const symbolList = symbols.split(',');
        const quotes = {};

        for (const symbol of symbolList) {
            const payload = {
                currency: "USD",
                code: symbol.trim(),
                meta: true
            };

            try {
                const response = await axios.post(`${BASE_URL}/coins/single`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY
                    },
                    timeout: 10000
                });

                // Transform LiveCoinWatch data to match expected format
                quotes[symbol] = [{
                    id: response.data.code,
                    name: response.data.name || response.data.code,
                    symbol: response.data.code,
                    quote: {
                        USD: {
                            price: response.data.rate,
                            volume_24h: response.data.volume || 0,
                            market_cap: response.data.cap || 0,
                            percent_change_24h: ((response.data.delta || 1) - 1) * 100
                        }
                    }
                }];
            } catch (error) {
                console.error(`Error fetching ${symbol}:`, error.message);
                // Skip this symbol if there's an error
                continue;
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: quotes })
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