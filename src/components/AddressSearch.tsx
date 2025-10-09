"use client";
import { useRef, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButtonCustom } from "./ConnectButton";
import { BsQuestionCircle } from "react-icons/bs";
import HowToModal from "./ui/HowToModal";
import { IoClose } from "react-icons/io5";
import { useIsMobile } from "@/hooks/useIsMobile";

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
  const { address: connectedAddress, isConnected } = useAccount();
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  // Set initial value when component mounts or initialValue changes
  useEffect(() => {
    if (addressRef.current && initialValue) {
      addressRef.current.value = initialValue;
    }
  }, [initialValue]);

  // Auto-submit only on first wallet connection, not on every render
  useEffect(() => {
    if (isConnected && connectedAddress && !loading && !hasAutoSubmitted) {
      onSubmit(connectedAddress);
      setHasAutoSubmitted(true);
    }
  }, [isConnected, connectedAddress, onSubmit, loading, hasAutoSubmitted]);

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
    <div className="relative z-10 flex flex-col items-center gap-8 rounded-lg max-sm:rounded-none max-sm:border-x-0 border border-neutral-600 bg-neutral-800 p-6 max-sm:gap-4 max-sm:pt-8 max-sm:px-2 max-sm:w-full max-sm:pb-10">
      {/* HowTo link */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute top-3 left-3 flex cursor-pointer items-center gap-3 text-sm text-neutral-200 transition-colors hover:text-white"
      >
        <BsQuestionCircle color="#e5e5e5" size={isMobile ? 16 : 20} />
      </button>

      {/* Address search */}
      <div className="w-full text-center text-4xl text-neutral-200 max-sm:text-2xl max-sm:mb-4">
        Address Checker
      </div>
      <div className="flex flex-col gap-4 max-sm:gap-8 max-sm:w-full">
        <input
          ref={addressRef}
          className="w-2xl max-w-full rounded-lg bg-neutral-700 px-4 py-2.5 text-center text-white outline-0 max-sm:w-full max-sm:max-w-none max-sm:text-xs max-sm:py-2"
          type="text"
          name="address"
          id="address"
          onKeyDown={handleKeyPress}
          placeholder="0x1234...abcd or vitalik.eth"
          disabled={loading}
          defaultValue={initialValue}
        />

        <div className="flex w-2xl gap-4 max-sm:flex-col max-sm:w-full max-sm:gap-2">
          {/* Connect Wallet Button */}
          <ConnectButtonCustom
            className="w-full flex-1 cursor-pointer rounded-lg bg-neutral-300 px-4 py-2.5 tracking-wider text-black uppercase duration-300 ease-out hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 max-sm:text-sm max-sm:py-2"
            text={loading ? "Connecting..." : "CONNECT WALLET"}
            isSearch
          />

          {/* Manual Address Check Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-lg bg-neutral-300 px-4 py-2.5 tracking-wider uppercase duration-300 ease-out hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 max-sm:text-sm max-sm:py-2"
          >
            {loading ? "Checking..." : "Check Another Address"}
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-[999999999999] flex items-center justify-center bg-black"
          onClick={() => setIsModalOpen(false)}
          onScroll={(e) => e.stopPropagation()}
          onScrollCapture={(e) => e.stopPropagation()}
        >
          <div
            className="relative mx-4 max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-neutral-600 bg-neutral-800 p-8 max-sm:p-3 max-sm:max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 cursor-pointer text-neutral-400 transition-colors hover:text-white"
            >
              <IoClose size={24} />
            </button>

            {/* Modal Title */}
            <div className="mb-6 text-2xl text-neutral-200 max-sm:text-lg">
              How To
            </div>

            {/* Modal Content */}
            <div className="text-neutral-200">
              <HowToModal />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
