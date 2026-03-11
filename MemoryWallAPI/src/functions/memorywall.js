const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");

const connectionString = process.env.AzureWebJobsStorage;
const client = TableClient.fromConnectionString(connectionString, "WeddingWishes");

app.http('memorywall', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Processing ${request.method} request for Memory Wall`);

        const origin = request.headers.get('origin') || request.headers.get('referer');
        const allowedOrigin = "https://arvinthaarthi.in"; 

        if (process.env.NODE_ENV === 'production' && !origin?.includes(allowedOrigin)) {
            return { status: 403, body: "Unauthorized: Access is denied." };
        }

        try {
            console.log("Inside Try");
            // --- GET: Fetch Approved Wishes ---
            if (request.method === 'GET') {
                console.log("Inside Get");
                const entities = client.listEntities({
                    queryOptions: { filter: "isApproved eq true" }
                });

                const wishes = [];
                for await (const entity of entities) {
                    wishes.push({
                        name: entity.senderName,
                        message: entity.message,
                        side: entity.side,
                        date: entity.submittedAt
                    });
                }

                return {
                    status: 200,
                    jsonBody: wishes
                };
            }

            // --- POST: Submit New Wish ---
            if (request.method === 'POST') {
                console.log("Inside Post");
                const body = await request.json();
                const { name, message, side } = body;

                console.log("Inside Body");

                if (!name || !message) {
                    return { status: 400, body: "Name and message are required." };
                }

                const userIp = request.headers.get('x-forwarded-for') || "unknown";
                const userAgent = request.headers.get('user-agent') || "unknown";

                console.log("Before Entity");

                const entity = {
                    partitionKey: "Wishes",
                    rowKey: `${name.replace(/\s+/g, '')}_${Date.now()}`,
                    senderName: name,
                    message: message,
                    side: side || "bride",
                    isApproved: false, 
                    ipAddress: userIp,
                    browser: userAgent,
                    submittedAt: new Date().toISOString()
                };

                console.log("After Entity");

                await client.createEntity(entity);
                console.log("Inside Return");

                return { 
                    status: 201, 
                    body: "Wish submitted! It will appear once approved by the couple." 
                };
            }

        } catch (error) {
            context.log.error("Error:", error);
            return { status: 500, body: "Internal Server Error" };
        }
    }
});