"use client";
import { Suspense } from "react";
import CheckAddress from "./CheckAddress";

function CheckAddressLoading() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col items-center gap-8 rounded-lg border border-neutral-600 bg-neutral-800 p-6">
        <div className="w-full text-2xl text-neutral-200">Check Address</div>
        <div className="animate-pulse">
          <div className="h-10 w-96 rounded-lg bg-neutral-500"></div>
        </div>
        <div className="h-12 w-24 animate-pulse rounded-lg bg-neutral-300"></div>
      </div>
    </div>
  );
}

export default function CheckAddressWrapper() {
  return (
    <Suspense fallback={<CheckAddressLoading />}>
      <CheckAddress />
    </Suspense>
  );
}
