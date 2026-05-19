import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [{ title: "X1? — Chat" }],
  }),
  component: ChatScene,
});

interface ChatMessage {
  id: string;
  user: string;
  color: string;
  badges?: ("mod" | "sub" | "vip")[];
  message: string;
}

const COLORS = ["#dd0da8", "#4fd5ff", "#F5C24A", "#5BD17A", "#A98FF3"];
const MOCK_USERS = [
  "AshK", "MistyGo", "Brock99", "ProfOak", "Roxanne",
  "CynthiaG", "LeonChamp", "RedSilver", "GreenLeaf", "WallyR",
];
const MOCK_LINES = [
  "Let’s gooo X1?! 🔥", "That switch was insane",
  "Miraidon sweep incoming", "GG WP",
  "predictions: 3-1", "POG", "subbed!",
  "what’s the timer", "Flutter Mane diff",
  "Wolfe is cooking", "Tera Steel?? unreal",
];

function ChatScene() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const message = MOCK_LINES[Math.floor(Math.random() * MOCK_LINES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const badges: ChatMessage["badges"] = [];
      if (Math.random() > 0.85) badges.push("mod");
      if (Math.random() > 0.6) badges.push("sub");
      setMessages((prev) => [
        ...prev.slice(-14),
        { id: `${Date.now()}-${n++}`, user, color, badges, message },
      ]);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 flex items-end p-6">
      <div className="w-[380px] max-h-[90vh] flex flex-col gap-2 overflow-hidden">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-xl bg-[color:var(--surface)] backdrop-blur-md ring-brand edge-brand px-3 py-2"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {m.badges?.includes("mod") && <Badge tone="blue">MOD</Badge>}
                {m.badges?.includes("sub") && <Badge tone="pink">SUB</Badge>}
                <span
                  className="font-display text-sm leading-none"
                  style={{ color: m.color }}
                >
                  {m.user}
                </span>
              </div>
              <p className="text-[13px] text-white leading-snug break-words">
                {m.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Badge({ tone, children }: { tone: "pink" | "blue"; children: React.ReactNode }) {
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
      style={{
        background: tone === "pink" ? "var(--brand-pink)" : "var(--brand-blue)",
        color: tone === "pink" ? "white" : "var(--brand-ink)",
      }}
    >
      {children}
    </span>
  );
}
