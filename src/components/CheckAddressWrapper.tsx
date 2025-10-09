"use client";
import { Suspense } from "react";
import CheckAddress from "./CheckAddress";

function CheckAddressLoading() {
  return (
    <section className="flex flex-col items-center gap-2 max-sm:gap-1">
      <div className="flex flex-col items-center gap-8 rounded-lg border border-neutral-600 bg-neutral-800 p-6 max-sm:gap-4 max-sm:p-3 max-sm:w-full">
        <div className="w-full text-2xl text-neutral-200 max-sm:text-lg max-sm:text-center">
          Check Address
        </div>
        <div className="animate-pulse w-full">
          <div className="h-10 w-96 rounded-lg bg-neutral-500 max-sm:w-full max-sm:h-9"></div>
        </div>
        <div className="h-12 w-24 animate-pulse rounded-lg bg-neutral-300 max-sm:w-20 max-sm:h-10"></div>
      </div>
    </section>
  );
}

export default function CheckAddressWrapper() {
  return (
    <Suspense fallback={<CheckAddressLoading />}>
      <CheckAddress />
    </Suspense>
  );
}
