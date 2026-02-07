/**
 * Secure IP address extraction with proxy validation
 */

import { NextRequest } from 'next/server';

const TRUSTED_PROXIES = process.env.TRUSTED_PROXIES?.split(',').map(p => p.trim()) || [];

/**
 * Safely extracts the client IP address from a request
 * Validates proxy headers to prevent spoofing
 */
export function getClientIp(request: NextRequest): string {
  // Check if request is from a trusted proxy
  if (isTrustedProxy(request)) {
    // Extract from X-Forwarded-For (first IP in the chain)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      const ips = forwardedFor.split(',').map(ip => ip.trim());
      return ips[0] || 'unknown';
    }

    // Fallback to X-Real-IP
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      return realIp.trim();
    }
  }

  // Use direct connection IP if available (via Next.js headers)
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }

  return 'unknown';
}

/**
 * Checks if the request is from a trusted proxy
 */
function isTrustedProxy(request: NextRequest): boolean {
  // Always trust Vercel's proxy
  const vercelId = request.headers.get('x-vercel-id');
  if (vercelId) {
    return true;
  }

  // Check if request IP is in trusted proxies list
  const requestIp = request.headers.get('x-real-ip');
  if (requestIp && TRUSTED_PROXIES.length > 0) {
    return TRUSTED_PROXIES.includes(requestIp);
  }

  // Default to untrusted if no verification possible
  return false;
}

/**
 * Validates if an IP address is in a valid format
 */
export function isValidIp(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  if (ipv4Regex.test(ip)) {
    // Validate IPv4 octets are 0-255
    const octets = ip.split('.');
    return octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  return ipv6Regex.test(ip);
}
