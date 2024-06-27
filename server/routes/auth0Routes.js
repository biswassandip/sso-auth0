require('dotenv').config();

const Router = require('koa-router');
const passport = require('koa-passport');
const Auth0Strategy = require('passport-auth0');
const router = new Router();

// get the configurations
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL;
const AUTH0_STRATEGY = "auth0";
const AUTH0_SCOPES = "openid email profile";

// passport configuration with Auth0 strategy
passport.use(new Auth0Strategy({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    callbackURL: AUTH0_CALLBACK_URL
},
    function (accessToken, refreshToken, extraParams, profile, done) {
        // Store user information in session
        return done(null, {
            profile,
            accessToken
        });
    }
));

// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((user, done) => {
//     done(null, user);
// });

// build the routes for auth0 --------------------------

// the login
router.get('/login', async (ctx, next) => {
    // Extract IdP from query parameter (if provided)
    const { idp } = ctx.query;

    // If idp is provided, use that strategy, otherwise default to 'auth0'
    const strategy = idp ? idp : AUTH0_STRATEGY;

    // Initiate authentication with selected strategy
    await passport.authenticate(strategy, {
        scope: AUTH0_SCOPES
    })(ctx, next).catch(err => {
        console.error('Authentication error:', err);
        ctx.throw(500, 'Authentication error');
    });    
});

// the callback after authentication
router.get('/callback', async (ctx, next) => {
    const { idp } = ctx.query;

    // Use the same strategy as initiated during login
    const strategy = idp ? idp : 'auth0';

    await passport.authenticate(strategy, {
        failureRedirect: '/'
    })(ctx, next).catch(err => {
        console.error('Authentication callback error:', err);
        ctx.throw(500, 'Authentication callback error');
    });
}, async (ctx) => {
    // After successful authentication, you can access token and session info
    const { profile, accessToken } = ctx.state.user;

    // Access token
    console.log('Access Token:', accessToken);

    // Redirect to home page or wherever appropriate
    ctx.redirect('/');
});

router.get('/logout', async (ctx, next) => {

    // Custom logout function
    ctx.logout = function () {
        // Destroy the session
        ctx.session = null;

        // Optionally, clear any user-related data from ctx.state
        delete ctx.state.user;
    };

    // Call custom logout function
    ctx.logout();

    // Redirect to Auth0 logout endpoint
    const returnTo = encodeURIComponent('http://localhost:3000'); // Replace with your actual return URL
    ctx.redirect(`https://${ process.env.AUTH0_DOMAIN }/v2/logout?client_id=${ process.env.AUTH0_CLIENT_ID }&returnTo=${ returnTo }`);
});

router.get('/', (ctx, next) => {
    if (ctx.isAuthenticated()) {
        ctx.body = `Hello ${ JSON.stringify(ctx.state.user, undefined, 4) }`;
    } else {
        ctx.body = 'Hello World';
    }
});

module.exports = router;
