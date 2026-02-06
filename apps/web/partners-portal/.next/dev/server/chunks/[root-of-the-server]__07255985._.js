module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/apps/web/partners-portal/src/lib/redis/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "redis",
    ()=>redis
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$upstash$2b$redis$40$1$2e$36$2e$2$2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@upstash+redis@1.36.2/node_modules/@upstash/redis/nodejs.mjs [app-route] (ecmascript) <locals>");
;
function getRedisClient() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
        // During build time, return a dummy client that will fail gracefully
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Return a Redis instance that will fail on actual operations
        // This allows the build to succeed
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$upstash$2b$redis$40$1$2e$36$2e$2$2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Redis"]({
            url: url || 'https://placeholder.upstash.io',
            token: token || 'placeholder'
        });
    }
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$upstash$2b$redis$40$1$2e$36$2e$2$2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Redis"]({
        url,
        token
    });
}
const redis = getRedisClient();
const __TURBOPACK__default__export__ = redis;
}),
"[project]/apps/web/partners-portal/src/lib/redis/keys.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Redis Key Patterns for Partner Portal
__turbopack_context__.s([
    "TTL",
    ()=>TTL,
    "keys",
    ()=>keys
]);
const keys = {
    // Partners
    partner: (id)=>`partner:${id}`,
    partnerUsers: (partnerId)=>`partner:${partnerId}:users`,
    partnersByTier: (tier)=>`partners:by-tier:${tier}`,
    partnersByStatus: (status)=>`partners:by-status:${status}`,
    partnersByCountry: (country)=>`partners:by-country:${country}`,
    allPartners: ()=>`partners:all`,
    // Partner Credentials (SovraID)
    partnerCredential: (id)=>`credential:${id}`,
    partnerCredentials: (partnerId)=>`partner:${partnerId}:credentials`,
    allCredentials: ()=>`credentials:all`,
    credentialsByStatus: (status)=>`credentials:by-status:${status}`,
    credentialByEmail: (email)=>`credential:email:${email.toLowerCase()}`,
    // Users & Sessions
    user: (id)=>`user:${id}`,
    userByEmail: (email)=>`user:email:${email.toLowerCase()}`,
    session: (id)=>`session:${id}`,
    // Deals
    deal: (id)=>`deal:${id}`,
    partnerDeals: (partnerId)=>`partner:${partnerId}:deals`,
    dealsByDomain: (domain)=>`deals:by-domain:${domain.toLowerCase()}`,
    dealsByStage: (stage)=>`deals:by-stage:${stage}`,
    dealsByStatus: (status)=>`deals:by-status:${status}`,
    allDeals: ()=>`deals:all`,
    // Quotes
    quote: (id)=>`quote:${id}`,
    dealQuotes: (dealId)=>`deal:${dealId}:quotes`,
    partnerQuotes: (partnerId)=>`partner:${partnerId}:quotes`,
    // Pricing Configuration
    pricingConfig: ()=>`pricing:config`,
    // Training & Certifications
    trainingModule: (id)=>`training:module:${id}`,
    trainingModules: ()=>`training:modules`,
    userTrainingProgress: (userId)=>`user:${userId}:training:progress`,
    certification: (id)=>`certification:${id}`,
    userCertifications: (userId)=>`user:${userId}:certifications`,
    partnerCertifications: (partnerId)=>`partner:${partnerId}:certifications`,
    // Legal - Legacy
    legalDocument: (id)=>`legal:document:${id}`,
    legalDocuments: ()=>`legal:documents`,
    legalSignature: (id)=>`legal:signature:${id}`,
    userSignatures: (userId)=>`user:${userId}:signatures`,
    partnerSignatures: (partnerId)=>`partner:${partnerId}:signatures`,
    // Legal - Enhanced Documents
    legalDocumentV2: (id)=>`legal:v2:document:${id}`,
    partnerLegalDocuments: (partnerId)=>`partner:${partnerId}:legal:documents`,
    allLegalDocumentsV2: ()=>`legal:v2:all`,
    legalDocumentsByCategory: (category)=>`legal:v2:by-category:${category}`,
    legalDocumentsByStatus: (status)=>`legal:v2:by-status:${status}`,
    docusignEnvelope: (envelopeId)=>`legal:docusign:envelope:${envelopeId}`,
    // Legal - Audit Events
    documentAuditEvents: (documentId)=>`legal:v2:document:${documentId}:audit`,
    documentAuditEvent: (eventId)=>`legal:v2:audit:${eventId}`,
    // Copilot
    copilotSession: (id)=>`copilot:session:${id}`,
    copilotMessages: (sessionId)=>`copilot:session:${sessionId}:messages`,
    copilotMeddic: (sessionId)=>`copilot:session:${sessionId}:meddic`,
    dealCopilotSessions: (dealId)=>`deal:${dealId}:copilot:sessions`,
    // Commissions
    commission: (id)=>`commission:${id}`,
    partnerCommissions: (partnerId)=>`partner:${partnerId}:commissions`,
    dealCommission: (dealId)=>`deal:${dealId}:commission`,
    // Rating
    ratingEvents: (partnerId)=>`partner:${partnerId}:rating:events`,
    ratingCalculation: (partnerId)=>`partner:${partnerId}:rating:calculation`,
    partnerLastLogin: (partnerId)=>`partner:${partnerId}:last-login`,
    // Training Courses (Admin-managed)
    trainingCourse: (id)=>`training:course:${id}`,
    allTrainingCourses: ()=>`training:courses:all`,
    publishedTrainingCourses: ()=>`training:courses:published`,
    trainingCoursesByCategory: (category)=>`training:courses:by-category:${category}`,
    userCourseProgress: (userId)=>`user:${userId}:courses:progress`,
    // Audit Logs
    auditLog: (id)=>`audit:log:${id}`,
    allAuditLogs: ()=>`audit:logs:all`,
    auditLogsByEntity: (entityType, entityId)=>`audit:logs:entity:${entityType}:${entityId}`,
    auditLogsByAction: (action)=>`audit:logs:by-action:${action}`,
    auditLogsByActor: (actorId)=>`audit:logs:by-actor:${actorId}`,
    // Rewards system keys
    rewardPoints: (partnerId)=>`partner:${partnerId}:reward-points`,
    achievements: (partnerId)=>`partner:${partnerId}:achievements`,
    rewardsLeaderboard: ()=>`partners:rewards-leaderboard`,
    rewardEvents: (partnerId)=>`partner:${partnerId}:reward-events`,
    partnerStats: (partnerId)=>`partner:${partnerId}:stats`
};
const TTL = {
    session: 24 * 60 * 60,
    dealExclusivity: 90 * 24 * 60 * 60,
    copilotSession: 7 * 24 * 60 * 60
};
}),
"[project]/apps/web/partners-portal/src/lib/redis/operations.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PRICING_CONFIG",
    ()=>DEFAULT_PRICING_CONFIG,
    "addAuditLog",
    ()=>addAuditLog,
    "addCopilotMessage",
    ()=>addCopilotMessage,
    "addDocumentAuditLog",
    ()=>addDocumentAuditLog,
    "checkDomainConflict",
    ()=>checkDomainConflict,
    "createAuditLog",
    ()=>createAuditLog,
    "createCertification",
    ()=>createCertification,
    "createCommission",
    ()=>createCommission,
    "createCopilotSession",
    ()=>createCopilotSession,
    "createDeal",
    ()=>createDeal,
    "createDocumentAuditEvent",
    ()=>createDocumentAuditEvent,
    "createLegalDocument",
    ()=>createLegalDocument,
    "createLegalDocumentV2",
    ()=>createLegalDocumentV2,
    "createPartner",
    ()=>createPartner,
    "createPartnerCredential",
    ()=>createPartnerCredential,
    "createQuote",
    ()=>createQuote,
    "createSession",
    ()=>createSession,
    "createTrainingCourse",
    ()=>createTrainingCourse,
    "createTrainingModule",
    ()=>createTrainingModule,
    "createUser",
    ()=>createUser,
    "deletePartner",
    ()=>deletePartner,
    "deleteSession",
    ()=>deleteSession,
    "deleteTrainingCourse",
    ()=>deleteTrainingCourse,
    "generateId",
    ()=>generateId,
    "getAllAuditLogs",
    ()=>getAllAuditLogs,
    "getAllDeals",
    ()=>getAllDeals,
    "getAllLegalDocuments",
    ()=>getAllLegalDocuments,
    "getAllLegalDocumentsV2",
    ()=>getAllLegalDocumentsV2,
    "getAllPartners",
    ()=>getAllPartners,
    "getAllTrainingCourses",
    ()=>getAllTrainingCourses,
    "getAllTrainingModules",
    ()=>getAllTrainingModules,
    "getAuditLog",
    ()=>getAuditLog,
    "getAuditLogsByAction",
    ()=>getAuditLogsByAction,
    "getAuditLogsByActor",
    ()=>getAuditLogsByActor,
    "getAuditLogsByEntity",
    ()=>getAuditLogsByEntity,
    "getCertification",
    ()=>getCertification,
    "getCommission",
    ()=>getCommission,
    "getCopilotMeddic",
    ()=>getCopilotMeddic,
    "getCopilotMessages",
    ()=>getCopilotMessages,
    "getCopilotSession",
    ()=>getCopilotSession,
    "getCredentialByEmail",
    ()=>getCredentialByEmail,
    "getCredentialsByStatus",
    ()=>getCredentialsByStatus,
    "getDeal",
    ()=>getDeal,
    "getDealQuotes",
    ()=>getDealQuotes,
    "getDealsByStage",
    ()=>getDealsByStage,
    "getDealsByStatus",
    ()=>getDealsByStatus,
    "getDocumentAuditEvents",
    ()=>getDocumentAuditEvents,
    "getLegalDocument",
    ()=>getLegalDocument,
    "getLegalDocumentByEnvelopeId",
    ()=>getLegalDocumentByEnvelopeId,
    "getLegalDocumentV2",
    ()=>getLegalDocumentV2,
    "getLegalDocumentsByCategory",
    ()=>getLegalDocumentsByCategory,
    "getLegalDocumentsByStatus",
    ()=>getLegalDocumentsByStatus,
    "getNextQuoteVersion",
    ()=>getNextQuoteVersion,
    "getPartner",
    ()=>getPartner,
    "getPartnerCommissions",
    ()=>getPartnerCommissions,
    "getPartnerCredential",
    ()=>getPartnerCredential,
    "getPartnerCredentials",
    ()=>getPartnerCredentials,
    "getPartnerDeals",
    ()=>getPartnerDeals,
    "getPartnerDocumentsRequiringAction",
    ()=>getPartnerDocumentsRequiringAction,
    "getPartnerLegalDocuments",
    ()=>getPartnerLegalDocuments,
    "getPartnerPendingDocuments",
    ()=>getPartnerPendingDocuments,
    "getPartnerQuotes",
    ()=>getPartnerQuotes,
    "getPartnerStats",
    ()=>getPartnerStats,
    "getPartnerUsers",
    ()=>getPartnerUsers,
    "getPartnersByCountry",
    ()=>getPartnersByCountry,
    "getPartnersByStatus",
    ()=>getPartnersByStatus,
    "getPartnersByTier",
    ()=>getPartnersByTier,
    "getPricingConfig",
    ()=>getPricingConfig,
    "getPublishedTrainingCourses",
    ()=>getPublishedTrainingCourses,
    "getQuote",
    ()=>getQuote,
    "getSession",
    ()=>getSession,
    "getTrainingCourse",
    ()=>getTrainingCourse,
    "getTrainingCoursesByCategory",
    ()=>getTrainingCoursesByCategory,
    "getTrainingModule",
    ()=>getTrainingModule,
    "getUser",
    ()=>getUser,
    "getUserByEmail",
    ()=>getUserByEmail,
    "getUserCertifications",
    ()=>getUserCertifications,
    "getUserSignatures",
    ()=>getUserSignatures,
    "getUserTrainingProgress",
    ()=>getUserTrainingProgress,
    "hasSignedRequiredDocs",
    ()=>hasSignedRequiredDocs,
    "hasValidCertification",
    ()=>hasValidCertification,
    "publishTrainingCourse",
    ()=>publishTrainingCourse,
    "reactivatePartner",
    ()=>reactivatePartner,
    "revokeAllPartnerCredentials",
    ()=>revokeAllPartnerCredentials,
    "revokePartnerCredential",
    ()=>revokePartnerCredential,
    "savePricingConfig",
    ()=>savePricingConfig,
    "signLegalDocument",
    ()=>signLegalDocument,
    "suspendPartner",
    ()=>suspendPartner,
    "unpublishTrainingCourse",
    ()=>unpublishTrainingCourse,
    "updateCommission",
    ()=>updateCommission,
    "updateCopilotMeddic",
    ()=>updateCopilotMeddic,
    "updateDeal",
    ()=>updateDeal,
    "updateLegalDocumentV2",
    ()=>updateLegalDocumentV2,
    "updatePartner",
    ()=>updatePartner,
    "updatePartnerCredential",
    ()=>updatePartnerCredential,
    "updatePricingConfig",
    ()=>updatePricingConfig,
    "updateQuote",
    ()=>updateQuote,
    "updateTrainingCourse",
    ()=>updateTrainingCourse,
    "updateTrainingProgress",
    ()=>updateTrainingProgress,
    "updateUser",
    ()=>updateUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/keys.ts [app-route] (ecmascript)");
