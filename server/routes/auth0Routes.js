//require('dotenv').config();

const Router = require('koa-router');
const passport = require('koa-passport');
const Auth0Strategy = require('passport-auth0');
const router = new Router();

// jwt
const jwt = require('jsonwebtoken');

// get the configurations
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUTH0_CALLBACK_URL = process.env.AUTH0_CALLBACK_URL;
const AUTH0_STRATEGY = "auth0";
const AUTH0_SCOPES = "openid email profile";
const JWT_SECRET = process.env.JWT_SECRET;

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

// build the routes for auth0 --------------------------

// the login
router.get('/login', async (ctx, next) => {
    // Extract IdP from query parameter (if provided)
    const idp = ctx.query.idp; // Get IdP parameter from query string

    const options = {
        scope: 'openid profile email' 
    };

    if (idp) {
        // If IdP is provided, add the connection parameter to the options
        options.connection = idp;
    }    
    
    console.log(options);

    // if (idp) {
    //     // If IdP is provided, use the specific IdP connection
    //     return passport.authenticate('auth0', { connection: idp })(ctx);
    // } else {
    //     // If IdP is not provided, use the default Auth0 login
    //     return passport.authenticate('auth0')(ctx);
    // }

    console.log("1");
        // Initiate authentication with selected strategy
        await passport.authenticate(AUTH0_STRATEGY, options)(ctx, next).catch(err => {
            console.error('Authentication error:', err);
            ctx.throw(500, 'Authentication error');
        });                

    console.log("2");
});

// the callback after authentication
router.get('/callback', async (ctx, next) => {
    const { idp } = ctx.query;

    console.log('3');

    // Use the same strategy as initiated during login
    const strategy = idp ? idp : AUTH0_STRATEGY;

    console.log('4');

    await passport.authenticate(AUTH0_STRATEGY, {
        failureRedirect: '/'
    })(ctx, next).catch(err => {
        console.error('Authentication callback error:', err);
        ctx.throw(500, 'Authentication callback error');
    });
    console.log('5');
    console.log(ctx);

}, async (ctx) => {
    console.log('6');

    // get the user
    const user = ctx.state.user;

    console.log(user);

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
    }

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
//    ctx.redirect('/');  

    // Redirect to Auth0 logout endpoint
    const returnTo = `${ ctx.protocol }://${ ctx.host }`;
    ctx.redirect(`https://${ process.env.AUTH0_DOMAIN }/v2/logout?client_id=${ process.env.AUTH0_CLIENT_ID }&returnTo=${ returnTo }`);

});

router.get('/', (ctx, next) => {
    if (ctx.isAuthenticated()) {

        ctx.type = 'text/html';
        ctx.body = `
                    <html>
                        <head>
                            <title>SSO</title>
                        </head>
                        <body>
                            <h2>Successfully Logged in</h2>
                            <h3>Click to logout <a href="/logout">Logout</a></h3>
                            <h3>Below are the data</h3>
                            <pre>
                                ${ JSON.stringify(ctx.state.user, undefined, 4) }
                            </pre>
                        </body>
                    </html>
                    `;        
    } else {
        ctx.type = 'text/html';
        ctx.body = `
                    <html>
                        <head>
                            <title>SSO</title>
                        </head>
                        <body>
                            <h2>In Logged out state</h2>
                            <h3>Click for user login <a href="/login">User Login</a></h3>
                            <br/>
                            <h3>Click for idp login <a href="/login?idp=test-entra-id">Entra Login</a></h3>
                        </body>
                    </html>
                    `;        
    }
});

module.exports = router;
