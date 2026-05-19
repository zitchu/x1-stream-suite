import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type PanelProps = HTMLMotionProps<"div"> & {
  tone?: "default" | "elevated";
  edge?: boolean;
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { className, tone = "default", edge = true, children, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-[1.8rem] border border-white/10 ring-brand shadow-[0_24px_80px_-64px_rgba(0,0,0,0.5)]",
        tone === "elevated" ? "bg-[color:var(--surface-elevated)]" : "bg-[color:var(--surface)]",
        "backdrop-blur-md text-foreground",
        edge && "edge-brand",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

export function PanelHeader({
  title,
  kicker,
  right,
  className,
}: {
  title: string;
  kicker?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 px-5 pt-4 pb-3", className)}>
      <div className="flex items-center gap-3">
        <span className="block h-5 w-1.5 rounded-full bg-[color:var(--brand-pink)]" />
        <span className="block h-5 w-1.5 -ml-2 rounded-full bg-[color:var(--brand-blue)]" />
        <div className="flex flex-col leading-tight">
          {kicker && (
            <span className="font-heading text-[10px] tracking-[0.2em] text-[color:var(--brand-blue)]">
              {kicker}
            </span>
          )}
          <span className="font-display text-xl text-white">{title}</span>
        </div>
      </div>
      {right}
    </div>
  );
}
