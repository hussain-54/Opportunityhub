import { Link } from "@tanstack/react-router";
import { BRAND_NAME_DISPLAY } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "large";
}) {
  return (
    <Link
      to="/"
      className={cn(
        "font-serif font-black tracking-tight text-navy hover:text-bridge transition-colors",
        size === "large" ? "text-3xl italic" : "text-2xl",
        className,
      )}
      aria-label={`${BRAND_NAME_DISPLAY} home`}
    >
      {BRAND_NAME_DISPLAY}
      <span className="text-bridge">.</span>
    </Link>
  );
}