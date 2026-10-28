import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/overlay/BrandLogo";
import { Panel } from "@/components/overlay/Panel";
import { useStreamState } from "@/hooks/useStreamState";

export const Route = createFileRoute("/starting-soon")({
  head: () => ({
    meta: [{ title: "X1? — Starting Soon" }],
  }),
  component: StartingSoonScene,
});

function StartingSoonScene() {
  const { state } = useStreamState();

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="absolute inset-0 bg-[color:var(--brand-ink)]/55 backdrop-blur-sm" />

      <div className="relative z-10 flex-1 grid grid-cols-[1fr_auto_1fr] items-center px-12 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4"
        >
          <span className="font-heading text-sm tracking-[0.35em] text-[color:var(--brand-blue)]">
            {state.startingSoonPreline}
          </span>
          <h1 className="font-display text-[110px] leading-[0.85] text-white">
            STARTING
            <br />
            <span style={{ color: "var(--brand-pink)" }}>SOON</span>
          </h1>
          <p className="text-white/70 max-w-md mt-3">{state.startingSoonDescription}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: [1, 1.04, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
          className="w-[420px] h-[420px] overflow-hidden rounded-[2rem] bg-[color:var(--surface-elevated)] ring-brand edge-brand flex items-center justify-center mx-12"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-full"
          >
            <BrandLogo variant="transparent" className="h-full w-full" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col gap-3 text-right"
        >
          <InfoLine kicker="EVENTO" value={state.startingSoonEvent} />
          <InfoLine kicker="FORMATO" value={state.startingSoonFormat} tone="blue" />
          <InfoLine kicker="CASTERS" value={state.startingSoonCasters} />
          <InfoLine kicker="STREAM" value={state.startingSoonStream} tone="blue" />
        </motion.div>
      </div>

      <div className="relative z-10 p-8">
        <Panel className="px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="block h-3 w-3 rounded-full bg-[color:var(--brand-pink)] animate-pulse" />
            <span className="font-heading text-[11px] tracking-[0.3em] text-white/70">
              {state.startingSoonStatus}
            </span>
          </div>
          <div className="accent-bar h-1 w-full max-w-[240px] rounded-full opacity-70" />
          <span className="font-heading text-[11px] tracking-[0.3em] text-white/70">#X1WORLDS</span>
        </Panel>
      </div>
    </div>
  );
}

function InfoLine({
  kicker,
  value,
  tone = "pink",
}: {
  kicker: string;
  value: string;
  tone?: "pink" | "blue";
}) {
  return (
    <div>
      <p
        className="font-heading text-[10px] tracking-[0.3em]"
        style={{ color: tone === "pink" ? "var(--brand-pink)" : "var(--brand-blue)" }}
      >
        {kicker}
      </p>
      <p className="font-display text-3xl text-white leading-tight">{value}</p>
    </div>
  );
}