;
;
// Helper to convert objects to Redis-compatible format
function toRedisHash(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)){
        if (value === null || value === undefined) {
            result[key] = '';
        } else if (typeof value === 'object') {
            result[key] = JSON.stringify(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
async function getPartner(id) {
    const partner = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partner(id));
    if (!partner || !partner.id) return null;
    // Parse numbers
    if (typeof partner.rating === 'string') partner.rating = parseFloat(partner.rating);
    if (typeof partner.totalDeals === 'string') partner.totalDeals = parseInt(partner.totalDeals, 10);
    if (typeof partner.wonDeals === 'string') partner.wonDeals = parseInt(partner.wonDeals, 10);
    if (typeof partner.totalRevenue === 'string') partner.totalRevenue = parseFloat(partner.totalRevenue);
    // Parse certifications if JSON
    if (typeof partner.certifications === 'string' && partner.certifications) {
        partner.certifications = JSON.parse(partner.certifications);
    }
    return partner;
}
async function createPartner(partner) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const partnerData = {
        ...partner,
        certifications: partner.certifications ? JSON.stringify(partner.certifications) : ''
    };
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partner(partner.id), toRedisHash(partnerData));
    // Add to tier index
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByTier(partner.tier), {
        score: partner.rating,
        member: partner.id
    });
    // Add to status index
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByStatus(partner.status), partner.id);
    // Add to country index
    if (partner.country) {
        pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByCountry(partner.country), partner.id);
    }
    // Add to all partners sorted by creation time
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allPartners(), {
        score: new Date(partner.createdAt).getTime(),
        member: partner.id
    });
    await pipeline.exec();
}
async function getAllPartners(limit = 100) {
    // First try the allPartners index
    let partnerIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allPartners(), 0, limit - 1, {
        rev: true
    });
    // If empty, scan for partner keys (for existing data)
    if (!partnerIds.length) {
        const partnerKeys = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].keys('partner:*');
        partnerIds = partnerKeys.filter((k)=>!k.includes(':') || k.split(':').length === 2) // Only partner:{id} keys
        .filter((k)=>!k.includes('users') && !k.includes('deals') && !k.includes('legal')).map((k)=>k.replace('partner:', ''));
    }
    if (!partnerIds.length) return [];
    const partners = await Promise.all(partnerIds.map((id)=>getPartner(id)));
    return partners.filter((p)=>p !== null);
}
async function getPartnersByStatus(status) {
    const partnerIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByStatus(status));
    if (!partnerIds.length) return [];
    const partners = await Promise.all(partnerIds.map((id)=>getPartner(id)));
    return partners.filter((p)=>p !== null);
}
async function getPartnersByTier(tier) {
    const partnerIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByTier(tier), 0, -1);
    if (!partnerIds.length) return [];
    const partners = await Promise.all(partnerIds.map((id)=>getPartner(id)));
    return partners.filter((p)=>p !== null);
}
async function getPartnersByCountry(country) {
    const partnerIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByCountry(country));
    if (!partnerIds.length) return [];
    const partners = await Promise.all(partnerIds.map((id)=>getPartner(id)));
    return partners.filter((p)=>p !== null);
}
async function updatePartner(id, updates) {
    const partner = await getPartner(id);
    if (!partner) throw new Error('Partner not found');
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    if (updates.certifications) updateData.certifications = JSON.stringify(updates.certifications);
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partner(id), toRedisHash(updateData));
    // Update tier index if changed
    if (updates.tier && updates.tier !== partner.tier) {
        pipeline.zrem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByTier(partner.tier), id);
        pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByTier(updates.tier), {
            score: updates.rating ?? partner.rating,
            member: id
        });
    }
    // Update status index if changed
    if (updates.status && updates.status !== partner.status) {
        pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByStatus(partner.status), id);
        pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByStatus(updates.status), id);
    }
    // Update country index if changed
    if (updates.country && updates.country !== partner.country) {
        if (partner.country) {
            pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByCountry(partner.country), id);
        }
        pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByCountry(updates.country), id);
    }
    await pipeline.exec();
}
async function suspendPartner(id, suspendedBy, reason) {
    await updatePartner(id, {
        status: 'suspended',
        suspendedAt: new Date().toISOString(),
        suspendedBy,
        suspendedReason: reason
    });
}
async function reactivatePartner(id) {
    const partner = await getPartner(id);
    if (!partner) throw new Error('Partner not found');
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    // Clear suspension fields and set active
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partner(id), toRedisHash({
        status: 'active',
        suspendedAt: '',
        suspendedBy: '',
        suspendedReason: '',
        updatedAt: new Date().toISOString()
    }));
    // Update status index
    pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByStatus('suspended'), id);
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByStatus('active'), id);
    await pipeline.exec();
}
async function deletePartner(id) {
    const partner = await getPartner(id);
    if (!partner) throw new Error('Partner not found');
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    // Delete partner hash
    pipeline.del(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partner(id));
    // Remove from all indexes
    pipeline.zrem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allPartners(), id);
    pipeline.zrem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByTier(partner.tier), id);
    pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByStatus(partner.status), id);
    if (partner.country) {
        pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnersByCountry(partner.country), id);
    }
    // Get and delete all partner deals
    const dealIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerDeals(id), 0, -1);
    for (const dealId of dealIds){
        pipeline.del(`deal:${dealId}`);
        pipeline.zrem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allDeals(), dealId);
    }
    pipeline.del(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerDeals(id));
    // Get and delete all partner credentials
    const credentialIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCredentials(id));
    for (const credId of credentialIds){
        pipeline.del(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCredential(credId));
    }
    pipeline.del(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCredentials(id));
    // Delete partner users
    const userIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerUsers(id));
    for (const userId of userIds){
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(`user:${userId}`);
        if (user?.email) {
            pipeline.del(`user:email:${user.email}`);
        }
        pipeline.del(`user:${userId}`);
    }
    pipeline.del(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerUsers(id));
    // Delete partner legal documents
    pipeline.del(`partner:${id}:legal:documents`);
    pipeline.del(`partner:${id}:signatures`);
    // Delete partner certifications
    pipeline.del(`partner:${id}:certifications`);
    // Delete partner commissions
    pipeline.del(`partner:${id}:commissions`);
    await pipeline.exec();
}
async function getPartnerStats(partnerId) {
    const [deals, credentials] = await Promise.all([
        getPartnerDeals(partnerId),
        getPartnerCredentials(partnerId)
    ]);
    const wonDeals = deals.filter((d)=>d.status === 'closed_won').length;
    const lostDeals = deals.filter((d)=>d.status === 'closed_lost').length;
    const pendingDeals = deals.filter((d)=>![
            'closed_won',
            'closed_lost',
            'rejected'
        ].includes(d.status)).length;
    return {
        totalDeals: deals.length,
        wonDeals,
        lostDeals,
        pendingDeals,
        totalRevenue: 0,
        credentialsCount: credentials.length,
        activeCredentials: credentials.filter((c)=>c.status === 'active').length
    };
}
async function getUser(id) {
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].user(id));
    if (!user || !user.id) return null;
    return user;
}
async function getUserByEmail(email) {
    const userId = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].userByEmail(email));
    if (!userId) return null;
    return getUser(userId);
}
async function createUser(user) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].user(user.id), toRedisHash(user));
    pipeline.set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].userByEmail(user.email), user.id);
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerUsers(user.partnerId), user.id);
    await pipeline.exec();
}
async function updateUser(id, updates) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].user(id), toRedisHash({
        ...updates,
        updatedAt: new Date().toISOString()
    }));
}
async function getPartnerUsers(partnerId) {
    const userIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerUsers(partnerId));
    if (!userIds.length) return [];
    const users = await Promise.all(userIds.map((id)=>getUser(id)));
    return users.filter((u)=>u !== null);
}
async function createSession(userId, partnerId) {
    const session = {
        id: generateId(),
        userId,
        partnerId,
        expiresAt: new Date(Date.now() + __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TTL"].session * 1000).toISOString(),
        createdAt: new Date().toISOString()
    };
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].session(session.id), toRedisHash(session));
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].expire(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].session(session.id), __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TTL"].session);
    return session;
}
async function getSession(id) {
    const session = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].session(id));
    if (!session || !session.id) return null;
    if (new Date(session.expiresAt) < new Date()) {
        await deleteSession(id);
        return null;
    }
    return session;
}
async function deleteSession(id) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].del(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].session(id));
}
async function getDeal(id) {
    const deal = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].deal(id));
    if (!deal || !deal.id) return null;
    // Parse population as number if stored as string
    if (typeof deal.population === 'string') {
        deal.population = parseInt(deal.population, 10);
    }
    // Parse boolean if stored as string
    if (typeof deal.partnerGeneratedLead === 'string') {
        deal.partnerGeneratedLead = deal.partnerGeneratedLead === 'true';
    }
    return deal;
}
async function getPartnerDeals(partnerId, limit = 50) {
    const dealIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerDeals(partnerId), 0, limit - 1, {
        rev: true
    });
    if (!dealIds.length) return [];
    const deals = await Promise.all(dealIds.map((id)=>getDeal(id)));
    return deals.filter((d)=>d !== null);
}
async function createDeal(deal) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].deal(deal.id), toRedisHash(deal));
    // Add to partner's deals sorted by creation time
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerDeals(deal.partnerId), {
        score: new Date(deal.createdAt).getTime(),
        member: deal.id
    });
    // Add to all deals index
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allDeals(), {
        score: new Date(deal.createdAt).getTime(),
        member: deal.id
    });
    // Add to status index
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealsByStatus(deal.status), deal.id);
    await pipeline.exec();
}
async function updateDeal(id, updates) {
    const deal = await getDeal(id);
    if (!deal) throw new Error('Deal not found');
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].deal(id), toRedisHash(updateData));
    // Update status index if changed
    if (updates.status && updates.status !== deal.status) {
        pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealsByStatus(deal.status), id);
        pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealsByStatus(updates.status), id);
    }
    await pipeline.exec();
}
async function getDealsByStatus(status) {
    const dealIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealsByStatus(status));
    if (!dealIds.length) return [];
    const deals = await Promise.all(dealIds.map((id)=>getDeal(id)));
    return deals.filter((d)=>d !== null);
}
async function getAllDeals(limit = 100) {
    const dealIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allDeals(), 0, limit - 1, {
        rev: true
    });
    if (!dealIds.length) return [];
    const deals = await Promise.all(dealIds.map((id)=>getDeal(id)));
    return deals.filter((d)=>d !== null);
}
async function checkDomainConflict(domain, excludeDealId) {
    const existingDealIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealsByDomain(domain.toLowerCase()));
    if (excludeDealId) {
        return existingDealIds.filter((id)=>id !== excludeDealId);
    }
    return existingDealIds;
}
async function getDealsByStage(stage) {
    const dealIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealsByStage(stage));
    if (!dealIds.length) return [];
    const deals = await Promise.all(dealIds.map((id)=>getDeal(id)));
    return deals.filter((d)=>d !== null);
}
async function getTrainingModule(id) {
    const module = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingModule(id));
    if (!module || !module.id) return null;
    // Parse JSON fields
    if (typeof module.title === 'string') module.title = JSON.parse(module.title);
    if (typeof module.description === 'string') module.description = JSON.parse(module.description);
    if (typeof module.content === 'string') module.content = JSON.parse(module.content);
    if (typeof module.quiz === 'string') module.quiz = JSON.parse(module.quiz);
    return module;
}
async function getAllTrainingModules() {
    const moduleIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingModules());
    if (!moduleIds.length) return [];
    const modules = await Promise.all(moduleIds.map((id)=>getTrainingModule(id)));
    return modules.filter((m)=>m !== null).sort((a, b)=>a.order - b.order);
}
async function createTrainingModule(module) {
    const moduleData = {
        ...module,
        title: JSON.stringify(module.title),
        description: JSON.stringify(module.description),
        content: JSON.stringify(module.content),
        quiz: JSON.stringify(module.quiz)
    };
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingModule(module.id), toRedisHash(moduleData));
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingModules(), module.id);
    await pipeline.exec();
}
async function getUserTrainingProgress(userId) {
    const progress = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].userTrainingProgress(userId));
    if (!progress) return {};
    const parsed = {};
    for (const [moduleId, data] of Object.entries(progress)){
        parsed[moduleId] = typeof data === 'string' ? JSON.parse(data) : data;
    }
    return parsed;
}
async function updateTrainingProgress(userId, progress) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].userTrainingProgress(userId), {
        [progress.moduleId]: JSON.stringify(progress)
    });
}
async function getCertification(id) {
    const cert = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].certification(id));
    if (!cert || !cert.id) return null;
    return cert;
}
async function getUserCertifications(userId) {
    const certIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].userCertifications(userId));
    if (!certIds.length) return [];
    const certs = await Promise.all(certIds.map((id)=>getCertification(id)));
    return certs.filter((c)=>c !== null);
}
async function createCertification(cert) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].certification(cert.id), toRedisHash(cert));
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].userCertifications(cert.userId), cert.id);
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCertifications(cert.partnerId), cert.id);
    await pipeline.exec();
}
async function hasValidCertification(userId) {
    const certs = await getUserCertifications(userId);
    return certs.some((cert)=>cert.status === 'active' && new Date(cert.expiresAt) > new Date());
}
async function getLegalDocument(id) {
    const doc = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocument(id));
    if (!doc || !doc.id) return null;
    if (typeof doc.title === 'string') doc.title = JSON.parse(doc.title);
    if (typeof doc.content === 'string') doc.content = JSON.parse(doc.content);
    return doc;
}
async function getAllLegalDocuments() {
    const docIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocuments());
    if (!docIds.length) return [];
    const docs = await Promise.all(docIds.map((id)=>getLegalDocument(id)));
    return docs.filter((d)=>d !== null);
}
async function createLegalDocument(doc) {
    const docData = {
        ...doc,
        title: JSON.stringify(doc.title),
        content: JSON.stringify(doc.content)
    };
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocument(doc.id), toRedisHash(docData));
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocuments(), doc.id);
    await pipeline.exec();
}
async function signLegalDocument(signature) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalSignature(signature.id), toRedisHash(signature));
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].userSignatures(signature.userId), signature.id);
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerSignatures(signature.partnerId), signature.id);
    await pipeline.exec();
}
async function getUserSignatures(userId) {
    const sigIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].userSignatures(userId));
    if (!sigIds.length) return [];
    const sigs = await Promise.all(sigIds.map((id)=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalSignature(id))));
    return sigs.filter((s)=>s !== null && !!s.id);
}
async function hasSignedRequiredDocs(userId) {
    const [docs, signatures] = await Promise.all([
        getAllLegalDocuments(),
        getUserSignatures(userId)
    ]);
    const requiredDocs = docs.filter((d)=>d.requiredForDeals);
    const signedDocIds = new Set(signatures.map((s)=>s.documentId));
    return requiredDocs.every((doc)=>signedDocIds.has(doc.id));
}
async function createCopilotSession(dealId, userId) {
    const session = {
        id: generateId(),
        dealId,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].copilotSession(session.id), toRedisHash(session));
    pipeline.expire(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].copilotSession(session.id), __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TTL"].copilotSession);
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealCopilotSessions(dealId), session.id);
    await pipeline.exec();
    return session;
}
async function getCopilotSession(id) {
    const session = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].copilotSession(id));
    if (!session || !session.id) return null;
    return session;
}
async function addCopilotMessage(sessionId, message) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].rpush(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].copilotMessages(sessionId), JSON.stringify(message));
}
async function getCopilotMessages(sessionId) {
    const messages = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].lrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].copilotMessages(sessionId), 0, -1);
    return messages.map((m)=>typeof m === 'string' ? JSON.parse(m) : m);
}
async function updateCopilotMeddic(sessionId, scores) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].copilotMeddic(sessionId), toRedisHash(scores));
}
async function getCopilotMeddic(sessionId) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].copilotMeddic(sessionId)) || {};
}
async function getCommission(id) {
    const commission = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].commission(id));
    if (!commission || !commission.id) return null;
    return commission;
}
async function getPartnerCommissions(partnerId) {
    const commIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCommissions(partnerId));
    if (!commIds.length) return [];
    const comms = await Promise.all(commIds.map((id)=>getCommission(id)));
    return comms.filter((c)=>c !== null);
}
async function createCommission(commission) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].commission(commission.id), toRedisHash(commission));
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCommissions(commission.partnerId), commission.id);
    pipeline.set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealCommission(commission.dealId), commission.id);
    await pipeline.exec();
}
async function updateCommission(id, updates) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].commission(id), toRedisHash(updates));
}
async function getQuote(id) {
    const quote = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].quote(id));
    if (!quote || !quote.id) return null;
    // Parse JSON fields
    if (typeof quote.products === 'string') quote.products = JSON.parse(quote.products);
    if (typeof quote.services === 'string') quote.services = JSON.parse(quote.services);
    if (typeof quote.discounts === 'string') quote.discounts = JSON.parse(quote.discounts);
    // Parse numbers
    if (typeof quote.version === 'string') quote.version = parseInt(quote.version, 10);
    if (typeof quote.subtotal === 'string') quote.subtotal = parseFloat(quote.subtotal);
    if (typeof quote.totalDiscount === 'string') quote.totalDiscount = parseFloat(quote.totalDiscount);
    if (typeof quote.total === 'string') quote.total = parseFloat(quote.total);
    return quote;
}
async function getDealQuotes(dealId) {
    const quoteIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealQuotes(dealId), 0, -1, {
        rev: true
    });
    if (!quoteIds.length) return [];
    const quotes = await Promise.all(quoteIds.map((id)=>getQuote(id)));
    return quotes.filter((q)=>q !== null);
}
async function getPartnerQuotes(partnerId, limit = 50) {
    const quoteIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerQuotes(partnerId), 0, limit - 1, {
        rev: true
    });
    if (!quoteIds.length) return [];
    const quotes = await Promise.all(quoteIds.map((id)=>getQuote(id)));
    return quotes.filter((q)=>q !== null);
}
async function createQuote(quote) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const quoteData = {
        ...quote,
        products: JSON.stringify(quote.products),
        services: JSON.stringify(quote.services),
        discounts: JSON.stringify(quote.discounts)
    };
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].quote(quote.id), toRedisHash(quoteData));
    // Add to deal's quotes sorted by version
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].dealQuotes(quote.dealId), {
        score: quote.version,
        member: quote.id
    });
    // Add to partner's quotes sorted by creation time
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerQuotes(quote.partnerId), {
        score: new Date(quote.createdAt).getTime(),
        member: quote.id
    });
    await pipeline.exec();
}
async function updateQuote(id, updates) {
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    // Serialize nested objects
    if (updates.products) updateData.products = JSON.stringify(updates.products);
    if (updates.services) updateData.services = JSON.stringify(updates.services);
    if (updates.discounts) updateData.discounts = JSON.stringify(updates.discounts);
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].quote(id), toRedisHash(updateData));
}
async function getNextQuoteVersion(dealId) {
    const quotes = await getDealQuotes(dealId);
    if (!quotes.length) return 1;
    return Math.max(...quotes.map((q)=>q.version)) + 1;
}
// ============ Pricing Config Operations ============
const DEFAULT_PRICING_CONFIG = {
    sovraGov: {
        tiers: [
            {
                maxPopulation: 100000,
                pricePerInhabitant: 0.50
            },
            {
                maxPopulation: 250000,
                pricePerInhabitant: 0.40
            },
            {
                maxPopulation: 500000,
                pricePerInhabitant: 0.32
            },
            {
                maxPopulation: 1000000,
                pricePerInhabitant: 0.26
            },
            {
                maxPopulation: 2500000,
                pricePerInhabitant: 0.20
            },
            {
                maxPopulation: 5000000,
                pricePerInhabitant: 0.16
            },
            {
                maxPopulation: 10000000,
                pricePerInhabitant: 0.13
            }
        ]
    },
    sovraId: {
        essentials: {
            monthlyLimit: 10000,
            monthlyPrice: 1000
        },
        professional: {
            monthlyLimit: 30000,
            monthlyPrice: 2000
        },
        enterprise: {
            monthlyLimit: 50000,
            monthlyPrice: 3000
        }
    },
    services: {
        walletImplementation: 5000,
        integrationHourlyRate: 150
    },
    discounts: {
        bronze: {
            base: 5,
            leadBonus: 0
        },
        silver: {
            base: 20,
            leadBonus: 10
        },
        gold: {
            base: 25,
            leadBonus: 15
        },
        platinum: {
            base: 30,
            leadBonus: 20
        }
    }
};
async function getPricingConfig() {
    const config = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].pricingConfig());
    if (!config) {
        // Initialize with default config
        await savePricingConfig(DEFAULT_PRICING_CONFIG);
        return DEFAULT_PRICING_CONFIG;
    }
    return typeof config === 'string' ? JSON.parse(config) : config;
}
async function savePricingConfig(config) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].pricingConfig(), JSON.stringify(config));
}
async function updatePricingConfig(updates) {
    const current = await getPricingConfig();
    const updated = {
        ...current,
        ...updates
    };
    await savePricingConfig(updated);
    return updated;
}
;
async function getLegalDocumentV2(id) {
    const doc = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentV2(id));
    if (!doc || !doc.id) return null;
    // Parse JSON fields (handle empty strings)
    if (typeof doc.docusignMetadata === 'string' && doc.docusignMetadata) {
        doc.docusignMetadata = JSON.parse(doc.docusignMetadata);
    } else {
        doc.docusignMetadata = undefined;
    }
    if (typeof doc.uploadMetadata === 'string' && doc.uploadMetadata) {
        doc.uploadMetadata = JSON.parse(doc.uploadMetadata);
    } else {
        doc.uploadMetadata = undefined;
    }
    // Parse numbers
    if (typeof doc.version === 'string') doc.version = parseInt(doc.version, 10);
    return doc;
}
async function getPartnerLegalDocuments(partnerId, limit = 100) {
    console.log('[Redis] Fetching documents for partner:', partnerId, 'key:', __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerLegalDocuments(partnerId));
    const docIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerLegalDocuments(partnerId), 0, limit - 1, {
        rev: true
    });
    console.log('[Redis] Found document IDs:', docIds.length, docIds);
    if (!docIds.length) return [];
    const docs = await Promise.all(docIds.map((id)=>getLegalDocumentV2(id)));
    return docs.filter((d)=>d !== null);
}
async function getAllLegalDocumentsV2(limit = 100) {
    const docIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allLegalDocumentsV2(), 0, limit - 1, {
        rev: true
    });
    if (!docIds.length) return [];
    const docs = await Promise.all(docIds.map((id)=>getLegalDocumentV2(id)));
    return docs.filter((d)=>d !== null);
}
async function getLegalDocumentsByCategory(category, limit = 100) {
    const docIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentsByCategory(category));
    if (!docIds.length) return [];
    const docs = await Promise.all(docIds.map((id)=>getLegalDocumentV2(id)));
    return docs.filter((d)=>d !== null).slice(0, limit);
}
async function getLegalDocumentsByStatus(status, limit = 100) {
    const docIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentsByStatus(status));
    if (!docIds.length) return [];
    const docs = await Promise.all(docIds.map((id)=>getLegalDocumentV2(id)));
    return docs.filter((d)=>d !== null).slice(0, limit);
}
async function createLegalDocumentV2(doc) {
    console.log('[Redis] Creating legal document:', doc.id, 'for partner:', doc.partnerId);
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const docData = {
        ...doc,
        docusignMetadata: doc.docusignMetadata ? JSON.stringify(doc.docusignMetadata) : '',
        uploadMetadata: doc.uploadMetadata ? JSON.stringify(doc.uploadMetadata) : ''
    };
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentV2(doc.id), toRedisHash(docData));
    // Add to partner's documents sorted by creation time
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerLegalDocuments(doc.partnerId), {
        score: new Date(doc.createdAt).getTime(),
        member: doc.id
    });
    // Add to all documents index
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allLegalDocumentsV2(), {
        score: new Date(doc.createdAt).getTime(),
        member: doc.id
    });
    // Add to category index
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentsByCategory(doc.category), doc.id);
    // Add to status index
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentsByStatus(doc.status), doc.id);
    // If DocuSign document, create envelope mapping
    if (doc.type === 'docusign' && doc.docusignMetadata?.envelopeId) {
        pipeline.set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].docusignEnvelope(doc.docusignMetadata.envelopeId), doc.id);
    }
    await pipeline.exec();
}
async function updateLegalDocumentV2(id, updates) {
    const doc = await getLegalDocumentV2(id);
    if (!doc) throw new Error('Document not found');
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    // Serialize nested objects
    if (updates.docusignMetadata) updateData.docusignMetadata = JSON.stringify(updates.docusignMetadata);
    if (updates.uploadMetadata) updateData.uploadMetadata = JSON.stringify(updates.uploadMetadata);
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentV2(id), toRedisHash(updateData));
    // Update status index if changed
    if (updates.status && updates.status !== doc.status) {
        pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentsByStatus(doc.status), id);
        pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentsByStatus(updates.status), id);
    }
    // Update category index if changed
    if (updates.category && updates.category !== doc.category) {
        pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentsByCategory(doc.category), id);
        pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].legalDocumentsByCategory(updates.category), id);
    }
    await pipeline.exec();
}
async function getLegalDocumentByEnvelopeId(envelopeId) {
    const docId = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].docusignEnvelope(envelopeId));
    if (!docId) return null;
    return getLegalDocumentV2(docId);
}
async function createDocumentAuditEvent(event) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].documentAuditEvent(event.id), toRedisHash(event));
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].documentAuditEvents(event.documentId), {
        score: new Date(event.timestamp).getTime(),
        member: event.id
    });
    await pipeline.exec();
}
async function getDocumentAuditEvents(documentId, limit = 50) {
    const eventIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].documentAuditEvents(documentId), 0, limit - 1, {
        rev: true
    });
    if (!eventIds.length) return [];
    const events = await Promise.all(eventIds.map(async (id)=>{
        const event = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].documentAuditEvent(id));
        if (!event || !event.id) return null;
        if (typeof event.details === 'string') event.details = JSON.parse(event.details);
        return event;
    }));
    return events.filter((e)=>e !== null);
}
async function addDocumentAuditLog(documentId, action, actor, details, request) {
    const event = {
        id: generateId(),
        documentId,
        action,
        actorType: actor.type,
        actorId: actor.id,
        actorName: actor.name,
        details,
        ipAddress: request?.ipAddress,
        userAgent: request?.userAgent,
        timestamp: new Date().toISOString()
    };
    await createDocumentAuditEvent(event);
}
async function getPartnerPendingDocuments(partnerId) {
    const docs = await getPartnerLegalDocuments(partnerId);
    return docs.filter((doc)=>doc.status === 'pending_signature' || doc.type === 'upload' && doc.uploadMetadata?.verificationStatus === 'pending' && doc.uploadMetadata?.uploadedBy === 'partner');
}
async function getPartnerDocumentsRequiringAction(partnerId) {
    const docs = await getPartnerLegalDocuments(partnerId);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const pendingSignature = docs.filter((doc)=>doc.status === 'pending_signature' || doc.status === 'partially_signed');
    const expiringSOon = docs.filter((doc)=>{
        if (!doc.expirationDate || doc.status !== 'active') return false;
        const expDate = new Date(doc.expirationDate);
        return expDate > now && expDate <= thirtyDaysFromNow;
    });
    return {
        pendingSignature,
        expiringSOon
    };
}
async function getPartnerCredential(id) {
    const credential = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCredential(id));
    if (!credential || !credential.id) return null;
    return credential;
}
async function getPartnerCredentials(partnerId, limit = 100) {
    const credentialIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCredentials(partnerId), 0, limit - 1, {
        rev: true
    });
    if (!credentialIds.length) return [];
    const credentials = await Promise.all(credentialIds.map((id)=>getPartnerCredential(id)));
    return credentials.filter((c)=>c !== null);
}
async function getCredentialsByStatus(status) {
    const credentialIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].credentialsByStatus(status));
    if (!credentialIds.length) return [];
    const credentials = await Promise.all(credentialIds.map((id)=>getPartnerCredential(id)));
    return credentials.filter((c)=>c !== null);
}
async function getCredentialByEmail(email) {
    const credentialId = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].credentialByEmail(email));
    if (!credentialId) return null;
    return getPartnerCredential(credentialId);
}
async function createPartnerCredential(credential) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCredential(credential.id), toRedisHash(credential));
    // Add to partner's credentials sorted by creation time
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCredentials(credential.partnerId), {
        score: new Date(credential.createdAt).getTime(),
        member: credential.id
    });
    // Add to all credentials index
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allCredentials(), {
        score: new Date(credential.createdAt).getTime(),
        member: credential.id
    });
    // Add to status index
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].credentialsByStatus(credential.status), credential.id);
    // Add email index
    pipeline.set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].credentialByEmail(credential.holderEmail), credential.id);
    await pipeline.exec();
}
async function updatePartnerCredential(id, updates) {
    const credential = await getPartnerCredential(id);
    if (!credential) throw new Error('Credential not found');
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerCredential(id), toRedisHash(updateData));
    // Update status index if changed
    if (updates.status && updates.status !== credential.status) {
        pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].credentialsByStatus(credential.status), id);
        pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].credentialsByStatus(updates.status), id);
    }
    await pipeline.exec();
}
async function revokePartnerCredential(id, revokedBy, reason) {
    await updatePartnerCredential(id, {
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        revokedBy,
        revokedReason: reason
    });
}
async function revokeAllPartnerCredentials(partnerId, revokedBy, reason) {
    const credentials = await getPartnerCredentials(partnerId);
    const activeCredentials = credentials.filter((c)=>[
            'active',
            'claimed',
            'issued'
        ].includes(c.status));
    for (const credential of activeCredentials){
        await revokePartnerCredential(credential.id, revokedBy, reason);
    }
}
async function getTrainingCourse(id) {
    const course = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingCourse(id));
    if (!course || !course.id) return null;
    // Parse JSON fields
    if (typeof course.title === 'string') course.title = JSON.parse(course.title);
    if (typeof course.description === 'string') course.description = JSON.parse(course.description);
    if (typeof course.modules === 'string') course.modules = JSON.parse(course.modules);
    if (typeof course.requiredForTiers === 'string' && course.requiredForTiers) {
        course.requiredForTiers = JSON.parse(course.requiredForTiers);
    }
    // Parse booleans
    if (typeof course.isPublished === 'string') course.isPublished = course.isPublished === 'true';
    if (typeof course.isRequired === 'string') course.isRequired = course.isRequired === 'true';
    if (typeof course.certificateEnabled === 'string') course.certificateEnabled = course.certificateEnabled === 'true';
    // Parse numbers
    if (typeof course.duration === 'string') course.duration = parseInt(course.duration, 10);
    if (typeof course.passingScore === 'string') course.passingScore = parseInt(course.passingScore, 10);
    if (typeof course.order === 'string') course.order = parseInt(course.order, 10);
    return course;
}
async function getAllTrainingCourses() {
    const courseIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allTrainingCourses(), 0, -1, {
        rev: true
    });
    if (!courseIds.length) return [];
    const courses = await Promise.all(courseIds.map((id)=>getTrainingCourse(id)));
    return courses.filter((c)=>c !== null).sort((a, b)=>a.order - b.order);
}
async function getPublishedTrainingCourses() {
    const courseIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].publishedTrainingCourses());
    if (!courseIds.length) return [];
    const courses = await Promise.all(courseIds.map((id)=>getTrainingCourse(id)));
    return courses.filter((c)=>c !== null).sort((a, b)=>a.order - b.order);
}
async function getTrainingCoursesByCategory(category) {
    const courseIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingCoursesByCategory(category));
    if (!courseIds.length) return [];
    const courses = await Promise.all(courseIds.map((id)=>getTrainingCourse(id)));
    return courses.filter((c)=>c !== null).sort((a, b)=>a.order - b.order);
}
async function createTrainingCourse(course) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const courseData = {
        ...course,
        title: JSON.stringify(course.title),
        description: JSON.stringify(course.description),
        modules: JSON.stringify(course.modules),
        requiredForTiers: course.requiredForTiers ? JSON.stringify(course.requiredForTiers) : ''
    };
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingCourse(course.id), toRedisHash(courseData));
    // Add to all courses sorted by order
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allTrainingCourses(), {
        score: course.order,
        member: course.id
    });
    // Add to category index
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingCoursesByCategory(course.category), course.id);
    // Add to published index if published
    if (course.isPublished) {
        pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].publishedTrainingCourses(), course.id);
    }
    await pipeline.exec();
}
async function updateTrainingCourse(id, updates) {
    const course = await getTrainingCourse(id);
    if (!course) throw new Error('Course not found');
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
    };
    if (updates.title) updateData.title = JSON.stringify(updates.title);
    if (updates.description) updateData.description = JSON.stringify(updates.description);
    if (updates.modules) updateData.modules = JSON.stringify(updates.modules);
    if (updates.requiredForTiers) updateData.requiredForTiers = JSON.stringify(updates.requiredForTiers);
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingCourse(id), toRedisHash(updateData));
    // Update category index if changed
    if (updates.category && updates.category !== course.category) {
        pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingCoursesByCategory(course.category), id);
        pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingCoursesByCategory(updates.category), id);
    }
    // Update published index if changed
    if (updates.isPublished !== undefined && updates.isPublished !== course.isPublished) {
        if (updates.isPublished) {
            pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].publishedTrainingCourses(), id);
        } else {
            pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].publishedTrainingCourses(), id);
        }
    }
    // Update order in sorted set if changed
    if (updates.order !== undefined && updates.order !== course.order) {
        pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allTrainingCourses(), {
            score: updates.order,
            member: id
        });
    }
    await pipeline.exec();
}
async function deleteTrainingCourse(id) {
    const course = await getTrainingCourse(id);
    if (!course) throw new Error('Course not found');
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    pipeline.del(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingCourse(id));
    pipeline.zrem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allTrainingCourses(), id);
    pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].trainingCoursesByCategory(course.category), id);
    if (course.isPublished) {
        pipeline.srem(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].publishedTrainingCourses(), id);
    }
    await pipeline.exec();
}
async function publishTrainingCourse(id) {
    await updateTrainingCourse(id, {
        isPublished: true
    });
}
async function unpublishTrainingCourse(id) {
    await updateTrainingCourse(id, {
        isPublished: false
    });
}
async function createAuditLog(log) {
    const pipeline = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].pipeline();
    const logData = {
        ...log,
        changes: log.changes ? JSON.stringify(log.changes) : '',
        metadata: log.metadata ? JSON.stringify(log.metadata) : ''
    };
    pipeline.hset(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].auditLog(log.id), toRedisHash(logData));
    // Add to all logs sorted by timestamp
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allAuditLogs(), {
        score: new Date(log.timestamp).getTime(),
        member: log.id
    });
    // Add to entity index
    pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].auditLogsByEntity(log.entityType, log.entityId), {
        score: new Date(log.timestamp).getTime(),
        member: log.id
    });
    // Add to action index
    pipeline.sadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].auditLogsByAction(log.action), log.id);
    // Add to actor index
    if (log.actorId) {
        pipeline.zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].auditLogsByActor(log.actorId), {
            score: new Date(log.timestamp).getTime(),
            member: log.id
        });
    }
    await pipeline.exec();
}
async function getAuditLog(id) {
    const log = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].hgetall(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].auditLog(id));
    if (!log || !log.id) return null;
    // Parse JSON fields
    if (typeof log.changes === 'string' && log.changes) log.changes = JSON.parse(log.changes);
    if (typeof log.metadata === 'string' && log.metadata) log.metadata = JSON.parse(log.metadata);
    return log;
}
async function getAllAuditLogs(limit = 100, offset = 0) {
    const logIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].allAuditLogs(), offset, offset + limit - 1, {
        rev: true
    });
    if (!logIds.length) return [];
    const logs = await Promise.all(logIds.map((id)=>getAuditLog(id)));
    return logs.filter((l)=>l !== null);
}
async function getAuditLogsByEntity(entityType, entityId, limit = 50) {
    const logIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].auditLogsByEntity(entityType, entityId), 0, limit - 1, {
        rev: true
    });
    if (!logIds.length) return [];
    const logs = await Promise.all(logIds.map((id)=>getAuditLog(id)));
    return logs.filter((l)=>l !== null);
}
async function getAuditLogsByAction(action, limit = 50) {
    const logIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].smembers(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].auditLogsByAction(action));
    if (!logIds.length) return [];
    const logs = await Promise.all(logIds.map((id)=>getAuditLog(id)));
    return logs.filter((l)=>l !== null).sort((a, b)=>new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
}
async function getAuditLogsByActor(actorId, limit = 50) {
    const logIds = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].auditLogsByActor(actorId), 0, limit - 1, {
        rev: true
    });
    if (!logIds.length) return [];
    const logs = await Promise.all(logIds.map((id)=>getAuditLog(id)));
    return logs.filter((l)=>l !== null);
}
async function addAuditLog(action, entityType, entityId, actor, options) {
    const log = {
        id: generateId(),
        actorId: actor.id,
        actorName: actor.name,
        actorType: actor.type,
        action,
        entityType,
        entityId,
        entityName: options?.entityName,
        changes: options?.changes,
        metadata: options?.metadata,
        timestamp: new Date().toISOString(),
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent
    };
    await createAuditLog(log);
}
}),
"[project]/apps/web/partners-portal/src/lib/redis/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/keys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/operations.ts [app-route] (ecmascript)");
;
;
;
}),
"[project]/apps/web/partners-portal/src/lib/auth/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCurrentSession",
    ()=>getCurrentSession,
    "hashPassword",
    ()=>hashPassword,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "requireSession",
    ()=>requireSession,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/operations.ts [app-route] (ecmascript)");
