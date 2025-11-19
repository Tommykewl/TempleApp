import { Express } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import pkg from 'express-openid-connect';
import { GraphQLBoolean, GraphQLID, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { createHandler } from 'graphql-http';
import { ruruHTML } from 'ruru/server';
import { IUser } from '../types/IUser.js';

const { requiresAuth } = pkg;

// Construct a schema using GraphQL schema language
const userType = new GraphQLObjectType({
    name: "User",
    fields: {
        id: { type: GraphQLID },
        given_name: { type: GraphQLString },
        family_name: { type: GraphQLString },
        nickname: { type: GraphQLString },
        name: { type: GraphQLString },
        picture: { type: GraphQLString },
        email: { type: GraphQLString },
        email_verified: { type: GraphQLBoolean },
        phone: { type: GraphQLString },
        role: { type: GraphQLString },
        preferred_religion: { type: GraphQLString },
        created_at: { type: GraphQLString },
        updated_at: { type: GraphQLString },
    },
});

// Define the Query type
const queryType = new GraphQLObjectType({
    name: "Query",
    fields: {
        me: {
            type: userType,
            // `args` describes the arguments that the `user` query accepts
            resolve: async (_parent, _args, context) => {
                try{
                    await context.authCheck();
                    console.log("Authorized access to 'me' query");
                }catch(err){
                    console.log("Unauthorized access attempt to 'me' query");
                    throw new Error("Unauthorized");
                }

                const user = (context.req as Express.Request).oidc.user;

                if (user) {
                    user.id = user.sid;
                }
                return user as IUser;
            },
        },
    },
});

const schema = new GraphQLSchema({ query: queryType });

const handler = createHandler({
    schema,
    context: reqCtx => {
        const jwtCheck = auth({
            audience: 'https://api.templeconnect.in',
            issuerBaseURL: 'https://divineauth.us.auth0.com/',
            tokenSigningAlg: 'RS256'
        });

        const req = reqCtx.raw as Express.Request & { oidc?: any };
        const res = (reqCtx.raw as any).res as Express.Response;

        return {
            authCheck : () => new Promise((resolve, reject) =>
                jwtCheck(req as any, res as any, (err: any) =>
                  err ? reject(err) : resolve(null)
                )
            ),
            req,
        }
    },
});

const addControllers =  (app: Express): void => {
    // Create and use the GraphQL handler
    app.all("/graphql", async (req, res) => {
        try {
            const [body, init] = await handler({
                url: req.url,
                method: req.method,
                headers: req.headers,
                body: () => new Promise((resolve) => {
                    let body = '';
                    req.on('data', (chunk) => (body += chunk));
                    req.on('end', () => resolve(body));
                }),
                raw: req,
                context: undefined,
            });
            res.writeHead(init.status, init.statusText, init.headers).end(body);
        } catch (err) {
            // BEWARE not to transmit the exact internal error message in production environments
            const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
            res.writeHead(500).end(errorMessage);
        }
    });
  
    // Serve the GraphiQL IDE
    app.get("/", requiresAuth(), (_req, res) => {
        res.type("html");
        res.end(ruruHTML({ endpoint: "/graphql" }));
    });

    app.get("/callback", (req, res) => {
        res.redirect('/');
    });

    app.get("/tokens", requiresAuth(), async (req, res) => {
        res.json({
            user: req.oidc.user,
            accessToken: req.oidc.accessToken,
            idToken: req.oidc.idToken,
            refreshToken: req.oidc.refreshToken
        });
    });
}

export default addControllers;