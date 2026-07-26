import { useMemo, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ConfidenceChip } from "@/components/ai/AiPrimitives";
import { askAssistant, SUGGESTED_QUESTIONS, type AiContext, type AssistantReply } from "@/lib/ai/aiService";

type Turn = { question: string; reply: AssistantReply | null };

export function ManagerAssistant({ ctx }: { ctx: AiContext }) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const suggestions = useMemo(() => SUGGESTED_QUESTIONS.slice(0, 5), []);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    setInput("");
    setTurns((prev) => [...prev, { question: q, reply: null }]);
    const reply = await askAssistant(q, ctx);
    setTurns((prev) => prev.map((t, i) => (i === prev.length - 1 ? { ...t, reply } : t)));
    setBusy(false);
  };

  return (
    <div className="card-elevated flex h-full flex-col p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <div className="font-display text-lg font-semibold">Manager AI assistant</div>
          <div className="text-xs text-muted-foreground">Operational answers grounded in today's service data</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => void ask(s)}
            className="btn-jelly rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-primary"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1" style={{ maxHeight: 420 }}>
        {turns.length === 0 && (
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            Ask about demand, stock risk, kitchen bottlenecks, staffing or tonight's revenue opportunities.
          </p>
        )}
        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl bg-brand-gradient px-3.5 py-2 text-sm text-primary-foreground shadow-warm">
              {t.question}
            </div>
            {t.reply ? (
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                <p className="text-sm font-medium">{t.reply.answer}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t.reply.reasoning}</p>
                {t.reply.actions.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {t.reply.actions.map((a) => (
                      <li key={a} className="flex gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ConfidenceChip confidence={t.reply.confidence} />
                  {t.reply.references.map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Source: {t.reply.confidence.basis}.</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Analysing service data…
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
      >
        <SearchInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask an operational question…"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={busy} aria-label="Send question">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