;
;
;
const SESSION_COOKIE = 'partner_session';
async function login(email, password) {
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserByEmail"])(email);
    if (!user) return null;
    const isValid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, user.passwordHash);
    if (!isValid) return null;
    const partner = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPartner"])(user.partnerId);
    if (!partner) return null;
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSession"])(user.id, user.partnerId);
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    cookieStore.set(SESSION_COOKIE, session.id, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/'
    });
    return {
        session,
        user,
        partner
    };
}
async function logout() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (sessionId) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteSession"])(sessionId);
    }
    cookieStore.delete(SESSION_COOKIE);
}
async function getCurrentSession() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return null;
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])(sessionId);
    if (!session) return null;
    const [user, partner] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUser"])(session.userId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPartner"])(session.partnerId)
    ]);
    if (!user || !partner) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteSession"])(sessionId);
        return null;
    }
    return {
        session,
        user,
        partner
    };
}
async function requireSession() {
    const sessionData = await getCurrentSession();
    if (!sessionData) {
        throw new Error('Unauthorized');
    }
    return sessionData;
}
async function hashPassword(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, 12);
}
async function verifyPassword(password, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
}),
"[project]/apps/web/partners-portal/src/lib/permissions/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Role-Based Access Control (RBAC) System
__turbopack_context__.s([
    "canAccessRoute",
    ()=>canAccessRoute,
    "getRolePermissions",
    ()=>getRolePermissions,
    "getRoutePermission",
    ()=>getRoutePermission,
    "hasPermission",
    ()=>hasPermission,
    "rolePermissions",
    ()=>rolePermissions
]);
const rolePermissions = {
    admin: [
        'deals:view',
        'deals:create',
        'training:view',
        'legal:view',
        'commissions:view',
        'team:view'
    ],
    sales: [
        'deals:view',
        'deals:create',
        'training:view'
    ],
    viewer: [
        'deals:view',
        'training:view'
    ],
    sovra_admin: [
        'sovra:manage'
    ]
};
// Route to permission mapping
const routePermissions = {
    '/partners/portal/deals': 'deals:view',
    '/partners/portal/training': 'training:view',
    '/partners/portal/training-center': 'training:view',
    '/partners/portal/certifications': 'training:view',
    '/partners/portal/legal': 'legal:view',
    '/partners/portal/commissions': 'commissions:view',
    '/partners/portal/team': 'team:view'
};
function hasPermission(role, permission) {
    const permissions = rolePermissions[role];
    return permissions?.includes(permission) ?? false;
}
function getRolePermissions(role) {
    return rolePermissions[role] ?? [];
}
function canAccessRoute(role, route) {
    // Remove locale prefix (e.g., /en, /es, /pt)
    const normalizedRoute = route.replace(/^\/[a-z]{2}/, '');
    // Dashboard is accessible to everyone
    if (normalizedRoute === '/partners/portal' || normalizedRoute === '/partners/portal/') {
        return true;
    }
    // Find matching route permission
    for (const [routePattern, permission] of Object.entries(routePermissions)){
        if (normalizedRoute.startsWith(routePattern)) {
            return hasPermission(role, permission);
        }
    }
    // Default: allow access to routes not explicitly protected
    return true;
}
function getRoutePermission(route) {
    const normalizedRoute = route.replace(/^\/[a-z]{2}/, '');
    for (const [routePattern, permission] of Object.entries(routePermissions)){
        if (normalizedRoute.startsWith(routePattern)) {
            return permission;
        }
    }
    return null;
}
}),
"[project]/apps/web/partners-portal/src/lib/auth/withRoleGuard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkPermission",
    ()=>checkPermission,
    "withRoleGuard",
    ()=>withRoleGuard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/auth/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$permissions$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/permissions/index.ts [app-route] (ecmascript)");
