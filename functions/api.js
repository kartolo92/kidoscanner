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
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'API key not configured. Please set CMC_API_KEY environment variable.' 
                })
            };
        }

        let url;
        
        // Route to appropriate CoinMarketCap endpoint
        if (path.includes('/cryptocurrencies')) {
            url = `${BASE_URL}/v1/cryptocurrency/listings/latest?limit=100`;
        } else if (path.includes('/quotes')) {
            const symbols = queryStringParameters.symbol || 'BTC,ETH,BNB';
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