const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");

app.http('r', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'r',
    handler: async (request, context) => {

        const id = request.query.get('id') || "UNKNOWN";
        const ip = request.headers.get('x-forwarded-for') || "Unknown";
        const userAgent = request.headers.get('user-agent') || "Unknown";

        const connectionString = process.env.StorageConnection;

        const tableClient = TableClient.fromConnectionString(
            connectionString,
            "ScanLogs"
        );

        await tableClient.createEntity({
            partitionKey: id,
            rowKey: Date.now().toString(),
            ipAddress: ip,
            userAgent: userAgent,
            scannedAt: new Date().toISOString()
        });

        let redirectUrl;

        switch (id) {
            case "INVITE2026":
                redirectUrl = "https://arvinthaarthi.in";
                break;
            case "MAP2026":
                redirectUrl = "https://maps.app.goo.gl/yourlocation";
                break;
            default:
                redirectUrl = "https://arvinthaarthi.in";
        }

        return {
            status: 302,
            headers: {
                Location: redirectUrl
            }
        };
    }
});