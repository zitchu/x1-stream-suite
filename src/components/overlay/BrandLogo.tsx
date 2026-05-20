import { cn } from "@/lib/utils";
import logoSrc from "../X1_logoSemFundo.png";

export function BrandLogo({
  className,
  alt = "X1?",
  variant = "hud",
}: {
  className?: string;
  alt?: string;
  variant?: "hud" | "transparent";
}) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        variant === "hud" && "logo-border-premium rounded-[1.6rem] bg-white overflow-hidden shadow-lg",
        className,
      )}
    >
      <img
        src={logoSrc}
        alt={alt}
        className={cn(
          "object-contain pointer-events-none select-none relative z-10",
          variant === "hud" ? "w-[93%] h-[93%]" : "w-full h-full"
        )}
        draggable={false}
      />
    </div>
  );
}
