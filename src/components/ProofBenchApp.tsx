"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileJson,
  Gauge,
  Hash,
  Loader2,
  Play,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Panel, StatusPill } from "@/components/ui";
import { copyText, shortHash } from "@/lib/format";
import { getGuestSession, loadReceipts, loadReputation, saveReceipt } from "@/lib/storage";
import type {
  AgentId,
  AgentManifest,
  AgentOutput,
  EvaluationResult,
  EvaluatorMode,
  GuestSession,
  ProofBenchReceipt,
  QuoteGuardTask
} from "@/lib/types";

type RunState = "idle" | "loading-task" | "running-agent" | "evaluating" | "building-receipt" | "notarizing" | "success" | "error";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Request failed: ${response.status}`);
  return payload as T;
}

function nextDensity(current: "compact" | "comfortable") {
  return current === "compact" ? "comfortable" : "compact";
}

export function ProofBenchApp() {
  const [session, setSession] = useState<GuestSession | null>(null);
  const [agents, setAgents] = useState<AgentManifest[]>([]);
  const [task, setTask] = useState<QuoteGuardTask | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("deltascout");
  const [mode, setMode] = useState<EvaluatorMode>("standard");
  const [output, setOutput] = useState<AgentOutput | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [receipt, setReceipt] = useState<ProofBenchReceipt | null>(null);
  const [receipts, setReceipts] = useState<ProofBenchReceipt[]>([]);
  const [reputation, setReputation] = useState<Record<AgentId, number>>({ deltascout: 74, yieldchaser: 68 });
  const [runState, setRunState] = useState<RunState>("idle");
  const [error, setError] = useState("");
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [benchNote, setBenchNote] = useState("Standard evaluator pays only the highest safe allowlisted quote.");

  useEffect(() => {
    setSession(getGuestSession());
    setReceipts(loadReceipts());
    setReputation(loadReputation());
    jsonFetch<{ agents: AgentManifest[] }>("/api/agents").then((payload) => setAgents(payload.agents)).catch(() => {});
    jsonFetch<{ task: QuoteGuardTask }>("/api/fixtures/quote-guard-v1").then((payload) => setTask(payload.task)).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const agent = agents.find((item) => item.id === selectedAgent);
  const busy = ["loading-task", "running-agent", "evaluating", "building-receipt", "notarizing"].includes(runState);
  const progressSteps: Array<[string, boolean, LucideIcon]> = [
    ["Agent output", Boolean(output), ClipboardCheck],
    ["Evaluator score", Boolean(evaluation), ShieldCheck],
    ["Payout receipt", Boolean(receipt), Hash],
    ["Sepolia event", Boolean(receipt?.proof.txHash), Wallet]
  ];
  const filteredReceipts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return receipts;
    return receipts.filter((item) => `${item.id} ${item.agent.name} ${item.verdict}`.toLowerCase().includes(term));
  }, [receipts, searchTerm]);

  async function runAgentTask() {
    if (!session) return;
    setError("");
    setRunState("loading-task");
    try {
      const taskPayload = task || (await jsonFetch<{ task: QuoteGuardTask }>("/api/fixtures/quote-guard-v1")).task;
      setTask(taskPayload);
      setRunState("running-agent");
      const { output: nextOutput } = await jsonFetch<{ agent: AgentManifest; output: AgentOutput }>("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedAgent, taskId: taskPayload.taskId })
      });
      setOutput(nextOutput);
      setRunState("evaluating");
      const { evaluation: nextEvaluation } = await jsonFetch<{ evaluation: EvaluationResult }>("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ output: nextOutput, mode })
      });
      setEvaluation(nextEvaluation);
      setRunState("building-receipt");
      const before = reputation[selectedAgent] ?? agent?.startingReputation ?? 70;
      const { receipt: nextReceipt } = await jsonFetch<{ receipt: ProofBenchReceipt }>("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session,
          output: nextOutput,
          evaluation: nextEvaluation,
          reputationBefore: before
        })
      });
      setRunState("notarizing");
      const { proof } = await jsonFetch<{ proof: ProofBenchReceipt["proof"] }>("/api/notarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt: nextReceipt })
      });
      const finalReceipt = { ...nextReceipt, proof };
      setReceipt(finalReceipt);
      setReceipts(saveReceipt(finalReceipt));
      setReputation(loadReputation());
      setRunState("success");
    } catch (nextError) {
      setRunState("error");
      setError(nextError instanceof Error ? nextError.message : "ProofBench run failed.");
    }
  }

  async function copyReceiptJson() {
    if (!receipt) return;
    await copyText(JSON.stringify(receipt, null, 2));
  }

  function useCommand(action: "deltascout" | "yieldchaser" | "strict" | "standard" | "run") {
    if (action === "deltascout" || action === "yieldchaser") setSelectedAgent(action);
    if (action === "strict" || action === "standard") setMode(action);
    setCommandOpen(false);
    if (action === "run") void runAgentTask();
  }

  return (
    <AppShell>
      <section className="hero-strip proofbench-hero" data-hero-text="Score 1 agent task into payout receipt">
        <div>
          <p className="kicker">Mantle Agentic Economy</p>
          <h1>Score 1 agent task into a Mantle payout receipt in 60 seconds.</h1>
          <p className="hero-copy">Agents earn only when visible evaluator rules prove the work.</p>
        </div>
        <div className="hero-actions">
          <Button className="min-h-11 min-w-11" data-testid="run-agent-task" data-cta-primary data-next-step-cta disabled={busy} onClick={runAgentTask}>
            {busy ? <Loader2 aria-hidden="true" className="spin" /> : <Play aria-hidden="true" />}
            Run agent task
          </Button>
          <Button className="min-h-11 min-w-11" variant="secondary" onClick={() => setMode(mode === "standard" ? "strict" : "standard")}>
            <SlidersHorizontal aria-hidden="true" />
            {mode === "standard" ? "Tighten evaluator" : "Use standard evaluator"}
          </Button>
        </div>
      </section>

      <section className="command-row" aria-label="Bench controls">
        <label htmlFor="bench-search">Search receipts</label>
        <input
          id="bench-search"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search receipts by id or agent"
        />
        <Button className="min-h-11 min-w-11" variant="secondary" onClick={() => setCommandOpen(true)}>
          <Search aria-hidden="true" />
          Cmd-K actions
        </Button>
        <Button className="min-h-11 min-w-11" variant="ghost" onClick={() => setDensity(nextDensity(density))}>
          <Gauge aria-hidden="true" />
          Density: {density}
        </Button>
      </section>

      <section className="cockpit proofbench-cockpit" aria-label="ProofBench receipt bench">
        <Panel title="Agent identities" className="agent-panel">
          <div className="agent-list">
            {agents.map((item) => (
              <button
                className="agent-row agent-card-button min-h-11 min-w-11"
                data-testid={`agent-${item.id}`}
                data-selected={selectedAgent === item.id}
                key={item.id}
                onClick={() => setSelectedAgent(item.id)}
              >
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.behavior}</p>
                  <code>{shortHash(item.manifestHash, 12, 6)}</code>
                </div>
                <StatusPill value={item.id === "deltascout" ? "pass" : "fail"} />
              </button>
            ))}
          </div>
          <div className="empty-examples" aria-label="Try examples">
            <button className="min-h-11 min-w-11" data-placeholder-example="DeltaScout standard pass" onClick={() => setSelectedAgent("deltascout")}>DeltaScout pass</button>
            <button className="min-h-11 min-w-11" data-placeholder-example="YieldChaser standard fail" onClick={() => setSelectedAgent("yieldchaser")}>YieldChaser fail</button>
            <button className="min-h-11 min-w-11" data-placeholder-example="Strict replay" onClick={() => setMode("strict")}>Strict replay</button>
          </div>
        </Panel>

        <Panel title="Quote guard task" className="chain-panel">
          {task ? (
            <>
              <div className="task-summary">
                <strong>{task.title}</strong>
                <p>{task.intent}</p>
                <code>{shortHash(task.fixtureHash, 14, 8)}</code>
              </div>
              <div className="quote-table" role="table" aria-label="Quote guard fixture">
                <div role="row">
                  <span>Quote</span><span>Output</span><span>Impact</span><span>Rule</span>
                </div>
                {task.quotes.map((quote) => (
                  <div role="row" key={quote.id}>
                    <strong>{quote.id}</strong>
                    <span>{quote.outputMnt.toFixed(2)} MNT</span>
                    <span>{quote.priceImpactBps} bps</span>
                    <span>{quote.allowlisted ? "allowlisted" : "not listed"}</span>
                  </div>
                ))}
              </div>
              <div className="segmented" data-mode={mode} aria-label="Evaluator mode">
                <button className="min-h-11 min-w-11" aria-pressed={mode === "standard"} onClick={() => setMode("standard")}>Standard</button>
                <button className="min-h-11 min-w-11" aria-pressed={mode === "strict"} onClick={() => setMode("strict")}>Strict</button>
              </div>
              <p
                className="bench-note"
                data-inline-edit="contenteditable=true"
                contentEditable
                suppressContentEditableWarning
                onBlur={(event) => setBenchNote(event.currentTarget.textContent || benchNote)}
              >
                {benchNote}
              </p>
            </>
          ) : (
            <EmptyState title="Task loading" text="The quote-guard fixture is loading from the API." icon={<Loader2 aria-hidden="true" className="spin" />} />
          )}
        </Panel>

        <Panel title="Receipt rail" className="receipt-panel">
          {runState === "error" && (
            <div className="notice" role="alert">
              <AlertTriangle aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          {evaluation && (
            <article className="receipt-card" data-testid="verdict-card" data-verdict={evaluation.verdict}>
              <div className="receipt-verdict">
                {evaluation.verdict === "pass" ? <CheckCircle2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
                <div>
                  <span>Verdict</span>
                  <strong>{evaluation.verdict.toUpperCase()}</strong>
                </div>
              </div>
              <EvidenceLine label="Score" value={`${evaluation.score}/100`} />
              <EvidenceLine label="Payout" value={`${evaluation.payoutMnt} simulated MNT`} />
              <EvidenceLine label="Reputation" value={`${evaluation.reputationDelta > 0 ? "+" : ""}${evaluation.reputationDelta}`} />
            </article>
          )}
          {receipt ? (
            <article className="receipt-card" data-testid="receipt-card">
              <EvidenceLine label="Receipt" value={shortHash(receipt.receiptHash, 14, 10)} mono testId="receipt-hash" />
              <EvidenceLine label="Proof" value={receipt.proof.status.replaceAll("_", " ")} />
              {receipt.proof.txHash && (
                <EvidenceLine label="Sepolia tx" value={shortHash(receipt.proof.txHash, 14, 8)} mono testId="sepolia-tx-hash" />
              )}
              <EvidenceLine label="Owner" value={shortHash(receipt.ownerId, 10, 4)} mono />
              <div className="receipt-actions">
                <Link className="button button-primary" href={`/receipt/${receipt.id}`}>
                  <Receipt aria-hidden="true" />
                  Open receipt
                </Link>
                {receipt.proof.explorerUrl && (
                  <a className="button button-secondary" href={receipt.proof.explorerUrl} target="_blank" rel="noreferrer" data-testid="open-sepolia-event">
                    <ArrowRight aria-hidden="true" />
                    Sepolia event
                  </a>
                )}
                <button className="button button-secondary min-h-11 min-w-11" data-testid="export-json" onClick={copyReceiptJson}>
                  <FileJson aria-hidden="true" />
                  Copy JSON
                </button>
              </div>
            </article>
          ) : (
            <EmptyState
              title="No payout receipt yet"
              text="Run one agent task to create a deterministic receipt."
              icon={<Receipt aria-hidden="true" />}
              action={<Button className="min-h-11 min-w-11" data-empty-cta onClick={runAgentTask}>Run DeltaScout</Button>}
            />
          )}
          <div className="mini-ledger" data-testid="ledger-link">
            <Link href="/ledger">
              View {filteredReceipts.length} saved receipt{filteredReceipts.length === 1 ? "" : "s"}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </Panel>
      </section>

      <section className="progress-strip" aria-label="Proof progress">
        {progressSteps.map(([label, done, Icon]) => (
          <div className="progress-step" data-done={done} key={String(label)}>
            <Icon aria-hidden="true" />
            <span>{String(label)}</span>
          </div>
        ))}
      </section>

      {commandOpen && (
        <div className="command-palette" data-component="CommandPalette" role="dialog" aria-label="Command palette">
          <div>
            <strong>Command palette</strong>
            <button className="min-h-11 min-w-11" onClick={() => setCommandOpen(false)}>Close</button>
          </div>
          <button className="min-h-11 min-w-11" onClick={() => useCommand("deltascout")}>Select DeltaScout</button>
          <button className="min-h-11 min-w-11" onClick={() => useCommand("yieldchaser")}>Select YieldChaser</button>
          <button className="min-h-11 min-w-11" onClick={() => useCommand("standard")}>Use standard evaluator</button>
          <button className="min-h-11 min-w-11" onClick={() => useCommand("strict")}>Use strict evaluator</button>
          <button className="min-h-11 min-w-11" onClick={() => useCommand("run")}>Run agent task</button>
        </div>
      )}
    </AppShell>
  );
}

function EvidenceLine({ label, value, mono = false, testId }: { label: string; value: string; mono?: boolean; testId?: string }) {
  return (
    <div className="evidence-line" data-testid={testId}>
      <span>{label}</span>
      <strong className={mono ? "mono" : undefined}>{value}</strong>
    </div>
  );
}

function EmptyState({ title, text, icon, action }: { title: string; text: string; icon: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      {icon}
      <strong>{title}</strong>
      <p>{text}</p>
      <div className="empty-examples">
        <button className="min-h-11 min-w-11" data-placeholder-example="DeltaScout standard pass">DeltaScout pass</button>
        <button className="min-h-11 min-w-11" data-placeholder-example="YieldChaser policy fail">YieldChaser fail</button>
        <button className="min-h-11 min-w-11" data-placeholder-example="Strict evaluator replay">Strict replay</button>
      </div>
      {action}
    </div>
  );
}
