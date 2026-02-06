/**
 * SovraID Webhook Handler
 * Utilities for handling and validating SovraID webhook events
 */
import crypto from "crypto";
import { isValidUUID } from "../utils";
// Storage key prefixes
export const CREDENTIAL_STATUS_PREFIX = "sovra:credential:";
export const VERIFICATION_STATUS_PREFIX = "sovra:verification:";
// Default TTL for stored events (24 hours)
export const DEFAULT_EVENT_TTL_SECONDS = 86400;
/**
 * Validate webhook signature using HMAC-SHA256
 */
export function validateWebhookSignature(rawBody, signature, secret) {
    // If no webhook secret configured, allow (for development)
    if (!secret) {
        console.warn("[SovraID Webhook] No webhook secret configured. Skipping signature validation.");
        return { valid: true, reason: "no_secret_configured" };
    }
    // If secret is configured but no signature provided, reject
    if (!signature) {
        return { valid: false, reason: "missing_signature" };
    }
    // Compute expected signature
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
    // Use timing-safe comparison to prevent timing attacks
    try {
        const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        return { valid: isValid, reason: isValid ? undefined : "signature_mismatch" };
    }
    catch {
        // Buffers have different lengths
        return { valid: false, reason: "signature_length_mismatch" };
    }
}
/**
 * Create a webhook handler for processing SovraID events
 */
export function createWebhookHandler(config) {
    const { webhookSecret, storage, eventTTL = DEFAULT_EVENT_TTL_SECONDS, onCredentialIssued, onVerificationFinished, } = config;
    return {
        /**
         * Validate the webhook signature
         */
        validateSignature(rawBody, signature) {
            return validateWebhookSignature(rawBody, signature, webhookSecret);
        },
        /**
         * Process a webhook event
         */
        async processEvent(rawBody, signature) {
            // Validate signature
            const signatureResult = this.validateSignature(rawBody, signature);
            if (!signatureResult.valid) {
                return {
                    success: false,
                    message: "Invalid webhook signature",
                    error: signatureResult.reason,
                };
            }
            // Parse payload
            let payload;
            try {
                payload = JSON.parse(rawBody);
            }
            catch {
                return {
                    success: false,
                    message: "Invalid JSON payload",
                    error: "parse_error",
                };
            }
            // Route to appropriate handler
            switch (payload.eventType) {
                case "credential-issued":
                    return this.handleCredentialIssued(payload.eventData);
                case "verifiable-presentation-finished":
                    return this.handleVerificationFinished(payload.eventData);
                default:
                    return {
                        success: true,
                        message: `Unhandled event type: ${payload.eventType}`,
                    };
            }
        },
        /**
         * Handle credential-issued event
         */
        async handleCredentialIssued(eventData) {
            const { invitationId } = eventData;
            if (!invitationId) {
                return {
                    success: false,
                    message: "Missing invitationId",
                    error: "missing_invitation_id",
                };
            }
            if (!isValidUUID(invitationId)) {
                return {
                    success: false,
                    message: "Invalid invitationId format",
                    error: "invalid_invitation_id",
                };
            }
            // Store the credential status
            const statusKey = `${CREDENTIAL_STATUS_PREFIX}${invitationId}`;
            const statusData = {
                status: "issued",
                invitationId,
                issuedAt: new Date().toISOString(),
            };
            await storage.set(statusKey, statusData, { ex: eventTTL });
            // Call custom handler if provided
            if (onCredentialIssued) {
                await onCredentialIssued(eventData);
            }
            return {
                success: true,
                message: "Credential issued event processed",
                invitationId,
            };
        },
        /**
         * Handle verifiable-presentation-finished event
         */
        async handleVerificationFinished(eventData) {
            const { invitationId, verified, verifiableCredentials } = eventData;
            if (!invitationId) {
                return {
                    success: false,
                    message: "Missing invitationId",
                    error: "missing_invitation_id",
                };
            }
            if (!isValidUUID(invitationId)) {
                return {
                    success: false,
                    message: "Invalid invitationId format",
                    error: "invalid_invitation_id",
                };
            }
            // Extract credential types for UI styling
            const credentialTypes = verifiableCredentials?.map((vc) => vc.type || []) || [];
            // Store the verification status
            const statusKey = `${VERIFICATION_STATUS_PREFIX}${invitationId}`;
            const statusData = {
                status: verified ? "verified" : "failed",
                invitationId,
                verified: verified ?? false,
                credentialTypes,
                verifiedAt: new Date().toISOString(),
            };
            await storage.set(statusKey, statusData, { ex: eventTTL });
            // Call custom handler if provided
            if (onVerificationFinished) {
                await onVerificationFinished(eventData);
            }
            return {
                success: true,
                message: "Verification event processed",
                invitationId,
                verified,
            };
        },
        /**
         * Get credential status by invitationId
         */
        async getCredentialStatus(invitationId) {
            if (!isValidUUID(invitationId)) {
                return null;
            }
            const statusKey = `${CREDENTIAL_STATUS_PREFIX}${invitationId}`;
            return storage.get(statusKey);
        },
        /**
         * Get verification status by invitationId
         */
        async getVerificationStatus(invitationId) {
            if (!isValidUUID(invitationId)) {
                return null;
            }
            const statusKey = `${VERIFICATION_STATUS_PREFIX}${invitationId}`;
            return storage.get(statusKey);
        },
        /**
         * Get status by invitationId (auto-detects type)
         */
        async getStatus(invitationId, type) {
            return type === "verification"
                ? this.getVerificationStatus(invitationId)
                : this.getCredentialStatus(invitationId);
        },
    };
}
//# sourceMappingURL=index.js.map