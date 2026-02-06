/**
 * SovraID React Hooks
 * React hooks for polling credential and verification status
 *
 * Note: These hooks are framework-agnostic patterns.
 * Copy and adapt for your specific React setup.
 */
/**
 * Reference implementation for useCredentialStatus hook
 *
 * Copy this to your React project and import the actual React hooks:
 *
 * ```tsx
 * import { useState, useEffect, useCallback, useRef } from "react";
 * import type { UseCredentialStatusOptions, UseCredentialStatusReturn } from "@sovra/sovraid-sdk";
 *
 * export function useCredentialStatus(options: UseCredentialStatusOptions): UseCredentialStatusReturn {
 *   // ... implementation below
 * }
 * ```
 */
export const useCredentialStatusImplementation = `
import { useState, useEffect, useCallback, useRef } from "react";
import type { CredentialStatus } from "@sovra/sovraid-sdk";

interface UseCredentialStatusOptions {
  invitationId: string | null;
  type: "credential" | "verification";
  pollingInterval?: number;
  enabled?: boolean;
  onStatusChange?: (status: CredentialStatus) => void;
  statusEndpoint?: string;
}

export function useCredentialStatus({
  invitationId,
  type,
  pollingInterval = 2000,
  enabled = true,
  onStatusChange,
  statusEndpoint = "/api/webhooks/sovraid",
}: UseCredentialStatusOptions) {
  const [status, setStatus] = useState<CredentialStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);

  // Update ref when callback changes
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const fetchStatus = useCallback(async () => {
    if (!invitationId) return null;

    try {
      const response = await fetch(
        \`\${statusEndpoint}?invitationId=\${invitationId}&type=\${type}\`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch status");
      }

      const data: CredentialStatus = await response.json();
      return data;
    } catch (err) {
      console.error("[useCredentialStatus] Error fetching status:", err);
      throw err;
    }
  }, [invitationId, type, statusEndpoint]);

  const checkStatus = useCallback(async () => {
    try {
      setError(null);
      const newStatus = await fetchStatus();

      if (newStatus) {
        setStatus(newStatus);

        // Call the callback if status changed to final state
        if (
          newStatus.status === "issued" ||
          newStatus.status === "verified" ||
          newStatus.status === "failed"
        ) {
          onStatusChangeRef.current?.(newStatus);
        }

        return newStatus;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
    return null;
  }, [fetchStatus]);

  // Polling effect
  useEffect(() => {
    if (!enabled || !invitationId) {
      setIsPolling(false);
      return;
    }

    // Don't poll if we already have a final status
    if (
      status?.status === "issued" ||
      status?.status === "verified" ||
      status?.status === "failed"
    ) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    // Initial check
    checkStatus();

    // Set up polling interval
    const intervalId = setInterval(() => {
      checkStatus().then((newStatus) => {
        // Stop polling if we get a final status
        if (
          newStatus?.status === "issued" ||
          newStatus?.status === "verified" ||
          newStatus?.status === "failed"
        ) {
          clearInterval(intervalId);
          setIsPolling(false);
        }
      });
    }, pollingInterval);

    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [enabled, invitationId, pollingInterval, checkStatus, status?.status]);

  // Reset function to start fresh polling
  const reset = useCallback(() => {
    setStatus(null);
    setError(null);
    setIsPolling(false);
  }, []);

  return {
    status,
    isPolling,
    error,
    checkStatus,
    reset,
    isIssued: status?.status === "issued",
    isVerified: status?.status === "verified",
    isPending: status?.status === "pending" || !status,
    isFailed: status?.status === "failed",
  };
}
`;
/**
 * Helper to check if a status is final (no more polling needed)
 */
export function isFinalStatus(status) {
    if (!status)
        return false;
    return ["issued", "verified", "failed"].includes(status.status);
}
/**
 * Status check utilities for non-React environments
 */
export function createStatusChecker(options) {
    const { statusEndpoint, type } = options;
    return {
        /**
         * Check status once
         */
        async check(invitationId) {
            const response = await fetch(`${statusEndpoint}?invitationId=${invitationId}&type=${type}`);
            if (!response.ok) {
                throw new Error("Failed to fetch status");
            }
            return response.json();
        },
        /**
         * Poll until a final status is reached
         */
        async pollUntilComplete(invitationId, options = {}) {
            const { interval = 2000, timeout = 300000, onStatus } = options;
            const startTime = Date.now();
            return new Promise((resolve, reject) => {
                const poll = async () => {
                    try {
                        if (Date.now() - startTime > timeout) {
                            reject(new Error("Polling timeout exceeded"));
                            return;
                        }
                        const status = await this.check(invitationId);
                        if (status) {
                            onStatus?.(status);
                            if (isFinalStatus(status)) {
                                resolve(status);
                                return;
                            }
                        }
                        setTimeout(poll, interval);
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                poll();
            });
        },
    };
}
//# sourceMappingURL=index.js.map