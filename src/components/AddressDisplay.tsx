import { useState } from "react";

interface AddressDisplayProps {
  address: string;
  className?: string;
}

export function AddressDisplay({
  address,
  className = "",
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
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
    <div className={`flex items-end space-x-2 text-sm ${className}`}>
      <span title={address} className="cursor-default font-mono">
        {formatAddress(address)}
      </span>
      <button
        onClick={copyToClipboard}
        className="flex-shrink-0 text-neutral-400 transition-colors hover:text-neutral-200"
        title={copied ? "Copied!" : "Copy address"}
      >
        {copied ? (
          <svg
            className="h-3.5 w-3.5 text-green-400"
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
            className="h-3.5 w-3.5 cursor-pointer"
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
