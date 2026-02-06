/**
 * SovraID React Hooks
 * React hooks for polling credential and verification status
 *
 * Note: These hooks are framework-agnostic patterns.
 * Copy and adapt for your specific React setup.
 */
import { CredentialStatus } from "../types";
/**
 * Hook options for useCredentialStatus
 */
export interface UseCredentialStatusOptions {
    /** The invitation ID to poll for */
    invitationId: string | null;
    /** Type of status to check */
    type: "credential" | "verification";
    /** Polling interval in milliseconds (default: 2000) */
    pollingInterval?: number;
    /** Whether polling is enabled (default: true) */
    enabled?: boolean;
    /** Callback when status changes to a final state */
    onStatusChange?: (status: CredentialStatus) => void;
    /** Base URL for the status API endpoint */
    statusEndpoint?: string;
}
/**
 * Hook return type
 */
export interface UseCredentialStatusReturn {
    status: CredentialStatus | null;
    isPolling: boolean;
    error: string | null;
    checkStatus: () => Promise<CredentialStatus | null>;
    reset: () => void;
    isIssued: boolean;
    isVerified: boolean;
    isPending: boolean;
    isFailed: boolean;
}
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
export declare const useCredentialStatusImplementation = "\nimport { useState, useEffect, useCallback, useRef } from \"react\";\nimport type { CredentialStatus } from \"@sovra/sovraid-sdk\";\n\ninterface UseCredentialStatusOptions {\n  invitationId: string | null;\n  type: \"credential\" | \"verification\";\n  pollingInterval?: number;\n  enabled?: boolean;\n  onStatusChange?: (status: CredentialStatus) => void;\n  statusEndpoint?: string;\n}\n\nexport function useCredentialStatus({\n  invitationId,\n  type,\n  pollingInterval = 2000,\n  enabled = true,\n  onStatusChange,\n  statusEndpoint = \"/api/webhooks/sovraid\",\n}: UseCredentialStatusOptions) {\n  const [status, setStatus] = useState<CredentialStatus | null>(null);\n  const [isPolling, setIsPolling] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n  const onStatusChangeRef = useRef(onStatusChange);\n\n  // Update ref when callback changes\n  useEffect(() => {\n    onStatusChangeRef.current = onStatusChange;\n  }, [onStatusChange]);\n\n  const fetchStatus = useCallback(async () => {\n    if (!invitationId) return null;\n\n    try {\n      const response = await fetch(\n        `${statusEndpoint}?invitationId=${invitationId}&type=${type}`\n      );\n\n      if (!response.ok) {\n        throw new Error(\"Failed to fetch status\");\n      }\n\n      const data: CredentialStatus = await response.json();\n      return data;\n    } catch (err) {\n      console.error(\"[useCredentialStatus] Error fetching status:\", err);\n      throw err;\n    }\n  }, [invitationId, type, statusEndpoint]);\n\n  const checkStatus = useCallback(async () => {\n    try {\n      setError(null);\n      const newStatus = await fetchStatus();\n\n      if (newStatus) {\n        setStatus(newStatus);\n\n        // Call the callback if status changed to final state\n        if (\n          newStatus.status === \"issued\" ||\n          newStatus.status === \"verified\" ||\n          newStatus.status === \"failed\"\n        ) {\n          onStatusChangeRef.current?.(newStatus);\n        }\n\n        return newStatus;\n      }\n    } catch (err) {\n      setError(err instanceof Error ? err.message : \"Unknown error\");\n    }\n    return null;\n  }, [fetchStatus]);\n\n  // Polling effect\n  useEffect(() => {\n    if (!enabled || !invitationId) {\n      setIsPolling(false);\n      return;\n    }\n\n    // Don't poll if we already have a final status\n    if (\n      status?.status === \"issued\" ||\n      status?.status === \"verified\" ||\n      status?.status === \"failed\"\n    ) {\n      setIsPolling(false);\n      return;\n    }\n\n    setIsPolling(true);\n\n    // Initial check\n    checkStatus();\n\n    // Set up polling interval\n    const intervalId = setInterval(() => {\n      checkStatus().then((newStatus) => {\n        // Stop polling if we get a final status\n        if (\n          newStatus?.status === \"issued\" ||\n          newStatus?.status === \"verified\" ||\n          newStatus?.status === \"failed\"\n        ) {\n          clearInterval(intervalId);\n          setIsPolling(false);\n        }\n      });\n    }, pollingInterval);\n\n    return () => {\n      clearInterval(intervalId);\n      setIsPolling(false);\n    };\n  }, [enabled, invitationId, pollingInterval, checkStatus, status?.status]);\n\n  // Reset function to start fresh polling\n  const reset = useCallback(() => {\n    setStatus(null);\n    setError(null);\n    setIsPolling(false);\n  }, []);\n\n  return {\n    status,\n    isPolling,\n    error,\n    checkStatus,\n    reset,\n    isIssued: status?.status === \"issued\",\n    isVerified: status?.status === \"verified\",\n    isPending: status?.status === \"pending\" || !status,\n    isFailed: status?.status === \"failed\",\n  };\n}\n";
/**
 * Helper to check if a status is final (no more polling needed)
 */
export declare function isFinalStatus(status: CredentialStatus | null): boolean;
/**
 * Status check utilities for non-React environments
 */
export declare function createStatusChecker(options: {
    statusEndpoint: string;
    type: "credential" | "verification";
}): {
    /**
     * Check status once
     */
    check(invitationId: string): Promise<CredentialStatus | null>;
    /**
     * Poll until a final status is reached
     */
    pollUntilComplete(invitationId: string, options?: {
        interval?: number;
        timeout?: number;
        onStatus?: (status: CredentialStatus) => void;
    }): Promise<CredentialStatus>;
};
//# sourceMappingURL=index.d.ts.map