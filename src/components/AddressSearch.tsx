"use client";
import { useRef, useEffect } from "react";

interface AddressSearchProps {
  onSubmit: (address: string) => void;
  loading: boolean;
  initialValue?: string;
}

export function AddressSearch({
  onSubmit,
  loading,
  initialValue = "",
}: AddressSearchProps) {
  const addressRef = useRef<HTMLInputElement>(null);

  // Set initial value when component mounts or initialValue changes
  useEffect(() => {
    if (addressRef.current && initialValue) {
      addressRef.current.value = initialValue;
    }
  }, [initialValue]);

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  const handleSubmit = (): void => {
    const address = addressRef.current?.value?.trim();
    if (address) {
      onSubmit(address);
    }
  };

  return (
    <div className="z-10 flex flex-col items-center gap-8 rounded-lg border border-neutral-600 bg-neutral-800 p-6">
      <div className="w-full text-center text-4xl text-neutral-200">
        Address Checker
      </div>
      <input
        ref={addressRef}
        className="w-2xl max-w-full rounded-lg bg-neutral-500 p-2 text-center text-white outline-0"
        type="text"
        name="address"
        id="address"
        onKeyDown={handleKeyPress}
        placeholder="0x1234...abcd"
        disabled={loading}
        defaultValue={initialValue}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="cursor-pointer rounded-lg bg-neutral-300 px-4 py-2.5 tracking-wider text-black uppercase duration-300 ease-out hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Checking..." : "Submit"}
      </button>
    </div>
  );
}
