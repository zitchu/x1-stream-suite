import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/overlay/BrandLogo";
import { Panel } from "@/components/overlay/Panel";

export const Route = createFileRoute("/brb")({
  head: () => ({
    meta: [{ title: "X1? — Be Right Back" }],
  }),
  component: BrbScene,
});

function BrbScene() {
  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="absolute inset-0 bg-[color:var(--brand-ink)]/55 backdrop-blur-sm" />

      <div className="relative z-10 flex-1 grid grid-cols-2 items-center px-16 gap-12">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <BrandLogo className="self-start" />
          <span className="font-heading text-sm tracking-[0.35em] text-[color:var(--brand-blue)] mt-2">
            INTERMISSÃO
          </span>
          <h1 className="font-display text-[110px] leading-[0.85] text-white">
            BE
            <br />
            <span style={{ color: "var(--brand-pink)" }}>RIGHT BACK</span>
          </h1>
          <p className="text-white/70 max-w-md">
            Pausa rápida — alongue, hidrate-se e volte com a equipe renovada.
          </p>
        </motion.div>

        {/* Side cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          <Panel className="p-5">
            <SectionTitle kicker="ENQUANTO ESPERA" title="Follow X1?" tone="pink" />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <SocialLine icon="@" handle="@x1questionmark" platform="Twitter / X" />
              <SocialLine icon="◎" handle="@x1.gg" platform="Instagram" />
              <SocialLine icon="▶" handle="X1 Gaming" platform="YouTube" />
              <SocialLine icon="◆" handle="x1.gg/discord" platform="Discord" />
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionTitle kicker="PRÓXIMO" title="Agenda" tone="blue" />
            <div className="mt-3 space-y-2">
              <ScheduleRow time="18:00" event="Group A — WOLFE vs BARUFFI" live />
              <ScheduleRow time="19:30" event="Group B — CHENG vs MONTERO" />
              <ScheduleRow time="21:00" event="Semifinals" />
              <ScheduleRow time="22:30" event="Grand Finals — BO5" />
            </div>
          </Panel>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-heading text-[10px] tracking-[0.3em] text-white/40">
              PATROCÍNIOS
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {["POKÉ MART", "SILPH", "DEVON", "ROTOM"].map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-heading text-[10px] tracking-[0.25em] text-white/70"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SectionTitle({
  kicker,
  title,
  tone,
}: {
  kicker: string;
  title: string;
  tone: "pink" | "blue";
}) {
  return (
    <div>
      <p
        className="font-heading text-[10px] tracking-[0.3em]"
        style={{ color: tone === "pink" ? "var(--brand-pink)" : "var(--brand-blue)" }}
      >
        {kicker}
      </p>
      <p className="font-display text-2xl text-white">{title}</p>
    </div>
  );
}

function SocialLine({
  icon,
  handle,
  platform,
}: {
  icon: string;
  handle: string;
  platform: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
      <span className="w-7 h-7 rounded-lg bg-[color:var(--brand-pink)] text-white grid place-items-center font-bold">
        {icon}
      </span>
      <div className="leading-tight min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-white/40">{platform}</p>
        <p className="text-sm text-white truncate">{handle}</p>
      </div>
    </div>
  );
}

function ScheduleRow({ time, event, live }: { time: string; event: string; live?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.04]">
      <span className="font-display text-lg text-[color:var(--brand-blue)] w-14">{time}</span>
      <span className="text-sm text-white/80 flex-1 truncate">{event}</span>
      {live && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[color:var(--brand-pink)] text-white">
          LIVE
        </span>
      )}
    </div>
  );
}
