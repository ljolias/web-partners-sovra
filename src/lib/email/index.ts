/**
 * Email Module
 *
 * Export all email functionality.
 */

export { sendEmail, isEmailConfigured, verifyEmailConnection } from './client';
export { credentialIssuedEmail, welcomeEmail } from './templates';
export { sendCredentialEmail, sendWelcomeEmail } from './service';