;
;
;
function withRoleGuard(permission, handler) {
    return async ()=>{
        try {
            const sessionData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireSession"])();
            const userRole = sessionData.user.role;
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$permissions$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasPermission"])(userRole, permission)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Forbidden: Insufficient permissions'
                }, {
                    status: 403
                });
            }
            return await handler(sessionData);
        } catch (error) {
            if (error instanceof Error && error.message === 'Unauthorized') {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Unauthorized'
                }, {
                    status: 401
                });
            }
            console.error('API error:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Internal server error'
            }, {
                status: 500
            });
        }
    };
}
async function checkPermission(permission) {
    try {
        const sessionData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireSession"])();
        const userRole = sessionData.user.role;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$permissions$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasPermission"])(userRole, permission)) {
            return {
                authorized: false,
                response: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Forbidden: Insufficient permissions'
                }, {
                    status: 403
                })
            };
        }
        return {
            authorized: true,
            sessionData
        };
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return {
                authorized: false,
                response: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Unauthorized'
                }, {
                    status: 401
                })
            };
        }
        return {
            authorized: false,
            response: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Internal server error'
            }, {
                status: 500
            })
        };
    }
}
}),
"[project]/apps/web/partners-portal/src/lib/auth/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/auth/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$auth$2f$withRoleGuard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/auth/withRoleGuard.ts [app-route] (ecmascript)");
;
;
}),
"[project]/apps/web/partners-portal/src/lib/rating/events.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EVENT_POINTS",
    ()=>EVENT_POINTS,
    "getPartnerEvents",
    ()=>getPartnerEvents,
    "getPartnerEventsInRange",
    ()=>getPartnerEventsInRange,
    "getPartnerLastLogin",
    ()=>getPartnerLastLogin,
    "logRatingEvent",
    ()=>logRatingEvent,
    "updatePartnerLastLogin",
    ()=>updatePartnerLastLogin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/keys.ts [app-route] (ecmascript)");
