"use client";

import Link from "next/link";
import { Receipt, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Panel, StatusPill } from "@/components/ui";
import { shortHash } from "@/lib/format";
import { loadReceipts } from "@/lib/storage";
import type { EvaluatorMode, ProofBenchReceipt, ReplayResult } from "@/lib/types";

async function replayReceipt(receipt: ProofBenchReceipt, mode: EvaluatorMode) {
  const response = await fetch("/api/replay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receipt, mode })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Replay failed");
  return payload.replay as ReplayResult;
}

export function LedgerClient() {
  const [receipts, setReceipts] = useState<ProofBenchReceipt[]>([]);
  const [filter, setFilter] = useState<"all" | ProofBenchReceipt["verdict"]>("all");
  const [selected, setSelected] = useState<ProofBenchReceipt | null>(null);
  const [replay, setReplay] = useState<ReplayResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const next = loadReceipts();
    setReceipts(next);
    setSelected(next[0] || null);
  }, []);

  const filtered = useMemo(
    () => receipts.filter((receipt) => (filter === "all" ? true : receipt.verdict === filter)),
    [filter, receipts]
  );

  async function runReplay(mode: EvaluatorMode) {
    if (!selected) return;
    setError("");
    try {
      setReplay(await replayReceipt(selected, mode));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Replay failed");
    }
  }

  return (
    <AppShell>
      <section className="detail-hero" data-hero-text="ProofBench ledger replay">
        <div>
          <p className="kicker">Receipt ledger</p>
          <h1>Replay agent payouts.</h1>
          <p>Saved local receipts can be filtered, opened, and replayed under stricter evaluator rules.</p>
        </div>
        <div className="segmented">
          {["all", "pass", "fail", "error"].map((item) => (
            <button className="min-h-11 min-w-11" key={item} aria-pressed={filter === item} onClick={() => setFilter(item as typeof filter)}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="detail-grid">
        <Panel title="Receipt history">
          {filtered.length ? (
            <div className="ledger-list" data-testid="ledger-table">
              {filtered.map((receipt) => (
                <button className="ledger-row min-h-11 min-w-11" data-testid="receipt-row" onClick={() => setSelected(receipt)} key={receipt.id}>
                  <Receipt aria-hidden="true" />
                  <span className="mono">{shortHash(receipt.receiptHash, 14, 8)}</span>
                  <span>{receipt.agent.name}</span>
                  <StatusPill value={receipt.verdict} />
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search aria-hidden="true" />
              <strong>No receipts match</strong>
              <p>Run a score in the bench to populate this ledger.</p>
              <div className="empty-examples">
                <button className="min-h-11 min-w-11" data-placeholder-example="DeltaScout pass">DeltaScout pass</button>
                <button className="min-h-11 min-w-11" data-placeholder-example="YieldChaser fail">YieldChaser fail</button>
                <button className="min-h-11 min-w-11" data-placeholder-example="Strict replay">Strict replay</button>
              </div>
              <Link className="button button-primary" data-empty-cta href="/">
                Run agent task
              </Link>
            </div>
          )}
        </Panel>

        <Panel title="Replay drawer" className="wide-panel">
          {selected ? (
            <>
              <p className="muted-copy">
                Original: {selected.agent.name} scored {selected.evaluation.score}/100 as {selected.verdict.toUpperCase()}.
              </p>
              <div className="button-row" data-testid="replay-drawer">
                <Button className="min-h-11 min-w-11" onClick={() => runReplay("standard")}>
                  <RefreshCw aria-hidden="true" />
                  Replay standard
                </Button>
                <Button className="min-h-11 min-w-11" variant="secondary" onClick={() => runReplay("strict")} data-next-step-cta>
                  <RefreshCw aria-hidden="true" />
                  Replay strict
                </Button>
                <Link className="button button-secondary" href={`/receipt/${selected.id}`}>
                  Open receipt
                </Link>
              </div>
              {error && <p className="error-copy">{error}</p>}
              {replay && (
                <div className="replay-result" data-testid="replay-result">
                  <StatusPill value={replay.evaluation.verdict} />
                  <strong>{replay.evaluation.score}/100 under {replay.mode}</strong>
                  <p>{replay.changed ? "Replay changed the result without mutating the original receipt." : "Replay matched the original receipt."}</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <Search aria-hidden="true" />
              <strong>Select a receipt</strong>
              <p>Choose a row to replay the immutable output.</p>
              <div className="empty-examples">
                <button className="min-h-11 min-w-11" data-placeholder-example="Open latest receipt">Open latest</button>
                <button className="min-h-11 min-w-11" data-placeholder-example="Replay standard">Replay standard</button>
                <button className="min-h-11 min-w-11" data-placeholder-example="Replay strict">Replay strict</button>
              </div>
            </div>
          )}
        </Panel>
      </section>
    </AppShell>
  );
}
