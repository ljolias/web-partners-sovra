/**
 * SovraID SDK Types
 * Core type definitions for the SovraID verifiable credentials API
 */
export interface SovraIdConfig {
    apiUrl?: string;
    apiKey: string;
    workspaceId: string;
    webhookSecret?: string;
}
export declare const DEFAULT_API_URL = "https://id.api.sandbox.sovra.io/api";
export interface CredentialSubject {
    [key: string]: string | number | boolean | object;
}
export interface OutputDescriptorProperty {
    path: string[];
    fallback: string;
    label: string;
    schema: {
        type: string;
    };
}
export interface OutputDescriptorStyles {
    text?: {
        color: string;
    };
    background?: {
        color: string;
    };
    hero?: {
        uri: string;
        alt: string;
    };
    thumbnail?: {
        uri: string;
        alt: string;
    };
}
export interface OutputDescriptor {
    id: string;
    schema: string;
    display: {
        title: {
            text: string;
        };
        subtitle?: {
            text: string;
        };
        description?: {
            text: string;
        };
        properties?: OutputDescriptorProperty[];
    };
    styles?: OutputDescriptorStyles;
    backgroundColor?: string;
}
export interface CredentialRequest {
    credential: {
        "@context": string[];
        type: string[];
        expirationDate?: string;
        credentialSubject: CredentialSubject;
    };
    outputDescriptor: OutputDescriptor;
}
export interface CredentialResponse {
    id: string;
    invitation_wallet?: {
        invitationId: string;
        invitationContent: string;
    };
}
export interface CredentialOfferResult {
    credentialId: string;
    invitationId: string;
    credentialOfferUrl: string;
}
export interface VerificationConstraintField {
    path: string[];
    filter: {
        type: string;
        pattern?: string;
    };
}
export interface InputDescriptor {
    id: string;
    name: string;
    purpose: string;
    constraints: {
        fields: VerificationConstraintField[];
    };
}
export interface VerificationRequest {
    inputDescriptors: InputDescriptor[];
    issuer?: {
        name?: string;
        styles?: {
            background?: {
                color: string;
            };
            text?: {
                color: string;
            };
        };
    };
}
export interface VerificationResponse {
    id: string;
    presentation_wallet?: {
        presentationId?: string;
        invitationId?: string;
        presentationContent?: string;
        invitationContent?: string;
    };
    verified?: boolean;
    holder_did?: string;
    verifier_did?: string;
}
export interface VerificationRequestResult {
    verificationId: string;
    invitationId: string;
    presentationUrl: string;
}
export interface VerificationStatusResult {
    verificationId: string;
    verified: boolean;
    holderDid?: string;
    verifierDid?: string;
    status: "pending" | "verified" | "failed";
}
export type WebhookEventType = "credential-issued" | "verifiable-presentation-finished";
export interface WebhookPayload<T = unknown> {
    eventType: WebhookEventType;
    eventData: T;
}
export interface CredentialIssuedEvent {
    invitationId: string;
    holderDID?: string;
    vc?: {
        credentialSubject?: CredentialSubject;
        type?: string[];
    };
}
export interface VerifiablePresentationFinishedEvent {
    invitationId: string;
    holderDID?: string;
    verified?: boolean;
    verifiableCredentials?: Array<{
        credentialSubject?: CredentialSubject;
        type?: string[];
    }>;
}
export type CredentialStatusType = "pending" | "issued" | "verified" | "failed";
export interface CredentialStatus {
    status: CredentialStatusType;
    invitationId: string;
    holderDID?: string | null;
    credentialTypes?: string[][];
    issuedAt?: string;
    verifiedAt?: string;
    verified?: boolean;
    message?: string;
}
export interface StorageAdapter {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: {
        ex?: number;
    }): Promise<void>;
    delete(key: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map