;
;
const EVENT_POINTS = {
    COPILOT_SESSION_COMPLETED: 2,
    TRAINING_MODULE_COMPLETED: 3,
    CERTIFICATION_EARNED: 10,
    DEAL_CLOSED_WON: 15,
    MEDDIC_SCORE_IMPROVED: 1,
    DEAL_CLOSED_LOST_POOR_QUALIFICATION: -10,
    CERTIFICATION_EXPIRED: -5,
    LEGAL_EXPIRED: -8,
    DEAL_STALE_30_DAYS: -3,
    LOGIN_INACTIVE_30_DAYS: -2
};
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
async function logRatingEvent(partnerId, userId, eventType, metadata) {
    const event = {
        id: generateId(),
        partnerId,
        userId,
        eventType,
        points: EVENT_POINTS[eventType],
        metadata,
        createdAt: new Date().toISOString()
    };
    // Store event in a sorted set by timestamp
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].ratingEvents(partnerId), {
        score: new Date(event.createdAt).getTime(),
        member: JSON.stringify(event)
    });
    return event;
}
async function getPartnerEvents(partnerId, limit = 100) {
    const events = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].ratingEvents(partnerId), 0, limit - 1, {
        rev: true
    });
    return events.map((e)=>typeof e === 'string' ? JSON.parse(e) : e);
}
async function getPartnerEventsInRange(partnerId, startDate, endDate) {
    const events = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].ratingEvents(partnerId), startDate.getTime(), endDate.getTime(), {
        byScore: true
    });
    return events.map((e)=>typeof e === 'string' ? JSON.parse(e) : e);
}
async function updatePartnerLastLogin(partnerId) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerLastLogin(partnerId), new Date().toISOString());
}
async function getPartnerLastLogin(partnerId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerLastLogin(partnerId));
}
}),
"[project]/apps/web/partners-portal/src/lib/rating/calculator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FACTOR_WEIGHTS",
    ()=>FACTOR_WEIGHTS,
    "TIER_THRESHOLDS",
    ()=>TIER_THRESHOLDS,
    "calculatePartnerRating",
    ()=>calculatePartnerRating,
    "getCachedRating",
    ()=>getCachedRating,
    "getTierFromScore",
    ()=>getTierFromScore,
    "recalculateAndUpdatePartner",
    ()=>recalculateAndUpdatePartner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/keys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/operations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rating/events.ts [app-route] (ecmascript)");
