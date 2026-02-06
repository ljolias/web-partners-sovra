/**
 * SovraID Next.js Integration
 * Ready-to-use API route handlers for Next.js App Router
 */
import { CredentialSubject, StorageAdapter } from "../types";
export interface NextJsIntegrationConfig {
    /** SovraID API key */
    apiKey: string;
    /** SovraID workspace ID */
    workspaceId: string;
    /** SovraID API URL (default: sandbox) */
    apiUrl?: string;
    /** Webhook secret for signature validation */
    webhookSecret?: string;
    /** Storage adapter for webhook events */
    storage: StorageAdapter;
    /** Event TTL in seconds (default: 86400 = 24 hours) */
    eventTTL?: number;
}
export interface CredentialOfferConfig {
    /** Credential type name */
    type: string;
    /** Display name */
    name: string;
    /** Description */
    description?: string;
    /** Credential subject data */
    credentialSubject: CredentialSubject;
    /** Card background color */
    backgroundColor?: string;
    /** Hero image URL */
    heroImageUrl?: string;
    /** Thumbnail URL */
    thumbnailUrl?: string;
}
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
export declare function createCredentialOfferHandler(config: NextJsIntegrationConfig): {
    client: import("..").SovraIdClient;
    /**
     * Create a GET handler for a specific credential type
     */
    createOffer(credentialConfig: CredentialOfferConfig): () => Promise<import("undici-types").Response>;
    /**
     * Create a dynamic GET handler that accepts credential type as query param
     */
    createDynamicOffer(configs: Record<string, CredentialOfferConfig>): (request: Request) => Promise<import("undici-types").Response>;
};
export interface VerificationConfig {
    /** Verification name */
    name: string;
    /** Purpose description */
    purpose: string;
    /** Credential type to verify (optional) */
    credentialType?: string;
    /** Required fields from credential subject */
    requiredFields: string[];
    /** Verifier display name */
    issuerName?: string;
    /** Background color */
    backgroundColor?: string;
}
/**
 * Create a verification request route handler factory
 */
export declare function createVerificationHandler(config: NextJsIntegrationConfig): {
    client: import("..").SovraIdClient;
    /**
     * Create a GET handler for a specific verification type
     */
    createVerification(verificationConfig: VerificationConfig): () => Promise<import("undici-types").Response>;
    /**
     * Create a dynamic GET handler that accepts verification type as query param
     */
    createDynamicVerification(configs: Record<string, VerificationConfig>): (request: Request) => Promise<import("undici-types").Response>;
};
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
export declare function createWebhookRouteHandler(config: Omit<NextJsIntegrationConfig, "apiKey" | "workspaceId" | "apiUrl">): {
    webhookHandler: {
        validateSignature(rawBody: string, signature: string | null): {
            valid: boolean;
            reason?: string;
        };
        processEvent(rawBody: string, signature: string | null): Promise<import("..").WebhookHandlerResult>;
        handleCredentialIssued(eventData: import("..").CredentialIssuedEvent): Promise<import("..").WebhookHandlerResult>;
        handleVerificationFinished(eventData: import("..").VerifiablePresentationFinishedEvent): Promise<import("..").WebhookHandlerResult>;
        getCredentialStatus(invitationId: string): Promise<import("..").CredentialStatus | null>;
        getVerificationStatus(invitationId: string): Promise<import("..").CredentialStatus | null>;
        getStatus(invitationId: string, type: "credential" | "verification"): Promise<import("..").CredentialStatus | null>;
    };
    /**
     * POST handler for receiving webhook events
     */
    POST: (request: Request) => Promise<import("undici-types").Response>;
    /**
     * GET handler for checking status (frontend polling)
     */
    GET: (request: Request) => Promise<import("undici-types").Response>;
};
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
export declare function createSovraIdIntegration(config: NextJsIntegrationConfig): {
    client: import("..").SovraIdClient;
    credentialOffer: {
        client: import("..").SovraIdClient;
        /**
         * Create a GET handler for a specific credential type
         */
        createOffer(credentialConfig: CredentialOfferConfig): () => Promise<import("undici-types").Response>;
        /**
         * Create a dynamic GET handler that accepts credential type as query param
         */
        createDynamicOffer(configs: Record<string, CredentialOfferConfig>): (request: Request) => Promise<import("undici-types").Response>;
    };
    verification: {
        client: import("..").SovraIdClient;
        /**
         * Create a GET handler for a specific verification type
         */
        createVerification(verificationConfig: VerificationConfig): () => Promise<import("undici-types").Response>;
        /**
         * Create a dynamic GET handler that accepts verification type as query param
         */
        createDynamicVerification(configs: Record<string, VerificationConfig>): (request: Request) => Promise<import("undici-types").Response>;
    };
    webhook: {
        webhookHandler: {
            validateSignature(rawBody: string, signature: string | null): {
                valid: boolean;
                reason?: string;
            };
            processEvent(rawBody: string, signature: string | null): Promise<import("..").WebhookHandlerResult>;
            handleCredentialIssued(eventData: import("..").CredentialIssuedEvent): Promise<import("..").WebhookHandlerResult>;
            handleVerificationFinished(eventData: import("..").VerifiablePresentationFinishedEvent): Promise<import("..").WebhookHandlerResult>;
            getCredentialStatus(invitationId: string): Promise<import("..").CredentialStatus | null>;
            getVerificationStatus(invitationId: string): Promise<import("..").CredentialStatus | null>;
            getStatus(invitationId: string, type: "credential" | "verification"): Promise<import("..").CredentialStatus | null>;
        };
        /**
         * POST handler for receiving webhook events
         */
        POST: (request: Request) => Promise<import("undici-types").Response>;
        /**
         * GET handler for checking status (frontend polling)
         */
        GET: (request: Request) => Promise<import("undici-types").Response>;
    };
};
export { createRedisAdapter, createMemoryAdapter, createVercelKVAdapter } from "../storage";
//# sourceMappingURL=index.d.ts.map