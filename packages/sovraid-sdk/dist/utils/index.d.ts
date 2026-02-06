/**
 * SovraID Utilities
 * Helper functions for working with verifiable credentials
 */
import { CredentialSubject, OutputDescriptorProperty } from "../types";
/**
 * Validate that a string is a valid UUID
 */
export declare function isValidUUID(value: string): boolean;
/**
 * Calculate expiration date (default: 1 year from now)
 */
export declare function getExpirationDate(yearsFromNow?: number): string;
/**
 * Build output descriptor properties from a credential subject
 * Automatically creates display labels from field names
 */
export declare function buildPropertiesFromSubject(credentialSubject: CredentialSubject): OutputDescriptorProperty[];
/**
 * Format a camelCase or snake_case field name into a human-readable label
 */
export declare function formatFieldLabel(fieldName: string): string;
/**
 * Create a standard W3C credential context array
 */
export declare function createCredentialContext(): string[];
/**
 * Build verification constraint fields for required subject fields
 */
export declare function buildVerificationFields(requiredFields: string[], credentialType?: string): Array<{
    path: string[];
    filter: {
        type: string;
        pattern?: string;
    };
}>;
/**
 * Deep link URL builders for mobile wallet apps
 */
export declare const deepLinks: {
    /**
     * Create a deep link for credential offer (issuance)
     * Format: openid-credential-offer://?credential_offer_uri=<encoded_url>
     */
    credentialOffer(offerUrl: string): string;
    /**
     * Create a deep link for verification request (presentation)
     * Format: openid-vc://?request_uri=<encoded_url>
     */
    verificationRequest(presentationUrl: string): string;
};
/**
 * QR code content helpers
 */
export declare const qrCode: {
    /**
     * Get the content to encode in a QR code for credential issuance
     */
    forCredentialOffer(credentialOfferUrl: string): string;
    /**
     * Get the content to encode in a QR code for verification
     */
    forVerification(presentationUrl: string): string;
};
//# sourceMappingURL=index.d.ts.map