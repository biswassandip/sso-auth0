require('dotenv').config();

const Router = require('koa-router');
const router = new Router();
const axios = require('axios');

const auth0Api = require('../apis/auth0Api');

async function getManagementApiToken() {
    const response = await axios.post(`https://${ process.env.AUTH0_DOMAIN }/oauth/token`, {
        client_id: process.env.AUTH0_MGMT_CLIENT_ID,
        client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
        audience: `https://${ process.env.AUTH0_DOMAIN }/api/v2/`,
        grant_type: 'client_credentials'
    });

    return response.data.access_token;
}

router.get('/getIdps', async (ctx) => {
    try {
        const token = await getManagementApiToken();
        const response = await axios.get(`https://${ process.env.AUTH0_DOMAIN }/api/v2/connections`, {
            headers: {
                Authorization: `Bearer ${ token }`
            }
        });

        const idps = response.data.map(connection => ({
            name: connection.name,
            displayName: connection.display_name || connection.name,
            strategy: connection.strategy
        }));

        ctx.body = idps;
    } catch (error) {
        console.error('Error fetching IdP connections:', error);
        ctx.status = 403;
        ctx.body = 'Error fetching IdP connections';
    }
});

module.exports = router;