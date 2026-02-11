// Netlify Function for cryptocurrency listings
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
        // Return demo data if no API key
        if (!API_KEY) {
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

        const url = `${BASE_URL}/v1/cryptocurrency/listings/latest?limit=100`;
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