/**
 * SovraID Client
 * Main client for interacting with the SovraID API
 */
import { SovraIdConfig, CredentialRequest, CredentialOfferResult, CredentialSubject, VerificationRequest, VerificationRequestResult, VerificationStatusResult } from "../types";
export declare class SovraIdClient {
    private apiUrl;
    private apiKey;
    private workspaceId;
    constructor(config: SovraIdConfig);
    /**
     * Make an authenticated API request
     */
    private request;
    /**
     * Create a credential offer with full control over the credential structure
     */
    createCredentialOffer(request: CredentialRequest): Promise<CredentialOfferResult>;
    /**
     * Create a simple credential offer with minimal configuration
     */
    createSimpleCredentialOffer(options: {
        type: string;
        name: string;
        description?: string;
        credentialSubject: CredentialSubject;
        backgroundColor?: string;
        heroImageUrl?: string;
        thumbnailUrl?: string;
        expirationDate?: string;
    }): Promise<CredentialOfferResult>;
    /**
     * Create a verification request with full control over input descriptors
     */
    createVerificationRequest(request: VerificationRequest): Promise<VerificationRequestResult>;
    /**
     * Create a simple verification request for a specific credential type
     */
    createSimpleVerificationRequest(options: {
        credentialType?: string;
        name: string;
        purpose: string;
        requiredFields: string[];
        issuerName?: string;
        backgroundColor?: string;
    }): Promise<VerificationRequestResult>;
    /**
     * Check the status of a verification request
     */
    getVerificationStatus(verificationId: string): Promise<VerificationStatusResult>;
}
/**
 * Create a SovraID client instance
 */
export declare function createSovraIdClient(config: SovraIdConfig): SovraIdClient;
//# sourceMappingURL=index.d.ts.map