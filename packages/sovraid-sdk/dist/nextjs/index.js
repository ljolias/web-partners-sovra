/**
 * SovraID Next.js Integration
 * Ready-to-use API route handlers for Next.js App Router
 */
import { createSovraIdClient } from "../client";
import { createWebhookHandler } from "../webhooks";
/**
 * Create a credential offer route handler factory
 *
 * @example
 * ```typescript
 * // app/api/credential-offer/route.ts
 * import { createCredentialOfferHandler } from "@sovra/sovraid-sdk/nextjs";
 *
 * const handler = createCredentialOfferHandler({
 *   apiKey: process.env.SOVRA_ID_API_KEY!,
 *   workspaceId: process.env.SOVRA_ID_WORKSPACE_ID!,
 *   storage: createRedisAdapter(redis),
 * });
 *
 * export const GET = handler.createOffer({
 *   type: "StudentCredential",
 *   name: "Student ID",
 *   credentialSubject: { ... },
 * });
 * ```
 */
export function createCredentialOfferHandler(config) {
    const client = createSovraIdClient({
        apiKey: config.apiKey,
        workspaceId: config.workspaceId,
        apiUrl: config.apiUrl,
    });
    return {
        client,
        /**
         * Create a GET handler for a specific credential type
         */
        createOffer(credentialConfig) {
            return async () => {
                try {
                    const result = await client.createSimpleCredentialOffer({
                        type: credentialConfig.type,
                        name: credentialConfig.name,
                        description: credentialConfig.description,
                        credentialSubject: credentialConfig.credentialSubject,
                        backgroundColor: credentialConfig.backgroundColor,
                        heroImageUrl: credentialConfig.heroImageUrl,
                        thumbnailUrl: credentialConfig.thumbnailUrl,
                    });
                    return Response.json({
                        credentialId: result.credentialId,
                        invitationId: result.invitationId,
                        credentialOfferUrl: result.credentialOfferUrl,
                        credentialType: credentialConfig.type,
                        credentialName: credentialConfig.name,
                    });
                }
                catch (error) {
                    console.error("[Credential Offer] Error:", error);
                    return Response.json({ error: "Failed to create credential offer" }, { status: 500 });
                }
            };
        },
        /**
         * Create a dynamic GET handler that accepts credential type as query param
         */
        createDynamicOffer(configs) {
            return async (request) => {
                const url = new URL(request.url);
                const type = url.searchParams.get("type");
                if (!type || !configs[type]) {
                    return Response.json({
                        error: "Invalid credential type",
                        validTypes: Object.keys(configs),
                    }, { status: 400 });
                }
                const credentialConfig = configs[type];
                try {
                    const result = await client.createSimpleCredentialOffer({
                        type: credentialConfig.type,
                        name: credentialConfig.name,
                        description: credentialConfig.description,
                        credentialSubject: credentialConfig.credentialSubject,
                        backgroundColor: credentialConfig.backgroundColor,
                        heroImageUrl: credentialConfig.heroImageUrl,
                        thumbnailUrl: credentialConfig.thumbnailUrl,
                    });
                    return Response.json({
                        credentialId: result.credentialId,
                        invitationId: result.invitationId,
                        credentialOfferUrl: result.credentialOfferUrl,
                        credentialType: credentialConfig.type,
                        credentialName: credentialConfig.name,
                    });
                }
                catch (error) {
                    console.error("[Credential Offer] Error:", error);
                    return Response.json({ error: "Failed to create credential offer" }, { status: 500 });
                }
            };
        },
    };
}
/**
 * Create a verification request route handler factory
 */
