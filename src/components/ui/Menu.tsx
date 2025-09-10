import Link from "next/link";

export default function Menu() {
  return (
    <div className="pointer-events-none sticky top-6 left-0 z-1 flex h-[100dvh] w-full flex-col justify-between pt-2.5 pl-6 text-neutral-200">
      <nav className="pointer-events-none flex w-full justify-between pb-6">
        <div className="w-[104px]"></div> {/* distance for ZORA */}
        <Link href="#the-plan" className="pointer-events-auto">
          The Plan
        </Link>
        <Link href="#how-to" className="pointer-events-auto">
          How To
        </Link>
        <Link href="#address-checker" className="pointer-events-auto">
          Address Checker
        </Link>
        <Link href="#donate" className="pointer-events-auto">
          Donate
        </Link>
        <div className="pointer-events-none h-4 w-[440px]"></div>
        {/* distance for Sphere component */}
      </nav>
    </div>
  );
}
