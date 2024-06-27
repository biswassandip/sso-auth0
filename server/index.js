require('dotenv').config();

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const session = require('koa-session');
const passport = require('koa-passport');

const auth0Routes = require('./routes/auth0Routes');
const idpRoute = require('./routes/getIdps');

const app = new Koa();

// Middleware
app.keys = [process.env.SESSION_SECRET];
app.use(bodyParser());
app.use(session({}, app));

// passport
app.use(passport.initialize());
app.use(passport.session());


// Serialization and deserialization functions
passport.serializeUser((user, done) => {
    // Store user.id or relevant information in session
    done(null, user);
});

passport.deserializeUser((user, done) => {
    // Retrieve user from session
    done(null, user);
});

// Error handling middleware
app.on('error', (err, ctx) => {
    console.error('Server error:', err);
    ctx.status = err.status || 500;
    ctx.body = {
        error: err.message
    };
});

// // Use CORS
// app.use(cors({
//     origin: 'http://localhost:3002', // replace with your Next.js frontend URL
//     credentials: true
// }));

// routes
app.use(auth0Routes.routes()).use(auth0Routes.allowedMethods());
app.use(idpRoute.routes()).use(idpRoute.allowedMethods());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${ PORT }`);
});
