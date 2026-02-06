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
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/apps/web/partners-portal/src/lib/email/notifications.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sendDealApprovedEmail",
    ()=>sendDealApprovedEmail,
    "sendDealMoreInfoEmail",
    ()=>sendDealMoreInfoEmail,
    "sendDealRejectedEmail",
    ()=>sendDealRejectedEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$resend$40$6$2e$9$2e$1$2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/resend@6.9.1/node_modules/resend/dist/index.mjs [app-route] (ecmascript)");
;
// Lazy initialization to avoid errors during build when API key is not set
let resend = null;
function getResendClient() {
    if (!process.env.RESEND_API_KEY) {
        return null;
    }
    if (!resend) {
        resend = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$resend$40$6$2e$9$2e$1$2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Resend"](process.env.RESEND_API_KEY);
    }
    return resend;
}
const FROM_EMAIL = 'Sovra Partners <noreply@sovra.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://partners.sovra.io';
async function sendEmail({ to, subject, html }) {
    const client = getResendClient();
    if (!client) {
        console.log('Email not sent (no API key):', {
            to,
            subject
        });
        return false;
    }
    try {
        await client.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
function baseTemplate(content) {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">SOVRA</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Portal de Partners</p>
          </div>
          <div style="padding: 32px;">
            ${content}
          </div>
          <div style="background-color: #f9fafb; padding: 16px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Este es un mensaje automatico del Portal de Partners de Sovra.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
function ctaButton(text, url) {
    return `
    <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">
      ${text}
    </a>
  `;
}
async function sendDealApprovedEmail(deal, partner, user) {
    const quoteUrl = `${APP_URL}/es/partners/portal/deals/${deal.id}/quote`;
    const html = baseTemplate(`
    <h2 style="color: #111827; margin: 0 0 16px 0;">Tu oportunidad fue aprobada</h2>

    <div style="background-color: #d1fae5; border-left: 4px solid #059669; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <p style="color: #047857; margin: 0; font-weight: 600;">Buenas noticias!</p>
      <p style="color: #047857; margin: 8px 0 0 0;">
        La oportunidad <strong>${deal.clientName}</strong> ha sido aprobada por el equipo de Sovra.
      </p>
    </div>

    <p style="color: #4b5563; margin-bottom: 24px;">
      Ya puedes crear una cotizacion para esta oportunidad. Nuestro configurador te ayudara a generar una propuesta profesional con los productos y servicios que necesita tu cliente.
    </p>

    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0;"><strong>Cliente:</strong> ${deal.clientName}</p>
      <p style="margin: 0 0 8px 0;"><strong>Pais:</strong> ${deal.country}</p>
      <p style="margin: 0;"><strong>Poblacion:</strong> ${deal.population.toLocaleString()} habitantes</p>
    </div>

    <div style="text-align: center;">
      ${ctaButton('Crear Cotizacion', quoteUrl)}
    </div>
  `);
    return sendEmail({
        to: user.email,
        subject: `Tu oportunidad ${deal.clientName} fue aprobada`,
        html
    });
}
async function sendDealRejectedEmail(deal, partner, user, reason) {
    const dealsUrl = `${APP_URL}/es/partners/portal/deals`;
    const html = baseTemplate(`
    <h2 style="color: #111827; margin: 0 0 16px 0;">Actualizacion sobre tu oportunidad</h2>

    <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <p style="color: #991b1b; margin: 0; font-weight: 600;">Oportunidad no aprobada</p>
      <p style="color: #991b1b; margin: 8px 0 0 0;">
        Lamentablemente, la oportunidad <strong>${deal.clientName}</strong> no ha sido aprobada en esta ocasion.
      </p>
    </div>

    <p style="color: #4b5563; margin-bottom: 16px;">
      <strong>Razon:</strong>
    </p>
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; color: #374151;">${reason}</p>
    </div>

    <p style="color: #4b5563; margin-bottom: 24px;">
      Si tienes alguna pregunta o deseas discutir esta decision, no dudes en contactar a tu gerente de canal.
    </p>

    <div style="text-align: center;">
      ${ctaButton('Ver mis oportunidades', dealsUrl)}
    </div>
  `);
    return sendEmail({
        to: user.email,
        subject: `Actualizacion sobre tu oportunidad ${deal.clientName}`,
        html
    });
}
async function sendDealMoreInfoEmail(deal, partner, user, message) {
    const dealUrl = `${APP_URL}/es/partners/portal/deals/${deal.id}`;
    const html = baseTemplate(`
    <h2 style="color: #111827; margin: 0 0 16px 0;">Accion requerida</h2>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <p style="color: #92400e; margin: 0; font-weight: 600;">Se necesita mas informacion</p>
      <p style="color: #92400e; margin: 8px 0 0 0;">
        El equipo de Sovra necesita informacion adicional sobre la oportunidad <strong>${deal.clientName}</strong>.
      </p>
    </div>

    <p style="color: #4b5563; margin-bottom: 16px;">
      <strong>Mensaje del equipo Sovra:</strong>
    </p>
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; color: #374151;">${message}</p>
    </div>

    <p style="color: #4b5563; margin-bottom: 24px;">
      Por favor, actualiza la informacion de la oportunidad lo antes posible para que podamos continuar con el proceso de aprobacion.
    </p>

    <div style="text-align: center;">
      ${ctaButton('Completar informacion', dealUrl)}
    </div>
  `);
    return sendEmail({
        to: user.email,
        subject: `Accion requerida: ${deal.clientName}`,
        html
    });
}
}),
"[project]/apps/web/partners-portal/src/app/api/sovra/deals/[dealId]/approve/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.6_@babel+core@7.29.0_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/redis/operations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$email$2f$notifications$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/partners-portal/src/lib/email/notifications.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(request, { params }) {
    try {
        const { dealId } = await params;
        // Verify Sovra admin session
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionId = cookieStore.get('partner_session')?.value;
        if (!sessionId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])(sessionId);
        if (!session) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUser"])(session.userId);
        if (!user || user.role !== 'sovra_admin') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Forbidden'
            }, {
                status: 403
            });
        }
        // Get deal
        const deal = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDeal"])(dealId);
        if (!deal) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Deal not found'
            }, {
                status: 404
            });
        }
        // Verify deal is in approvable state
        if (deal.status !== 'pending_approval' && deal.status !== 'more_info') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Deal cannot be approved in current state'
            }, {
                status: 400
            });
        }
        // Update deal status
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateDeal"])(dealId, {
            status: 'approved',
            statusChangedAt: new Date().toISOString(),
            statusChangedBy: user.id
        });
        // Send email notification to partner
        const [partner, createdByUser] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPartner"])(deal.partnerId),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$redis$2f$operations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUser"])(deal.createdBy)
        ]);
        if (partner && createdByUser) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$partners$2d$portal$2f$src$2f$lib$2f$email$2f$notifications$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sendDealApprovedEmail"])(deal, partner, createdByUser);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('Error approving deal:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$babel$2b$core$40$7$2e$29$2e$0_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5cf1a7a8._.js.map