"use client";

import Link from "next/link";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useState, useEffect } from "react";

export default function Menu() {
  const activeSection = useActiveSection();
  const [debouncedActiveSection, setDebouncedActiveSection] =
    useState(activeSection);

  // Debounce the active section to prevent flickering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedActiveSection(activeSection);
    }, 50); // 50ms debounce

    return () => clearTimeout(timeoutId);
  }, [activeSection]);

  const getLinkClassName = (sectionId: string) => {
    const baseClasses =
      "pointer-events-auto transition-all duration-500 ease-out";
    const activeClasses = "underline underline-offset-4 decoration-2";
    return debouncedActiveSection === sectionId
      ? `${baseClasses} ${activeClasses}`
      : baseClasses;
  };

  return (
    <div className="pointer-events-none sticky top-0 left-0 z-[60] flex w-full flex-col justify-between pt-8 pl-6 text-neutral-200 mix-blend-difference">
      <nav className="pointer-events-none flex w-full justify-between pb-6">
        <div className="w-[104px]"></div> {/* distance for ZERA */}
        <Link href="#the-plan" className={getLinkClassName("the-plan")}>
          The Plan
        </Link>
        <Link href="#how-to" className={getLinkClassName("how-to")}>
          How To
        </Link>
        <Link
          href="#address-checker"
          className={getLinkClassName("address-checker")}
        >
          Address Checker
        </Link>
        <Link href="#donate" className={getLinkClassName("donate")}>
          Donate
        </Link>
        <div className="pointer-events-none h-4 w-[440px]"></div>
        {/* distance for Sphere component */}
      </nav>
    </div>
  );
}