;
;
;
;
const FACTOR_WEIGHTS = {
    dealQuality: 0.30,
    engagement: 0.25,
    certification: 0.20,
    compliance: 0.15,
    revenue: 0.10
};
const TIER_THRESHOLDS = [
    {
        tier: 'platinum',
        minScore: 90
    },
    {
        tier: 'gold',
        minScore: 70
    },
    {
        tier: 'silver',
        minScore: 50
    },
    {
        tier: 'bronze',
        minScore: 0
    }
];
function getTierFromScore(score) {
    for (const threshold of TIER_THRESHOLDS){
        if (score >= threshold.minScore) {
            return threshold.tier;
        }
    }
    return 'bronze';
}
/**
 * Calculate deal quality factor (0-100)
 * Based on approval rate and win rate for government deals
 */ function calculateDealQualityFactor(deals) {
    if (deals.length === 0) return 50; // Neutral score for new partners
    // Calculate approval rate (how many deals get approved)
    const approvedOrClosedDeals = deals.filter((d)=>[
            'approved',
            'closed_won',
            'closed_lost'
        ].includes(d.status));
    const approvalRate = deals.length > 0 ? approvedOrClosedDeals.length / deals.length : 0;
    // Calculate win rate for closed deals
    const closedDeals = deals.filter((d)=>[
            'closed_won',
            'closed_lost'
        ].includes(d.status));
    const wonDeals = closedDeals.filter((d)=>d.status === 'closed_won');
    const winRate = closedDeals.length > 0 ? wonDeals.length / closedDeals.length : 0;
    // Calculate partner lead generation rate
    const partnerLeads = deals.filter((d)=>d.partnerGeneratedLead).length;
    const leadGenerationRate = deals.length > 0 ? partnerLeads / deals.length : 0;
    // Weighted combination: 40% approval rate, 40% win rate, 20% lead generation
    return approvalRate * 40 + winRate * 40 + leadGenerationRate * 20;
}
/**
 * Calculate engagement factor (0-100)
 * Based on copilot usage, training, login frequency
 */ async function calculateEngagementFactor(partnerId, _userId) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const events = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPartnerEventsInRange"])(partnerId, thirtyDaysAgo, now);
    // Count engagement events
    const copilotSessions = events.filter((e)=>e.eventType === 'COPILOT_SESSION_COMPLETED').length;
    const trainingModules = events.filter((e)=>e.eventType === 'TRAINING_MODULE_COMPLETED').length;
    // Check for login activity (negative event would indicate inactivity)
    const inactiveEvents = events.filter((e)=>e.eventType === 'LOGIN_INACTIVE_30_DAYS').length;
    // Score based on activity
    let score = 50; // Base score
    // Copilot usage: +5 per session, max +25
    score += Math.min(copilotSessions * 5, 25);
    // Training: +10 per module, max +20
    score += Math.min(trainingModules * 10, 20);
    // Penalize inactivity
    score -= inactiveEvents * 10;
    return Math.max(0, Math.min(100, score));
}
/**
 * Calculate certification factor (0-100)
 * Based on active certifications
 */ function calculateCertificationFactor(certifications) {
    const now = new Date();
    const activeCerts = certifications.filter((c)=>c.status === 'active' && new Date(c.expiresAt) > now);
    if (activeCerts.length === 0) return 20; // Minimum score
    if (activeCerts.length === 1) return 60;
    if (activeCerts.length === 2) return 80;
    return 100; // 3+ certifications
}
/**
 * Calculate compliance factor (0-100)
 * Based on signed legal documents
 */ async function calculateComplianceFactor(partnerId, userId) {
    const [docs, signatures] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllLegalDocuments"])(),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserSignatures"])(userId)
    ]);
    const requiredDocs = docs.filter((d)=>d.requiredForDeals);
    if (requiredDocs.length === 0) return 100;
    const signedDocIds = new Set(signatures.map((s)=>s.documentId));
    const signedCount = requiredDocs.filter((d)=>signedDocIds.has(d.id)).length;
    return signedCount / requiredDocs.length * 100;
}
/**
 * Calculate revenue factor (0-100)
 * Based on closed deals (count-based since deal values are in quotes now)
 */ function calculateRevenueFactor(deals) {
    const wonDeals = deals.filter((d)=>d.status === 'closed_won');
    if (wonDeals.length === 0) return 30; // Minimum score for new partners
    // Score based on number of won deals
    let score = Math.min(wonDeals.length * 15, 70); // Max 70 from deal count
    // Bonus for larger populations (bigger government deals)
    const avgPopulation = wonDeals.reduce((sum, d)=>sum + d.population, 0) / wonDeals.length;
    // Add bonus based on average population served
    if (avgPopulation >= 1000000) score += 30;
    else if (avgPopulation >= 500000) score += 20;
    else if (avgPopulation >= 100000) score += 10;
    return Math.min(100, score);
}
async function calculatePartnerRating(partnerId, userId) {
    const [deals, certifications] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPartnerDeals"])(partnerId),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserCertifications"])(userId)
    ]);
    const [engagementFactor, complianceFactor] = await Promise.all([
        calculateEngagementFactor(partnerId, userId),
        calculateComplianceFactor(partnerId, userId)
    ]);
    const factors = {
        dealQuality: calculateDealQualityFactor(deals),
        engagement: engagementFactor,
        certification: calculateCertificationFactor(certifications),
        compliance: complianceFactor,
        revenue: calculateRevenueFactor(deals)
    };
    // Calculate weighted total
    const totalScore = Math.round(factors.dealQuality * FACTOR_WEIGHTS.dealQuality + factors.engagement * FACTOR_WEIGHTS.engagement + factors.certification * FACTOR_WEIGHTS.certification + factors.compliance * FACTOR_WEIGHTS.compliance + factors.revenue * FACTOR_WEIGHTS.revenue);
    const calculation = {
        partnerId,
        totalScore,
        tier: getTierFromScore(totalScore),
        factors,
        calculatedAt: new Date().toISOString()
    };
    return calculation;
}
async function recalculateAndUpdatePartner(partnerId, userId) {
    const calculation = await calculatePartnerRating(partnerId, userId);
    // Store calculation
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].ratingCalculation(partnerId), JSON.stringify(calculation));
    // Update partner tier if changed
    const partner = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPartner"])(partnerId);
    if (partner && partner.tier !== calculation.tier) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updatePartner"])(partnerId, {
            tier: calculation.tier,
            rating: calculation.totalScore
        });
    } else if (partner) {
        // Just update the rating score
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updatePartner"])(partnerId, {
            rating: calculation.totalScore
        });
    }
    return calculation;
}
async function getCachedRating(partnerId) {
    const data = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].ratingCalculation(partnerId));
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : data;
}
}),
"[project]/apps/web/partners-portal/src/lib/rating/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rating/events.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rating/calculator.ts [app-route] (ecmascript)");
;
;
}),
"[project]/apps/web/partners-portal/src/lib/rewards/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ============ Rewards System Types ============
/**
 * Actions that can earn reward points
 */ __turbopack_context__.s([
    "REWARD_MILESTONES",
    ()=>REWARD_MILESTONES,
    "REWARD_POINTS",
    ()=>REWARD_POINTS
]);
const REWARD_POINTS = {
    DEAL_CLOSED: 100,
    TRAINING_COMPLETED: 50,
    COPILOT_SESSION: 10,
    REFERRAL: 200,
    DOCUMENT_SIGNED: 25,
    POSITIVE_REVIEW: 75,
    LOGIN_STREAK_7: 30,
    FIRST_DEAL_MONTH: 50
};
const REWARD_MILESTONES = [
    1000,
    5000,
    10000
];
}),
"[project]/apps/web/partners-portal/src/lib/rewards/calculator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculatePointsForAction",
    ()=>calculatePointsForAction,
    "checkMilestoneReached",
    ()=>checkMilestoneReached,
    "getNextMilestone",
    ()=>getNextMilestone
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rewards/types.ts [app-route] (ecmascript)");
;
function calculatePointsForAction(action) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REWARD_POINTS"][action];
}
function checkMilestoneReached(oldPoints, newPoints) {
    // Find milestones that were crossed
    const crossedMilestones = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REWARD_MILESTONES"].filter((milestone)=>oldPoints < milestone && newPoints >= milestone);
    // Return the highest milestone crossed, or null if none
    return crossedMilestones.length > 0 ? crossedMilestones[crossedMilestones.length - 1] : null;
}
function getNextMilestone(currentPoints) {
    const nextMilestone = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["REWARD_MILESTONES"].find((m)=>m > currentPoints);
    if (!nextMilestone) {
        return {
            milestone: null,
            pointsNeeded: 0
        };
    }
    return {
        milestone: nextMilestone,
        pointsNeeded: nextMilestone - currentPoints
    };
}
}),
"[project]/apps/web/partners-portal/src/lib/rewards/achievements.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACHIEVEMENTS",
    ()=>ACHIEVEMENTS,
    "checkAchievementUnlocked",
    ()=>checkAchievementUnlocked,
    "getUnlockedAchievements",
    ()=>getUnlockedAchievements
]);
const ACHIEVEMENTS = [
    // Deals category
    {
        id: 'first-blood',
        name: 'First Blood',
        description: 'Close your first deal',
        category: 'deals',
        points: 50,
        iconName: 'Trophy',
        condition: (stats)=>stats.dealsWon >= 1
    },
    {
        id: 'hat-trick',
        name: 'Hat Trick',
        description: 'Close 3 deals in a month',
        category: 'deals',
        points: 100,
        iconName: 'Target',
        condition: (stats)=>stats.dealsWon >= 3
    },
    {
        id: 'deal-master',
        name: 'Deal Master',
        description: 'Close 10 deals',
        category: 'deals',
        points: 200,
        iconName: 'Award',
        condition: (stats)=>stats.dealsWon >= 10
    },
    // Training category
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Complete 5 training modules',
        category: 'training',
        points: 100,
        iconName: 'GraduationCap',
        condition: (stats)=>stats.trainingsCompleted >= 5
    },
    {
        id: 'expert',
        name: 'Expert',
        description: 'Complete 10 training modules',
        category: 'training',
        points: 200,
        iconName: 'BookOpen',
        condition: (stats)=>stats.trainingsCompleted >= 10
    },
    // Engagement category
    {
        id: 'ai-enthusiast',
        name: 'AI Enthusiast',
        description: 'Use Copilot 20 times',
        category: 'engagement',
        points: 100,
        iconName: 'Sparkles',
        condition: (stats)=>stats.copilotSessions >= 20
    },
    {
        id: 'marathon',
        name: 'Marathon Runner',
        description: 'Login 30 days in a row',
        category: 'engagement',
        points: 150,
        iconName: 'Flame',
        condition: (stats)=>stats.loginStreak >= 30
    },
    {
        id: 'networker',
        name: 'Networker',
        description: 'Refer 3 new partners',
        category: 'engagement',
        points: 300,
        iconName: 'Users',
        condition: (stats)=>stats.referrals >= 3
    },
    // Milestones category
    {
        id: 'rising-star',
        name: 'Rising Star',
        description: 'Earn 1,000 reward points',
        category: 'milestones',
        points: 100,
        iconName: 'Star',
        condition: (stats)=>stats.totalPoints >= 1000
    },
    {
        id: 'high-achiever',
        name: 'High Achiever',
        description: 'Earn 5,000 reward points',
        category: 'milestones',
        points: 250,
        iconName: 'Zap',
        condition: (stats)=>stats.totalPoints >= 5000
    },
    {
        id: 'elite',
        name: 'Elite Partner',
        description: 'Earn 10,000 reward points',
        category: 'milestones',
        points: 500,
        iconName: 'Crown',
        condition: (stats)=>stats.totalPoints >= 10000
    }
];
function checkAchievementUnlocked(achievement, stats) {
    return achievement.condition(stats);
}
function getUnlockedAchievements(stats, currentlyUnlocked) {
    return ACHIEVEMENTS.filter((achievement)=>!currentlyUnlocked.includes(achievement.id) && checkAchievementUnlocked(achievement, stats));
}
}),
"[project]/apps/web/partners-portal/src/lib/rewards/engine.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "awardPoints",
    ()=>awardPoints,
    "getPartnerStats",
    ()=>getPartnerStats,
    "getRewardStatus",
    ()=>getRewardStatus,
    "updatePartnerStats",
    ()=>updatePartnerStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/keys.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rewards/calculator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$achievements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rewards/achievements.ts [app-route] (ecmascript)");
