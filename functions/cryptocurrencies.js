// Netlify Function for cryptocurrency listings
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
        // Use LiveCoinWatch API for cryptocurrency data
        const payload = {
            currency: "USD",
            sort: "rank",
            order: "ascending",
            offset: 0,
            limit: 50,
            meta: true
        };

        const response = await axios.post(`${BASE_URL}/coins/list`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            timeout: 10000
        });

        // Transform LiveCoinWatch data to match expected format
        const transformedData = {
            data: response.data.map(coin => ({
                id: coin.code,
                symbol: coin.code,
                name: coin.name || coin.code
            }))
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(transformedData)
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