export function createVerificationHandler(config) {
    const client = createSovraIdClient({
        apiKey: config.apiKey,
        workspaceId: config.workspaceId,
        apiUrl: config.apiUrl,
    });
    return {
        client,
        /**
         * Create a GET handler for a specific verification type
         */
        createVerification(verificationConfig) {
            return async () => {
                try {
                    const result = await client.createSimpleVerificationRequest({
                        credentialType: verificationConfig.credentialType,
                        name: verificationConfig.name,
                        purpose: verificationConfig.purpose,
                        requiredFields: verificationConfig.requiredFields,
                        issuerName: verificationConfig.issuerName,
                        backgroundColor: verificationConfig.backgroundColor,
                    });
                    return Response.json({
                        verificationId: result.verificationId,
                        invitationId: result.invitationId,
                        presentationUrl: result.presentationUrl,
                        verificationType: verificationConfig.name,
                    });
                }
                catch (error) {
                    console.error("[Verification] Error:", error);
                    return Response.json({ error: "Failed to create verification request" }, { status: 500 });
                }
            };
        },
        /**
         * Create a dynamic GET handler that accepts verification type as query param
         */
        createDynamicVerification(configs) {
            return async (request) => {
                const url = new URL(request.url);
                const type = url.searchParams.get("type");
                if (!type || !configs[type]) {
                    return Response.json({
                        error: "Invalid verification type",
                        validTypes: Object.keys(configs),
                    }, { status: 400 });
                }
                const verificationConfig = configs[type];
                try {
                    const result = await client.createSimpleVerificationRequest({
                        credentialType: verificationConfig.credentialType,
                        name: verificationConfig.name,
                        purpose: verificationConfig.purpose,
                        requiredFields: verificationConfig.requiredFields,
                        issuerName: verificationConfig.issuerName,
                        backgroundColor: verificationConfig.backgroundColor,
                    });
                    return Response.json({
                        verificationId: result.verificationId,
                        invitationId: result.invitationId,
                        presentationUrl: result.presentationUrl,
                        verificationType: verificationConfig.name,
                    });
                }
                catch (error) {
                    console.error("[Verification] Error:", error);
                    return Response.json({ error: "Failed to create verification request" }, { status: 500 });
                }
            };
        },
    };
}
// ============================================================================
// Webhook Route Handler
// ============================================================================
/**
 * Create webhook route handlers for Next.js App Router
 *
 * @example
 * ```typescript
 * // app/api/webhooks/sovraid/route.ts
 * import { createWebhookRouteHandler } from "@sovra/sovraid-sdk/nextjs";
 *
 * const { POST, GET } = createWebhookRouteHandler({
 *   webhookSecret: process.env.SOVRA_ID_WEBHOOK_SECRET,
 *   storage: createRedisAdapter(redis),
 * });
 *
 * export { POST, GET };
 * ```
 */
export function createWebhookRouteHandler(config) {
    const webhookHandler = createWebhookHandler({
        webhookSecret: config.webhookSecret,
        storage: config.storage,
        eventTTL: config.eventTTL,
    });
    return {
        webhookHandler,
        /**
         * POST handler for receiving webhook events
         */
        POST: async (request) => {
            try {
                const signature = request.headers.get("x-webhook-signature");
                const rawBody = await request.text();
                const result = await webhookHandler.processEvent(rawBody, signature);
                if (!result.success) {
                    return Response.json(result, { status: result.error === "invalid_signature" ? 401 : 400 });
                }
                return Response.json(result);
            }
            catch (error) {
                console.error("[Webhook] Error:", error);
                return Response.json({ success: false, error: "Failed to process webhook" }, { status: 500 });
            }
        },
        /**
         * GET handler for checking status (frontend polling)
         */
        GET: async (request) => {
            const url = new URL(request.url);
            const invitationId = url.searchParams.get("invitationId");
            const type = (url.searchParams.get("type") || "credential");
            if (!invitationId) {
                return Response.json({ error: "invitationId is required" }, { status: 400 });
            }
            const status = await webhookHandler.getStatus(invitationId, type);
            if (!status) {
                return Response.json({
                    status: "pending",
                    invitationId,
                    message: "No webhook event received yet",
                });
            }
            return Response.json(status);
        },
    };
}
// ============================================================================
// Complete Integration Setup
// ============================================================================
/**
 * Create a complete SovraID integration for Next.js
 *
 * @example
 * ```typescript
 * // lib/sovraid.ts
 * import { createSovraIdIntegration, createRedisAdapter } from "@sovra/sovraid-sdk/nextjs";
 * import { Redis } from "@upstash/redis";
 *
 * const redis = new Redis({
 *   url: process.env.KV_REST_API_URL!,
 *   token: process.env.KV_REST_API_TOKEN!,
 * });
 *
 * export const sovraId = createSovraIdIntegration({
 *   apiKey: process.env.SOVRA_ID_API_KEY!,
 *   workspaceId: process.env.SOVRA_ID_WORKSPACE_ID!,
 *   webhookSecret: process.env.SOVRA_ID_WEBHOOK_SECRET,
 *   storage: createRedisAdapter(redis),
 * });
 *
 * // Then in your route files:
 * // app/api/credential-offer/route.ts
 * export const GET = sovraId.credentialOffer.createDynamicOffer(configs);
 *
 * // app/api/credential-verify/route.ts
 * export const GET = sovraId.verification.createDynamicVerification(configs);
 *
 * // app/api/webhooks/sovraid/route.ts
 * export const { POST, GET } = sovraId.webhook;
 * ```
 */
export function createSovraIdIntegration(config) {
    return {
        client: createSovraIdClient({
            apiKey: config.apiKey,
            workspaceId: config.workspaceId,
            apiUrl: config.apiUrl,
        }),
        credentialOffer: createCredentialOfferHandler(config),
        verification: createVerificationHandler(config),
        webhook: createWebhookRouteHandler(config),
    };
}
// Re-export storage adapters for convenience
export { createRedisAdapter, createMemoryAdapter, createVercelKVAdapter } from "../storage";
//# sourceMappingURL=index.js.map