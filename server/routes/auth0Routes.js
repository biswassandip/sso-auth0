require('dotenv').config();

const Router = require('koa-router');
const passport = require('koa-passport');
const Auth0Strategy = require('passport-auth0');
const router = new Router();
const jwt = require('jsonwebtoken');

// get the configurations
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL;
const AUTH0_STRATEGY = "auth0";
const AUTH0_SCOPES = "openid email profile";
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;


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
        failureRedirect: FRONTEND_URL
    })(ctx, next).catch(err => {
        console.error('Authentication callback error:', err);
        ctx.throw(500, 'Authentication callback error');
    });
}, async (ctx) => {

    // get the user
    const user = ctx.state.user;

    if (!user) {
        ctx.redirect('/login');
    } else {

        // After successful authentication, you can access token and session info
        const { profile, accessToken } = user;

        // Access token
        console.log('Access Token:', accessToken);

        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });

        // Set JWT token as a cookie
        ctx.cookies.set('jwt', token, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            maxAge: 3600000, // 1 hour
            sameSite: 'lax'
        });

        // ctx.redirect(`http://localhost:3002/profile`);
        ctx.redirect(`http://localhost:3002`);
    }


    // // After successful authentication, you can access token and session info
    // const { profile, accessToken } = ctx.state.user;

    // // Access token
    // console.log('Access Token:', accessToken);

    // // Redirect to home page or wherever appropriate
    // ctx.redirect(`${ process.env.FRONTEND_URL }/profile`);
});

router.get('/logout', async (ctx, next) => {
    // Custom logout function
    ctx.logout = function () {

        console.log('sss');

        // Destroy the session
        ctx.session = null;

        // Optionally, clear any user-related data from ctx.state
        delete ctx.state.user;
    };

    // Call custom logout function
    ctx.logout();

    // Handle logout logic
    ctx.cookies.set('jwt', '', { maxAge: 0 }); // Clear JWT cookie
    ctx.body = 'logged out';

    // Set CORS headers explicitly for redirect response
    // ctx.set('Access-Control-Allow-Origin', 'http://localhost:3002');
    // ctx.set('Access-Control-Allow-Credentials', 'true');
    // ctx.redirect('http://localhost:3002');  // Redirect to frontend
});

router.get('/', (ctx, next) => {
    if (ctx.isAuthenticated()) {
        ctx.body = `Hello ${ JSON.stringify(ctx.state.user, undefined, 4) }`;
    } else {
        ctx.body = 'Hello World';
    }
});

module.exports = router;
