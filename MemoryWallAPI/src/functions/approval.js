const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const connectionString = process.env.AzureWebJobsStorage;
const client = TableClient.fromConnectionString(connectionString, "WeddingWishes");

const TENANT_ID = "87700922-9176-440e-aad9-75b3541a4b79";
const CLIENT_ID = "85dc0a2e-4972-4c11-a242-dceda101100c";
const ISSUER    = `https://${TENANT_ID}.ciamlogin.com/${TENANT_ID}/v2.0`;
const JWKS_URI  = `https://azciam.ciamlogin.com/${TENANT_ID}/discovery/v2.0/keys`;

// ── JWKS Client (caches keys automatically) ────────────────────────
const jwks = jwksClient({
    jwksUri: JWKS_URI,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 3600000 // 1 hour
});

function getSigningKey(header, callback) {
    jwks.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        callback(null, key.getPublicKey());
    });
}

// ── Token Validation ───────────────────────────────────────────────
function validateToken(authHeader) {
    return new Promise((resolve, reject) => {
        // console.log("Validating token..."); 
        // console.log("Auth header:", authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reject(new Error('No Bearer token provided'));
        }

        const token = authHeader.split(' ')[1];
        console.log("Token found, verifying...");

        jwt.verify(token, getSigningKey, {
            algorithms: ['RS256'],
            issuer: ISSUER,
            audience: CLIENT_ID
        }, (err, decoded) => {
            if (err) {
                console.log("Token verify error:", err.message);
                return reject(new Error(`Token invalid: ${err.message}`));
            }
            console.log("Token valid!");
            resolve(decoded);
        });
    });
}

// ── CORS ───────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    'https://invite.arvinthaarthi.in'
];

function getCorsHeaders(request) {
    const origin = request.headers.get('origin') || '';
    
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return {};
    }

    return {
        'Access-Control-Allow-Origin':  origin,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
}

// ── Main Function ──────────────────────────────────────────────────
app.http('approval', {
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Processing ${request.method} request`);
        const corsHeaders = getCorsHeaders(request);

        // Handle preflight
        if (request.method === 'OPTIONS') {
            return { status: 204, headers: corsHeaders };
        }

        // Validate token
        try {
            const decoded = await validateToken(request.headers.get('authorization'));
            context.log(`Authenticated user: ${decoded.email || decoded.sub}`);
        } catch (e) {
            context.log.warn('Auth failed:', e.message);
            return { status: 401, headers: corsHeaders, body: `Unauthorized: ${e.message}` };
        }

        try {
            // GET
            if (request.method === 'GET') {
                const filter = request.query.get('filter') || 'all';
                let queryFilter = undefined;
                if (filter === 'pending')  queryFilter = "isApproved eq false and isRejected eq false";
                if (filter === 'approved') queryFilter = "isApproved eq true";
                if (filter === 'rejected') queryFilter = "isRejected eq true";

                const entities = client.listEntities({
                    queryOptions: queryFilter ? { filter: queryFilter } : {}
                });

                const posts = [];
                for await (const entity of entities) {
                    posts.push({
                        partitionKey: entity.partitionKey,
                        rowKey:       entity.rowKey,
                        senderName:   entity.senderName,
                        message:      entity.message,
                        side:         entity.side,
                        isApproved:   entity.isApproved ?? false,
                        isRejected:   entity.isRejected ?? false,
                        submittedAt:  entity.submittedAt,
                        ipAddress:    entity.ipAddress,
                        browser:      entity.browser
                    });
                }

                posts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                return { status: 200, headers: corsHeaders, jsonBody: posts };
            }

            // POST
            if (request.method === 'POST') {
                const body = await request.json();
                const { partitionKey, rowKey, action } = body;

                if (!partitionKey || !rowKey || !action) {
                    return { status: 400, headers: corsHeaders, body: "partitionKey, rowKey and action are required." };
                }
                if (!['approve', 'reject'].includes(action)) {
                    return { status: 400, headers: corsHeaders, body: "action must be 'approve' or 'reject'." };
                }

                await client.updateEntity({
                    partitionKey, rowKey,
                    isApproved: action === 'approve',
                    isRejected: action === 'reject'
                }, "Merge");

                context.log(`Post ${rowKey} ${action}d.`);
                return { status: 200, headers: corsHeaders, body: `Post ${action}d successfully.` };
            }

            // DELETE
            if (request.method === 'DELETE') {
                const body = await request.json();
                const { partitionKey, rowKey } = body;

                if (!partitionKey || !rowKey) {
                    return { status: 400, headers: corsHeaders, body: "partitionKey and rowKey are required." };
                }

                await client.deleteEntity(partitionKey, rowKey);
                context.log(`Post ${rowKey} deleted.`);
                return { status: 200, headers: corsHeaders, body: "Post deleted successfully." };
            }

        } catch (error) {
            context.log.error("Error:", error);
            return { status: 500, headers: corsHeaders, body: "Internal Server Error" };
        }
    }
});