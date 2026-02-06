/**
 * SovraID Webhook Handler
 * Utilities for handling and validating SovraID webhook events
 */
import { CredentialIssuedEvent, VerifiablePresentationFinishedEvent, CredentialStatus, StorageAdapter } from "../types";
export declare const CREDENTIAL_STATUS_PREFIX = "sovra:credential:";
export declare const VERIFICATION_STATUS_PREFIX = "sovra:verification:";
export declare const DEFAULT_EVENT_TTL_SECONDS = 86400;
export interface WebhookHandlerConfig {
    webhookSecret?: string;
    storage: StorageAdapter;
    eventTTL?: number;
    onCredentialIssued?: (event: CredentialIssuedEvent) => Promise<void>;
    onVerificationFinished?: (event: VerifiablePresentationFinishedEvent) => Promise<void>;
}
export interface WebhookHandlerResult {
    success: boolean;
    message: string;
    invitationId?: string;
    verified?: boolean;
    error?: string;
}
/**
 * Validate webhook signature using HMAC-SHA256
 */
export declare function validateWebhookSignature(rawBody: string, signature: string | null, secret: string | undefined): {
    valid: boolean;
    reason?: string;
};
/**
 * Create a webhook handler for processing SovraID events
 */
export declare function createWebhookHandler(config: WebhookHandlerConfig): {
    /**
     * Validate the webhook signature
     */
    validateSignature(rawBody: string, signature: string | null): {
        valid: boolean;
        reason?: string;
    };
    /**
     * Process a webhook event
     */
    processEvent(rawBody: string, signature: string | null): Promise<WebhookHandlerResult>;
    /**
     * Handle credential-issued event
     */
    handleCredentialIssued(eventData: CredentialIssuedEvent): Promise<WebhookHandlerResult>;
    /**
     * Handle verifiable-presentation-finished event
     */
    handleVerificationFinished(eventData: VerifiablePresentationFinishedEvent): Promise<WebhookHandlerResult>;
    /**
     * Get credential status by invitationId
     */
    getCredentialStatus(invitationId: string): Promise<CredentialStatus | null>;
    /**
     * Get verification status by invitationId
     */
    getVerificationStatus(invitationId: string): Promise<CredentialStatus | null>;
    /**
     * Get status by invitationId (auto-detects type)
     */
    getStatus(invitationId: string, type: "credential" | "verification"): Promise<CredentialStatus | null>;
};
export type WebhookHandler = ReturnType<typeof createWebhookHandler>;
//# sourceMappingURL=index.d.ts.map