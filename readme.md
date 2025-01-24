
# POC: SSO using Auth0

This POC is created to tryout SSO configurations and usage using Auth0.

![Static Badge](https://img.shields.io/badge/nodejs-%3E%3Dv20.4.0-blue)

# POC: Flow
<img width="468" alt="image" src="https://github.com/user-attachments/assets/9be96faa-39f0-4822-a9b8-1466103bc618" />

1.	User Interaction on Frontend
o	The user enters their email/username on the login page of the Next.js application.
o	The user clicks "Continue" or "Login" on the same page.
2.	Frontend to Middleware
o	The Next.js frontend sends the username (email) to the middleware (Node.js API) securely.
3.	Middleware Initiates Authentication with Auth0
o	The middleware forwards the login request to Auth0, initiating the Universal Login flow.
o	Auth0 determines the identity provider (IdP) using the user's domain (if applicable) or tenant settings.
4.	Auth0 Redirects to Identity Provider (IdP)
o	Auth0 redirects the user to the configured IdP (e.g., SAML, Google, Microsoft) based on domain or policy.
5.	User Authenticates with IdP
o	The IdP presents its authentication interface, validates the user's credentials, and generates an authentication response.
6.	IdP Redirects Back to Auth0
o	The IdP redirects the user to Auth0 with an authentication assertion (e.g., SAML Assertion or OIDC ID Token).
7.	Auth0 Issues Tokens
o	Auth0 validates the assertion from the IdP, generates an ID Token, Access Token, and optionally a Refresh Token.
o	Auth0 redirects the user back to the middleware with an authorization code or tokens.
8.	Middleware Processes Tokens
o	The middleware exchanges the authorization code with Auth0 to obtain tokens if necessary.
o	Middleware validates tokens (e.g., signature, claims) and extracts user information.
9.	Access Granted on Frontend
o	Middleware provides the necessary tokens (ID Token, Access Token) to the frontend securely.
o	The user is redirected to the authenticated portion of the application.

## Benefits of Middleware in SSO Integration
1.	Centralized Token Handling and Validation
o	Middleware can handle token exchange and validation securely, ensuring that sensitive operations do not expose client secrets or sensitive tokens to the frontend.
2.	Backend Security
o	Client secrets, which are necessary for token exchanges (e.g., for Authorization Code Flow), can be securely stored in the middleware and are not exposed to the frontend.
3.	Abstraction of Authentication Logic
o	Middleware abstracts the SSO integration logic, providing a clean separation between frontend and backend. This makes the frontend less complex and easier to manage.
4.	Custom Processing
o	Middleware can process user claims, enforce role-based access control, or perform additional steps (e.g., fetching user roles from a database) before granting access to the frontend.
5.	Scalability
o	If you have multiple frontends, the middleware can centralize the SSO flow, reducing redundancy.
6.	Ease of Backend-to-Backend Communication
o	Middleware can facilitate backend-to-backend communication with the IdP or Auth0 for tasks like token refresh or user information retrieval.

## When Middleware may not be necessary
1.	Frontend-First Integration
o	If your frontend is capable of securely managing the OAuth2/OIDC flows (e.g., using PKCE), you may bypass middleware entirely. The frontend can communicate directly with Auth0, handling redirects, token exchanges, and storage (e.g., in-memory or secure cookies).
2.	No Backend-Specific Requirements
o	If your application doesn’t need additional backend processing or role-based access control beyond what the IdP or Auth0 provides, middleware might add unnecessary complexity.

## Best practices of Middleware in SSO
1.	Use Authorization Code Flow with PKCE
Always use PKCE to secure the flow, even if the frontend is indirectly involved.
2.	Secure Token Storage
Store sensitive tokens securely in the middleware, preferably in a secure database or memory cache (e.g., Redis).
3.	Perform Token Validation
Middleware should validate the tokens (e.g., signature and claims) before granting access to resources.
4.	Minimize Latency
Ensure middleware is efficient and doesn’t introduce significant latency to the user login process.
5.	Implement Role-Based Access Control
Middleware can enforce application-specific roles/permissions after user authentication.
6.	Frontend-Middleware Communication
Use secure communication between the frontend and middleware (e.g., HTTPS with secure headers).

## Alternative approaches
1.	Direct Frontend Integration with Auth0
If you want to reduce backend complexity, the frontend can directly integrate with Auth0 using a library like @auth0/nextjs-auth0.
o	Use PKCE for security.
o	Store tokens in HTTP-only, secure cookies.
2.	Serverless Integration
If your architecture supports it, consider serverless functions (e.g., AWS Lambda) to handle token exchanges and validation, reducing the need for a persistent middleware layer.

## Conclusion
Middleware is a good choice when:
•	You need centralized control and processing of authentication logic.
•	There are backend-specific requirements (e.g., token validation, role enforcement).
•	Security requirements demand storing secrets and handling sensitive operations server-side.
However, if your architecture prioritizes simplicity and your frontend can handle most of the SSO workflow securely, a middleware layer might be unnecessary


## Installation & Execution

- Clone or download the code into a folder.
- From the terminal execute:
```
$ npm install
```
- Refer the package.json file and you should see all the dependencies used
- Create .env file within /server and add the below:
```
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_DOMAIN=
AUTH0_CALLBACK_URL=

AUTH0_MGMT_CLIENT_ID=
AUTH0_MGMT_CLIENT_SECRET=
AUTH0_MGMT_AUDIENCE=https://${AUTH0_DOMAIN}/api/v2/

JWT_SECRET=

SESSION_SECRET=
PORT=3000
```
The Auth0 data for the above can be found within your Auth0 Application configuration.
- From the terminal execute
```
$ npx nodemon index.js
```
or
```
$ node index.js
```
- The server will run with below output
```
[nodemon] 3.1.4
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node index.js`
Server is running on http://localhost:3000
```
- From the browser access, http://localhost:3000/, you should get output with
```
In Logged out state
Click to login Login
```
- Click on Login, this will take you to the Auth0 user login page. Here you can create a new user or login with existing user
- After successful login, you should get the woutput with
```
Successfully Logged in
Click to logout Logout
Below are the data 
...................
...................
```
- Observe the terminal/console and you see access token logged as output
- Observe the broswer cookie and you will see a token created by the backend after succesful loginw ith the name as "jwt"
- Click on Logout and this should logout the Auth0 Session, remove koa session and the jwt token.
