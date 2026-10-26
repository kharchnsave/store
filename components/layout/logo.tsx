import Image from "next/image";
import Link from "next/link";

/** Supplied horizontal logo; `reverse` is the white version for dark backgrounds. */
export function Logo({
  reverse = false,
  className = "h-9 w-auto",
  onNavigate,
}: {
  reverse?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 rounded-sm"
      aria-label="Kharch n Save home"
      onClick={onNavigate}
    >
      <Image
        src={
          reverse
            ? "/images/brand/kharch-n-save-logo-reverse.svg"
            : "/images/brand/kharch-n-save-logo.svg"
        }
        alt=""
        width={824}
        height={216}
        unoptimized
        className={className}
      />
    </Link>
  );
}
