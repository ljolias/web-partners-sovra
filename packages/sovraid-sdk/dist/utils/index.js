/**
 * SovraID Utilities
 * Helper functions for working with verifiable credentials
 */
/**
 * UUID validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Validate that a string is a valid UUID
 */
export function isValidUUID(value) {
    return UUID_REGEX.test(value);
}
/**
 * Calculate expiration date (default: 1 year from now)
 */
export function getExpirationDate(yearsFromNow = 1) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearsFromNow);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
}
/**
 * Build output descriptor properties from a credential subject
 * Automatically creates display labels from field names
 */
export function buildPropertiesFromSubject(credentialSubject) {
    return Object.keys(credentialSubject).map((key) => ({
        path: [`$.credentialSubject.${key}`],
        fallback: "Unknown",
        label: formatFieldLabel(key),
        schema: {
            type: "string",
        },
    }));
}
/**
 * Format a camelCase or snake_case field name into a human-readable label
 */
export function formatFieldLabel(fieldName) {
    return fieldName
        // Insert space before uppercase letters (camelCase)
        .replace(/([A-Z])/g, " $1")
        // Replace underscores with spaces (snake_case)
        .replace(/_/g, " ")
        // Capitalize first letter
        .replace(/^./, (str) => str.toUpperCase())
        // Clean up multiple spaces
        .replace(/\s+/g, " ")
        .trim();
}
/**
 * Create a standard W3C credential context array
 */
export function createCredentialContext() {
    return [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.org/docs/jsonldcontext.jsonld",
        "https://w3id.org/security/bbs/v1",
    ];
}
/**
 * Build verification constraint fields for required subject fields
 */
export function buildVerificationFields(requiredFields, credentialType) {
    const fields = [];
    // Add credential type filter if specified
    if (credentialType) {
        fields.push({
            path: ["$.credentialSubject.credentialType"],
            filter: { type: "string", pattern: credentialType },
        });
    }
    // Add required field filters
    for (const field of requiredFields) {
        fields.push({
            path: [`$.credentialSubject.${field}`],
            filter: { type: "string" },
        });
    }
    return fields;
}
/**
 * Deep link URL builders for mobile wallet apps
 */
export const deepLinks = {
    /**
     * Create a deep link for credential offer (issuance)
     * Format: openid-credential-offer://?credential_offer_uri=<encoded_url>
     */
    credentialOffer(offerUrl) {
        return `openid-credential-offer://?credential_offer_uri=${encodeURIComponent(offerUrl)}`;
    },
    /**
     * Create a deep link for verification request (presentation)
     * Format: openid-vc://?request_uri=<encoded_url>
     */
    verificationRequest(presentationUrl) {
        return `openid-vc://?request_uri=${encodeURIComponent(presentationUrl)}`;
    },
};
/**
 * QR code content helpers
 */
export const qrCode = {
    /**
     * Get the content to encode in a QR code for credential issuance
     */
    forCredentialOffer(credentialOfferUrl) {
        return credentialOfferUrl;
    },
    /**
     * Get the content to encode in a QR code for verification
     */
    forVerification(presentationUrl) {
        return presentationUrl;
    },
};
//# sourceMappingURL=index.js.map