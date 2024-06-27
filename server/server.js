require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');

const session = require('koa-session');
const passport = require('koa-passport');
const Auth0Strategy = require('passport-auth0');
const app = new Koa();
const router = new Router();

// Session configuration
app.keys = [process.env.SESSION_SECRET];

app.use(session({}, app));

// Passport configuration
passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL
},
    function (accessToken, refreshToken, extraParams, profile, done) {
        // Store user information in session
        return done(null, {
            profile,
            accessToken
        });    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Routes
router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
}));

router.get('/callback', passport.authenticate('auth0', {
    failureRedirect: '/'
}), (ctx) => {
    // After successful authentication, you can access token and session info
    const { profile, accessToken } = ctx.state.user;

    // Access token
    console.log('Access Token:', accessToken);
    console.log('CTX State:', ctx.state);

    // Redirect to home page or wherever appropriate
    ctx.redirect('/');
});

router.get('/logout', (ctx) => {
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

router.get('/', (ctx) => {
    if (ctx.isAuthenticated()) {        
        ctx.body = `Hello ${ JSON.stringify(ctx.state.user, undefined, 4) }`;
    } else {
        ctx.body = 'Hello World';
    }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
