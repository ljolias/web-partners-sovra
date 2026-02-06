/**
 * @sovra/sovraid-sdk
 *
 * Official SDK for integrating SovraID verifiable credentials into your applications.
 *
 * @example Basic credential issuance
 * ```typescript
 * import { createSovraIdClient } from "@sovra/sovraid-sdk";
 *
 * const client = createSovraIdClient({
 *   apiKey: process.env.SOVRA_ID_API_KEY!,
 *   workspaceId: process.env.SOVRA_ID_WORKSPACE_ID!,
 * });
 *
 * const offer = await client.createSimpleCredentialOffer({
 *   type: "StudentCredential",
 *   name: "Student ID",
 *   credentialSubject: {
 *     studentName: "John Doe",
 *     studentId: "STU-001",
 *     university: "Demo University",
 *   },
 * });
 *
 * // Display QR code with: offer.credentialOfferUrl
 * // Track status with: offer.invitationId
 * ```
 *
 * @example Webhook handling
 * ```typescript
 * import { createWebhookHandler, createRedisAdapter } from "@sovra/sovraid-sdk";
 * import { Redis } from "@upstash/redis";
 *
 * const redis = new Redis({ url: "...", token: "..." });
 * const webhookHandler = createWebhookHandler({
 *   webhookSecret: process.env.SOVRA_ID_WEBHOOK_SECRET,
 *   storage: createRedisAdapter(redis),
 * });
 *
 * // In your webhook endpoint:
 * const result = await webhookHandler.processEvent(rawBody, signatureHeader);
 * ```
 */
// Types
export * from "./types";
// Client
export { SovraIdClient, createSovraIdClient } from "./client";
// Webhooks
export { createWebhookHandler, validateWebhookSignature, CREDENTIAL_STATUS_PREFIX, VERIFICATION_STATUS_PREFIX, DEFAULT_EVENT_TTL_SECONDS, } from "./webhooks";
// Storage adapters
export { createRedisAdapter, createMemoryAdapter, createVercelKVAdapter, } from "./storage";
// Hooks
export { useCredentialStatusImplementation, isFinalStatus, createStatusChecker, } from "./hooks";
// Utilities
export { isValidUUID, getExpirationDate, buildPropertiesFromSubject, formatFieldLabel, createCredentialContext, buildVerificationFields, deepLinks, qrCode, } from "./utils";
//# sourceMappingURL=index.js.map