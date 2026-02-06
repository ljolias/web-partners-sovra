/**
 * SovraID Client
 * Main client for interacting with the SovraID API
 */
import { DEFAULT_API_URL, } from "../types";
import { buildPropertiesFromSubject, getExpirationDate } from "../utils";
export class SovraIdClient {
    constructor(config) {
        this.apiUrl = config.apiUrl || DEFAULT_API_URL;
        this.apiKey = config.apiKey;
        this.workspaceId = config.workspaceId;
        if (!this.apiKey) {
            throw new Error("SovraID API key is required");
        }
        if (!this.workspaceId) {
            throw new Error("SovraID workspace ID is required");
        }
    }
    /**
     * Make an authenticated API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
                ...options.headers,
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SovraID API error (${response.status}): ${errorText}`);
        }
        return response.json();
    }
    // ===========================================================================
    // Credential Issuance
    // ===========================================================================
    /**
     * Create a credential offer with full control over the credential structure
     */
    async createCredentialOffer(request) {
        const response = await this.request(`/credentials/workspace/${this.workspaceId}`, {
            method: "POST",
            body: JSON.stringify(request),
        });
        const invitationUrl = response.invitation_wallet?.invitationContent;
        const invitationId = response.invitation_wallet?.invitationId || response.id;
        if (!invitationUrl) {
            throw new Error("No invitation URL returned from SovraID");
        }
        return {
            credentialId: response.id,
            invitationId,
            credentialOfferUrl: invitationUrl,
        };
    }
    /**
     * Create a simple credential offer with minimal configuration
     */
    async createSimpleCredentialOffer(options) {
        const { type, name, description, credentialSubject, backgroundColor = "#0099ff", heroImageUrl, thumbnailUrl, expirationDate, } = options;
        const request = {
            credential: {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://schema.org/docs/jsonldcontext.jsonld",
                    "https://w3id.org/security/bbs/v1",
                ],
                type: ["VerifiableCredential", type],
                expirationDate: expirationDate || getExpirationDate(),
                credentialSubject,
            },
            outputDescriptor: {
                id: type.toLowerCase(),
                schema: "https://schema.org/VerifiableCredential",
                display: {
                    title: { text: name },
                    subtitle: description ? { text: description } : undefined,
                    description: { text: `Issued by SovraID` },
                    properties: buildPropertiesFromSubject(credentialSubject),
                },
                styles: {
                    text: { color: "#ffffff" },
                    background: { color: backgroundColor },
                    ...(heroImageUrl && { hero: { uri: heroImageUrl, alt: name } }),
                    ...(thumbnailUrl && { thumbnail: { uri: thumbnailUrl, alt: "Logo" } }),
                },
                backgroundColor,
            },
        };
        return this.createCredentialOffer(request);
    }
    // ===========================================================================
    // Credential Verification
    // ===========================================================================
    /**
     * Create a verification request with full control over input descriptors
     */
    async createVerificationRequest(request) {
        const response = await this.request(`/verifications/workspace/${this.workspaceId}`, {
            method: "POST",
            body: JSON.stringify(request),
        });
        const presentationWallet = response.presentation_wallet;
        const presentationUrl = presentationWallet?.presentationContent ||
            presentationWallet?.invitationContent;
        const invitationId = presentationWallet?.presentationId ||
            presentationWallet?.invitationId ||
            response.id;
        if (!presentationUrl) {
            throw new Error("No presentation URL returned from SovraID");
        }
        return {
            verificationId: response.id,
            invitationId,
            presentationUrl,
        };
    }
    /**
     * Create a simple verification request for a specific credential type
     */
    async createSimpleVerificationRequest(options) {
        const { credentialType, name, purpose, requiredFields, issuerName = "SovraID Verifier", backgroundColor = "#0a0915", } = options;
        const fields = requiredFields.map((field) => ({
            path: [`$.credentialSubject.${field}`],
            filter: { type: "string" },
        }));
        // Add credential type filter if specified
        if (credentialType) {
            fields.unshift({
                path: ["$.credentialSubject.credentialType"],
                filter: { type: "string", pattern: credentialType },
            });
        }
        const inputDescriptor = {
            id: name.toLowerCase().replace(/\s+/g, "-"),
            name,
            purpose,
            constraints: { fields },
        };
        const request = {
            inputDescriptors: [inputDescriptor],
            issuer: {
                name: issuerName,
                styles: {
                    background: { color: backgroundColor },
                    text: { color: "#ffffff" },
                },
            },
        };
        return this.createVerificationRequest(request);
    }
    /**
     * Check the status of a verification request
     */
    async getVerificationStatus(verificationId) {
        const response = await this.request(`/verifications/${verificationId}`, { method: "GET" });
        return {
            verificationId: response.id,
            verified: response.verified || false,
            holderDid: response.holder_did,
            verifierDid: response.verifier_did,
            status: response.verified ? "verified" : "pending",
        };
    }
}
/**
 * Create a SovraID client instance
 */
export function createSovraIdClient(config) {
    return new SovraIdClient(config);
}
//# sourceMappingURL=index.js.map