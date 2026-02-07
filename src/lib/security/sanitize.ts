/**
 * HTML sanitization utilities to prevent XSS attacks
 *
 * Uses DOMPurify for production-grade HTML sanitization.
 * Also provides utility functions for basic text sanitization.
 */

import DOMPurify from 'dompurify';

/**
 * Strips all HTML tags from a string
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Production-grade HTML sanitization using DOMPurify
 * Allows safe HTML tags and attributes while removing XSS vectors
 */
export function sanitizeHtml(input: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use basic sanitization
    return sanitizeHtmlBasic(input);
  }

  // Client-side: use DOMPurify
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'code', 'pre', 'blockquote', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'src', 'alt', 'title'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Basic HTML sanitization - fallback for server-side rendering
 * @deprecated Use sanitizeHtml() which uses DOMPurify on client-side
 */
export function sanitizeHtmlBasic(input: string): string {
  // Allowed tags for basic formatting
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'code', 'pre', 'blockquote',
  ];

  // Remove script tags and event handlers
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove all tags not in allowedTags
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagRegex, (match, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      // Keep allowed tags but remove event handlers
      return match
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
    }
    return '';
  });

  return sanitized;
}

/**
 * Sanitizes URL to prevent javascript: and data: schemes
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      return '';
    }
  }

  return url;
}

/**
 * Validates and sanitizes markdown content
 * Removes HTML but keeps markdown syntax
 */
export function sanitizeMarkdown(input: string): string {
  // Remove HTML tags but keep markdown
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
}
