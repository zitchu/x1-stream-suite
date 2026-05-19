import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/overlay/BrandLogo";
import { Panel } from "@/components/overlay/Panel";

export const Route = createFileRoute("/starting-soon")({
  head: () => ({
    meta: [{ title: "X1? — Starting Soon" }],
  }),
  component: StartingSoonScene,
});

function StartingSoonScene() {
  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Soft partial overlay so anything behind (camera/scene) still shows */}
      <div className="absolute inset-0 bg-[color:var(--brand-ink)]/55 backdrop-blur-sm" />

      <div className="relative z-10 flex-1 grid grid-cols-[1fr_auto_1fr] items-center px-12">
        {/* Left text block */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4"
        >
          <span className="font-heading text-sm tracking-[0.35em] text-[color:var(--brand-blue)]">
            X1? PRESENTS
          </span>
          <h1 className="font-display text-[120px] leading-[0.85] text-white">
            STARTING<br />
            <span style={{ color: "var(--brand-pink)" }}>SOON</span>
          </h1>
          <p className="text-white/70 max-w-md mt-3">
            Get ready — the broadcast begins in a few moments. Grab a Sitrus Berry.
          </p>
        </motion.div>

        {/* Center webcam / art slot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-[420px] h-[420px] rounded-3xl bg-[color:var(--surface-elevated)] ring-brand edge-brand flex items-center justify-center mx-12"
        >
          <div className="text-center">
            <BrandLogo className="mx-auto mb-4" />
            <p className="font-heading text-[10px] tracking-[0.3em] text-white/40">
              WEBCAM / KEY ART
            </p>
          </div>
        </motion.div>

        {/* Right info column */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-col gap-3 text-right"
        >
          <InfoLine kicker="EVENT" value="Pokémon VGC Invitational" />
          <InfoLine kicker="FORMAT" value="BO5 — Regulation H" tone="blue" />
          <InfoLine kicker="CASTERS" value="Wolfey · Cybertron" />
          <InfoLine kicker="STREAM" value="twitch.tv/x1" tone="blue" />
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 p-8">
        <Panel className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="block h-3 w-3 rounded-full bg-[color:var(--brand-pink)] animate-pulse" />
            <span className="font-heading text-[11px] tracking-[0.3em] text-white/70">
              LIVE IN MOMENTS
            </span>
          </div>
          <div className="accent-bar h-1 w-40 rounded-full" />
          <span className="font-heading text-[11px] tracking-[0.3em] text-white/70">
            #X1WORLDS
          </span>
        </Panel>
      </div>
    </div>
  );
}

function InfoLine({ kicker, value, tone = "pink" }: { kicker: string; value: string; tone?: "pink" | "blue" }) {
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
