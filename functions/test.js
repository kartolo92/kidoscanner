// Simple test function
exports.handler = async function(event, context) {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Hello from LiveCoinWatch API!',
            timestamp: new Date().toISOString()
        })
    };
};