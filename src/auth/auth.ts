import { auth } from "express-openid-connect";
import { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET } from "../config/env.js";
import { Express } from "express";
import logger from "../logger.js";

const log = logger('auth');

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: AUTH0_SECRET,
    baseURL: 'http://localhost:4000',
    clientID: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    issuerBaseURL: 'https://divineauth.us.auth0.com',
    authorizationParams: {
        response_type: 'code',
        audience: 'https://api.templeconnect.in',
        scope: 'openid profile email offline_access user_impersonation',
    }
};

const useAuth = (app: Express) => {
    log('config set: %O', config);
    app.use(auth(config));
};

export default useAuth;