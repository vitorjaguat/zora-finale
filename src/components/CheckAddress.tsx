"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { AddressSearch } from "./AddressSearch";
import { ResultsDisplay } from "./ResultsDisplay";
import { ErrorDisplay } from "./ErrorDisplay";
import { useAddressLookup } from "@/hooks/useAddressLookup";
import { useEffect } from "react";

export default function CheckAddress() {
  const { result, loading, error, handleSubmit } = useAddressLookup();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Check for address in URL params on mount and search automatically
  useEffect(() => {
    const addressFromUrl = searchParams.get("address");
    if (addressFromUrl && !result && !loading) {
      handleSubmit(addressFromUrl);
    }
  }, [searchParams, result, loading, handleSubmit]);

  // 2. Update URL when we have a valid result
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (result?.address) {
      params.set("address", result.address);
    } else {
      params.delete("address");
    }

    // Update URL without reloading the page
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [result?.address, router, searchParams]);

  return (
    <div className="flex flex-col items-center gap-2 font-mono">
      <AddressSearch
        onSubmit={handleSubmit}
        loading={loading}
        initialValue={searchParams.get("address") || ""}
      />

      {error && <ErrorDisplay error={error} />}

      {result && <ResultsDisplay result={result} />}
    </div>
  );
}
