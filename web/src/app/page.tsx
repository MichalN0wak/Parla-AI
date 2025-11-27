const mockConversation = [
  {
    speaker: "AI",
    text: "Ciao Michal! Di cosa ti piacerebbe parlare oggi?",
  },
  {
    speaker: "You",
    text: "Vorrei parlare del mio viaggio a Napoli la prossima primavera.",
  },
  {
    speaker: "AI",
    text: "Ottima scelta! Com'è nato il desiderio di visitare Napoli? Possiamo iniziare da lì.",
  },
] as const;

const mockCards = [
  {
    type: "vocab",
    title: "primavera → la primavera",
    detail: "Ricorda l'articolo determinativo quando parli delle stagioni.",
  },
  {
    type: "grammar",
    title: "Vorrei vs Voglio",
    detail: "Usa 'vorrei' per esprimere desideri con tono gentile.",
  },
] as const;

const sessionIndicators = [
  { label: "Listening", color: "bg-emerald-500/20 text-emerald-300" },
  { label: "Latency <2s", color: "bg-sky-500/20 text-sky-200" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:px-8 lg:py-16">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Parla AI · Voice Practice
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold lg:text-4xl">
              Safe practice space for Polish → Italian conversations
            </h1>
            <span className="rounded-full border border-slate-800 px-3 py-1 text-xs tracking-wide text-slate-300">
              Prototype shell · Story 1.1
            </span>
          </div>
          <p className="max-w-3xl text-base text-slate-300">
            This placeholder screen proves the project skeleton, split layout,
            and session metadata wiring that future stories (voice capture,
            adaptive AI, learning cards) will build upon.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <div className="space-y-4 rounded-3xl border border-slate-800/70 bg-slate-900/40 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
            <div className="flex flex-col gap-4 border-b border-slate-800/60 pb-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Topic
                </p>
                <p className="text-lg text-slate-100">
                  Viaggio a Napoli · livello B1
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {sessionIndicators.map((indicator) => (
                  <span
                    key={indicator.label}
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ${indicator.color}`}
                  >
                    {indicator.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {mockConversation.map(({ speaker, text }, index) => (
                <article
                  key={`${speaker}-${index}`}
                  className={`rounded-2xl border border-slate-800/80 p-4 text-sm leading-relaxed ${
                    speaker === "You"
                      ? "bg-slate-900/70 text-slate-100"
                      : "bg-slate-900/30 text-slate-300"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {speaker}
                  </p>
                  <p>{text}</p>
                </article>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Microphone
                </p>
                <p className="text-base text-slate-100">
                  Ready for capture — Story 1.2 will attach live audio stream.
                </p>
              </div>
              <button className="rounded-full bg-emerald-500/80 px-6 py-2 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-500/30">
                Start session
              </button>
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/20 p-6 shadow-inner shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Learning Cards (preview)
                </p>
                <p className="text-lg text-slate-100">2 notes captured</p>
              </div>
              <button className="text-xs font-semibold text-slate-400 underline underline-offset-4">
                Copy all
              </button>
            </div>

            <div className="space-y-3">
              {mockCards.map(({ type, title, detail }) => (
                <article
                  key={title}
                  className={`rounded-2xl border border-slate-800/60 p-4 ${
                    type === "vocab"
                      ? "bg-emerald-500/10 text-emerald-100"
                      : "bg-amber-500/10 text-amber-50"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.3em]">
                    {type === "vocab" ? "Vocabulary" : "Grammar"}
                  </p>
                  <p className="text-base font-semibold">{title}</p>
                  <p className="text-sm opacity-90">{detail}</p>
                </article>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">
                Local-only data promise
              </p>
              <p>
                Session metadata never leaves the browser. Story 1.5 will wire
                the actual storage guards and documentation.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
