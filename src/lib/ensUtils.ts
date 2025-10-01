import { isAddress, createPublicClient, http } from "viem";
import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";

// Create a public client for ENS resolution
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ALCHEMY_RPC_URL),
});

export interface ENSResolution {
  address: string;
  ensName?: string;
  avatar?: string;
  wasResolved: boolean; // true if input was ENS name, false if it was already an address
}

/**
 * Resolves an ENS name to an address or validates an existing address
 * @param input - Either an Ethereum address (0x...) or ENS name (.eth, etc.)
 * @returns Promise<ENSResolution> - The resolved address with optional ENS info
 * @throws Error if the input is invalid or ENS resolution fails
 */
export async function resolveAddressOrENS(
  input: string,
): Promise<ENSResolution> {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    throw new Error("Please enter an address or ENS name");
  }

  // If it's already a valid address
  if (isAddress(trimmedInput)) {
    try {
      // Try to get the ENS name and avatar for this address (reverse resolution)
      const ensName = await publicClient
        .getEnsName({ address: trimmedInput })
        .catch(() => null);

      const avatar = await publicClient
        .getEnsAvatar({ name: ensName! })
        .catch(() => null);

      return {
        address: trimmedInput,
        ensName: ensName ?? undefined,
        avatar: avatar ?? undefined,
        wasResolved: false,
      };
    } catch {
      // If reverse resolution fails, just return the address
      return {
        address: trimmedInput,
        wasResolved: false,
      };
    }
  }

  // If it looks like an ENS name
  if (isLikelyENSName(trimmedInput)) {
    try {
      const resolvedAddress = await publicClient.getEnsAddress({
        name: normalize(trimmedInput),
      });

      if (!resolvedAddress) {
        throw new Error(`ENS name "${trimmedInput}" could not be resolved`);
      }

      // Try to get avatar for the ENS name
      const avatar = await publicClient
        .getEnsAvatar({
          name: normalize(trimmedInput),
        })
        .catch(() => null);

      return {
        address: resolvedAddress,
        ensName: trimmedInput,
        avatar: avatar ?? undefined,
        wasResolved: true,
      };
    } catch (ensError) {
      throw new Error(
        `Failed to resolve ENS name "${trimmedInput}": ${
          ensError instanceof Error ? ensError.message : "Unknown error"
        }`,
      );
    }
  }

  throw new Error(
    "Please enter a valid Ethereum address (0x...) or ENS name (.eth)",
  );
}

/**
 * Checks if a string looks like an ENS name
 * @param input - The string to check
 * @returns boolean - true if it looks like an ENS name
 */
export function isLikelyENSName(input: string): boolean {
  const trimmed = input.trim().toLowerCase();

  // Common ENS TLDs
  const ensTLDs = [".eth", ".xyz", ".com", ".org", ".io", ".app"];

  return (
    ensTLDs.some((tld) => trimmed.endsWith(tld)) ||
    (trimmed.includes(".") && !trimmed.startsWith("0x"))
  );
}

/**
 * Get additional ENS information for an address or name
 * @param addressOrName - Ethereum address or ENS name
 * @returns Promise with ENS details
 */
export async function getENSDetails(addressOrName: string): Promise<{
  name?: string;
  avatar?: string;
  description?: string;
  twitter?: string;
  github?: string;
  website?: string;
}> {
  try {
    const isAddr = isAddress(addressOrName);

    if (isAddr) {
      // Get ENS name for address first
      const ensName = await publicClient
        .getEnsName({
          address: addressOrName,
        })
        .catch(() => null);

      if (!ensName) return {};

      // Then get details for that ENS name
      return await getENSTextRecords(ensName);
    } else {
      return await getENSTextRecords(addressOrName);
    }
  } catch {
    return {};
  }
}

/**
 * Helper to get ENS text records
 */
async function getENSTextRecords(ensName: string) {
  try {
    const normalizedName = normalize(ensName);

    const [avatar, description, twitter, github, website] =
      await Promise.allSettled([
        publicClient.getEnsAvatar({ name: normalizedName }),
        publicClient.getEnsText({ name: normalizedName, key: "description" }),
        publicClient.getEnsText({ name: normalizedName, key: "com.twitter" }),
        publicClient.getEnsText({ name: normalizedName, key: "com.github" }),
        publicClient.getEnsText({ name: normalizedName, key: "url" }),
      ]);

    return {
      name: ensName,
      avatar:
        avatar.status === "fulfilled" ? (avatar.value ?? undefined) : undefined,
      description:
        description.status === "fulfilled"
          ? (description.value ?? undefined)
          : undefined,
      twitter:
        twitter.status === "fulfilled"
          ? (twitter.value ?? undefined)
          : undefined,
      github:
        github.status === "fulfilled" ? (github.value ?? undefined) : undefined,
      website:
        website.status === "fulfilled"
          ? (website.value ?? undefined)
          : undefined,
    };
  } catch {
    return { name: ensName };
  }
}
