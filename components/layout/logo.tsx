import Image from "next/image";
import Link from "next/link";

export function Logo({
  storeName,
  logoUrl,
  tagline,
  className = "",
}: {
  storeName: string;
  logoUrl?: string | null;
  tagline?: string | null;
  className?: string;
}) {
  // Split "New Gavana" into the two-tone wordmark used by the brand logo.
  const [first, ...rest] = storeName.split(" ");
  const second = rest.join(" ");

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label={`${storeName} home`}>
      {logoUrl ? (
        <span className="relative block h-10 w-28">
          <Image src={logoUrl} alt={storeName} fill sizes="112px" className="object-contain object-left" priority />
        </span>
      ) : (
        <>
          <Image
            src="/brand/logo-mark.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-9 rounded-lg mix-blend-multiply sm:size-10"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[22px] font-bold tracking-tight sm:text-2xl">
              <span className="text-navy-700">{first}</span>
              {second && <span className="text-coral-500">{second}</span>}
            </span>
            {tagline && (
              <span className="mt-0.5 hidden text-[10px] tracking-[0.18em] text-navy-700/70 uppercase sm:block">
                {tagline}
              </span>
            )}
          </span>
        </>
      )}
    </Link>
  );
}
