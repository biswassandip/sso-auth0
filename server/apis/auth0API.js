require('dotenv').config();

const axios = require('axios');

async function getIdpConnections() {
    try {
        // Get Access Token for Management API
        const tokenResponse = await axios.post(`https://${ process.env.AUTH0_DOMAIN }/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            audience: `https://${ process.env.AUTH0_DOMAIN }/api/v2/`
        });

        const accessToken = tokenResponse.data.access_token;

        // Fetch IdP connections
        const response = await axios.get(`https://${ process.env.AUTH0_DOMAIN }/api/v2/connections`, {
            headers: {
                Authorization: `Bearer ${ accessToken }`
            }
        });

        return response.data;
    } catch (error) {
        throw new Error(`Error fetching IdP connections: ${ error.message }`);
    }
}

module.exports = {
    getIdpConnections,
};
