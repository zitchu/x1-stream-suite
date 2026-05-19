import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  label = "X1?",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-white rounded-2xl px-5 py-3 shadow-md",
        "min-w-[120px] min-h-[56px] ring-brand",
        className,
      )}
    >
      {/* Placeholder — drop a transparent PNG into /public/logo.png and swap to <img src="/logo.png" /> */}
      <span className="font-display text-3xl leading-none text-[color:var(--brand-ink)]">
        {label}
      </span>
      <span
        className="ml-1 font-display text-3xl leading-none"
        style={{ color: "var(--brand-pink)" }}
      >
        ?
      </span>
    </div>
  );
}
