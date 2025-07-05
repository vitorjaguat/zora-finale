"use client";
import { AddressSearch } from "./AddressSearch";
import { ResultsDisplay } from "./ResultsDisplay";
import { ErrorDisplay } from "./ErrorDisplay";
import { useAddressLookup } from "@/hooks/useAddressLookup";
import { useEffect } from "react";

export default function CheckAddress() {
  const {
    result,
    loading,
    error,
    selectedAuctions,
    handleSubmit,
    handleSelectionChange,
  } = useAddressLookup();

  useEffect(() => {
    console.log("Selected Auctions:", selectedAuctions);
  }, [selectedAuctions]);

  return (
    <div className="flex flex-col items-center gap-2 font-mono">
      <AddressSearch onSubmit={handleSubmit} loading={loading} />

      {error && <ErrorDisplay error={error} />}

      {result && (
        <ResultsDisplay
          result={result}
          selectedAuctions={selectedAuctions}
          onSelectionChange={handleSelectionChange}
        />
      )}
    </div>
  );
}