;
;
;
;
async function awardPoints(partnerId, action) {
    // Calculate points for the action
    const points = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculatePointsForAction"])(action);
    // Get current points and achievements
    const currentPoints = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].rewardPoints(partnerId)) ?? 0;
    const currentAchievements = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].achievements(partnerId)) ?? [];
    // Calculate new total
    const newTotal = currentPoints + points;
    // Check if milestone was reached
    const milestoneReached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkMilestoneReached"])(currentPoints, newTotal);
    // Get partner stats to check for achievement unlocks
    const partnerStats = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerStats(partnerId)) ?? {
        dealsWon: 0,
        trainingsCompleted: 0,
        copilotSessions: 0,
        referrals: 0,
        loginStreak: 0,
        totalPoints: newTotal
    };
    // Update total points in stats
    partnerStats.totalPoints = newTotal;
    // Check for newly unlocked achievements
    const newlyUnlocked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$achievements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnlockedAchievements"])(partnerStats, currentAchievements);
    const newAchievementIds = newlyUnlocked.map((a)=>a.id);
    // Calculate bonus points from achievements
    const achievementBonusPoints = newlyUnlocked.reduce((sum, a)=>sum + a.points, 0);
    const finalTotal = newTotal + achievementBonusPoints;
    // Update Redis
    await Promise.all([
        // Update points
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].rewardPoints(partnerId), finalTotal),
        // Update achievements
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].achievements(partnerId), [
            ...currentAchievements,
            ...newAchievementIds
        ]),
        // Update leaderboard (sorted set by points)
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zadd(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].rewardsLeaderboard(), {
            score: finalTotal,
            member: partnerId
        }),
        // Store reward event
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].set(`${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].rewardEvents(partnerId)}:${Date.now()}`, {
            action,
            points,
            timestamp: new Date().toISOString(),
            milestoneReached,
            achievementsUnlocked: newAchievementIds
        })
    ]);
    return {
        partnerId,
        action,
        points,
        newTotal: finalTotal,
        milestoneReached: milestoneReached ?? undefined,
        achievementsUnlocked: newAchievementIds,
        timestamp: new Date().toISOString()
    };
}
async function getRewardStatus(partnerId) {
    // Get data from Redis in parallel
    const [totalPoints, achievements, leaderboardRank] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].rewardPoints(partnerId)),
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].achievements(partnerId)),
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrevrank(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].rewardsLeaderboard(), partnerId)
    ]);
    const points = totalPoints ?? 0;
    const unlockedAchievements = achievements ?? [];
    // Calculate tier based on points
    const tier = calculateTier(points);
    // Calculate next milestone
    const { milestone: nextMilestone, pointsNeeded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNextMilestone"])(points);
    // Leaderboard position (zrevrank returns 0-indexed position, we want 1-indexed)
    const leaderboardPosition = leaderboardRank !== null ? leaderboardRank + 1 : null;
    return {
        partnerId,
        totalPoints: points,
        tier,
        achievements: unlockedAchievements,
        nextMilestone,
        pointsToNextMilestone: pointsNeeded,
        leaderboardPosition
    };
}
/**
 * Calculate partner tier based on total points
 */ function calculateTier(points) {
    if (points >= 10000) return 'platinum';
    if (points >= 5000) return 'gold';
    if (points >= 1000) return 'silver';
    return 'bronze';
}
async function updatePartnerStats(partnerId, updates) {
    const currentStats = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerStats(partnerId)) ?? {
        dealsWon: 0,
        trainingsCompleted: 0,
        copilotSessions: 0,
        referrals: 0,
        loginStreak: 0,
        totalPoints: 0
    };
    const updatedStats = {
        ...currentStats,
        ...updates
    };
    await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerStats(partnerId), updatedStats);
}
async function getPartnerStats(partnerId) {
    const stats = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partnerStats(partnerId));
    return stats ?? {
        dealsWon: 0,
        trainingsCompleted: 0,
        copilotSessions: 0,
        referrals: 0,
        loginStreak: 0,
        totalPoints: 0
    };
}
}),
"[project]/apps/web/partners-portal/src/lib/rewards/leaderboard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLeaderboard",
    ()=>getLeaderboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/keys.ts [app-route] (ecmascript)");
