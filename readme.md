
# POC: SSO using Auth0

This POC is created to tryout SSO configurationa and usage using Auth0.

![Static Badge](https://img.shields.io/badge/nodejs-%3E%3Dv20.4.0-blue)

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