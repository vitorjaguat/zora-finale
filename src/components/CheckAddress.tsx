"use client";
import { AddressSearch } from "./AddressSearch";
import { ResultsDisplay } from "./ResultsDisplay";
import { ErrorDisplay } from "./ErrorDisplay";
import { useAddressLookup } from "@/hooks/useAddressLookup";

export default function CheckAddress() {
  const { result, loading, error, handleSubmit } = useAddressLookup();

  return (
    <div className="flex flex-col items-center gap-2 font-mono">
      <AddressSearch onSubmit={handleSubmit} loading={loading} />

      {error && <ErrorDisplay error={error} />}

      {result && <ResultsDisplay result={result} />}
    </div>
  );
}