;
;
async function getLeaderboard(limit = 10) {
    // Get top partners from sorted set (highest to lowest)
    const results = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].zrange(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].rewardsLeaderboard(), 0, limit - 1, {
        rev: true,
        withScores: true
    });
    if (!results || results.length === 0) {
        return [];
    }
    // Parse results: withScores returns a flat array [member1, score1, member2, score2, ...]
    const entries = [];
    for(let i = 0; i < results.length; i += 2){
        entries.push({
            partnerId: results[i],
            points: results[i + 1]
        });
    }
    // Get partner data in parallel (with error handling)
    const partnerData = await Promise.all(entries.map(async (entry)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redis"].get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$keys$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keys"].partner(entry.partnerId));
            return data;
        } catch (error) {
            // If partner data doesn't exist or has wrong type, return null
            console.warn(`[Leaderboard] Failed to get partner data for ${entry.partnerId}:`, error);
            return null;
        }
    }));
    // Build leaderboard entries
    return entries.map((entry, index)=>({
            rank: index + 1,
            partnerId: entry.partnerId,
            name: partnerData[index]?.name ?? entry.partnerId,
            points: entry.points
        }));
}
}),
"[project]/apps/web/partners-portal/src/lib/rewards/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * Rewards System - Main Entry Point
 *
 * This barrel export provides a clean interface to the rewards system.
 * Use this as the main import point for all reward-related functionality.
 *
 * Example:
 * ```
 * import { awardPoints, getRewardStatus, getLeaderboard } from '@/lib/rewards';
 * ```
 */ // Core Engine Functions
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rewards/engine.ts [app-route] (ecmascript)");
// Calculator Functions
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rewards/calculator.ts [app-route] (ecmascript)");
// Achievement Functions
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$achievements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rewards/achievements.ts [app-route] (ecmascript)");
// Leaderboard Functions
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$leaderboard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rewards/leaderboard.ts [app-route] (ecmascript)");
;
;
;
;
}),
"[project]/apps/web/partners-portal/src/app/api/partners/training/quiz/submit/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$3$2e$6$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$auth$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/auth/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/auth/session.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/operations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rating/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rating/events.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rating/calculator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rewards/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/rewards/engine.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const submitSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$3$2e$6$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    moduleId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$3$2e$6$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    answers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$3$2e$6$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zod$40$4$2e$3$2e$6$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number())
});
async function POST(request) {
    try {
        const { user, partner } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireSession"])();
        const body = await request.json();
        const validation = submitSchema.safeParse(body);
        if (!validation.success) {
            const issues = validation.error.issues;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: issues[0]?.message || 'Validation failed'
            }, {
                status: 400
            });
        }
        const { moduleId, answers } = validation.data;
        const module = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTrainingModule"])(moduleId);
        if (!module) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Module not found'
            }, {
                status: 404
            });
        }
        if (answers.length !== module.quiz.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid number of answers'
            }, {
                status: 400
            });
        }
        // Calculate score
        let correctCount = 0;
        for(let i = 0; i < module.quiz.length; i++){
            if (answers[i] === module.quiz[i].correctAnswer) {
                correctCount++;
            }
        }
        const score = Math.round(correctCount / module.quiz.length * 100);
        const passed = score >= module.passingScore;
        const progress = {
            moduleId,
            userId: user.id,
            completed: passed,
            quizScore: score,
            completedAt: passed ? new Date().toISOString() : null,
            startedAt: new Date().toISOString()
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateTrainingProgress"])(user.id, progress);
        // Award points for training completion
        if (passed) {
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rewards$2f$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["awardPoints"])(partner.id, 'TRAINING_COMPLETED');
                console.log(`[Rewards] Awarded points for training completion: ${moduleId}`);
            } catch (error) {
                console.error('[Rewards] Failed to award points for training:', error);
            }
        }
        // Log training module completion event if passed
        if (passed) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logRatingEvent"])(partner.id, user.id, 'TRAINING_MODULE_COMPLETED', {
                moduleId,
                score
            });
        }
        // Check if user completed all modules and grant certification
        if (passed) {
            const allModules = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllTrainingModules"])();
            const userProgress = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserTrainingProgress"])(user.id);
            userProgress[moduleId] = progress;
            const allCompleted = allModules.every((m)=>userProgress[m.id]?.completed);
            if (allCompleted) {
                const now = new Date();
                const expiresAt = new Date(now);
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                const certification = {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateId"])(),
                    userId: user.id,
                    partnerId: partner.id,
                    type: 'sales_fundamentals',
                    status: 'active',
                    issuedAt: now.toISOString(),
                    expiresAt: expiresAt.toISOString()
                };
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCertification"])(certification);
                // Log certification earned event
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$events$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logRatingEvent"])(partner.id, user.id, 'CERTIFICATION_EARNED', {
                    certificationId: certification.id,
                    type: certification.type
                });
                // Recalculate rating after certification
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recalculateAndUpdatePartner"])(partner.id, user.id);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    passed,
                    score,
                    progress,
                    certification
                });
            }
        }
        // Recalculate rating if module was passed
        if (passed) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$rating$2f$calculator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recalculateAndUpdatePartner"])(partner.id, user.id).catch(console.error);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            passed,
            score,
            progress
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        console.error('Submit quiz error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__07255985._.js.map