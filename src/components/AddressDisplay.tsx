"use client";

import { useState, useEffect } from "react";
import { resolveAddressOrENS } from "@/lib/ensUtils";

// Simple in-memory cache for ENS names to avoid duplicate lookups
const ensCache = new Map<string, string | null>();

interface AddressDisplayProps {
  address: string;
  className?: string;
  showENS?: boolean; // Optional prop to enable ENS resolution
  iconSize?: number;
}

export function AddressDisplay({
  address,
  className = "",
  showENS = false,
  iconSize = 16,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [ensLoading, setEnsLoading] = useState(false);

  // ENS resolution effect
  useEffect(() => {
    if (!showENS || !address) return;

    // Check cache first
    if (ensCache.has(address)) {
      const cachedResult = ensCache.get(address) ?? null;
      setEnsName(cachedResult);
      return;
    }

    const resolveENS = async () => {
      try {
        setEnsLoading(true);
        const result = await resolveAddressOrENS(address);
        const resolvedName = result.ensName ?? null;

        // Cache the result
        ensCache.set(address, resolvedName);
        setEnsName(resolvedName);
      } catch (error) {
        console.warn("Failed to resolve ENS for address:", address, error);
        // Cache null result to avoid repeated failed lookups
        ensCache.set(address, null);
        setEnsName(null);
      } finally {
        setEnsLoading(false);
      }
    };

    // Add a small delay to avoid overwhelming the ENS provider
    const timeoutId = setTimeout(() => {
      void resolveENS();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [address, showENS]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const getDisplayText = () => {
    if (showENS && ensLoading) {
      return formatAddress(address); // Show formatted address while loading
    }
    if (showENS && ensName) {
      return ensName; // Show ENS name if available
    }
    return formatAddress(address); // Default to formatted address
  };

  const getDisplayTitle = () => {
    if (showENS && ensName) {
      return `${ensName} (${address})`; // Show both ENS and address in tooltip
    }
    return address; // Default to just address
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <div className={`flex space-x-2 text-sm ${className}`}>
      <span
        title={getDisplayTitle()}
        className="cursor-pointer"
        onClick={copyToClipboard}
      >
        {showENS && ensLoading && (
          <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-neutral-500"></span>
        )}
        {getDisplayText()}
      </span>
      <button
        onClick={copyToClipboard}
        className="h-fit flex-shrink-0 text-neutral-400 transition-colors hover:text-neutral-200"
        title={copied ? "Copied!" : "Copy address"}
      >
        {copied ? (
          <svg
            className="text-green-400"
            width={iconSize}
            height={iconSize}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="cursor-pointer"
            width={iconSize}
            height={iconSize}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
