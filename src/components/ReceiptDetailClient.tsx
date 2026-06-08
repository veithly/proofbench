"use client";

import Link from "next/link";
import { Braces, Copy, ExternalLink, FileJson, Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Panel, StatusPill } from "@/components/ui";
import { copyText, shortHash } from "@/lib/format";
import { findReceipt } from "@/lib/storage";
import type { ProofBenchReceipt } from "@/lib/types";

export function ReceiptDetailClient({ id }: { id: string }) {
  const [receipt, setReceipt] = useState<ProofBenchReceipt | null>(null);

  useEffect(() => {
    setReceipt(findReceipt(id));
  }, [id]);

  const hashInputs = useMemo(() => {
    if (!receipt) return [];
    return [
      ["taskHash", receipt.task.fixtureHash],
      ["agentManifestHash", receipt.agent.manifestHash],
      ["outputHash", receipt.output.outputHash],
      ["evaluatorRulesHash", receipt.evaluation.evaluator.rulesHash],
      ["verdict", receipt.verdict],
      ["payoutState", receipt.payoutState],
      ["reputationDelta", String(receipt.reputationDelta)]
    ];
  }, [receipt]);

  if (!receipt) {
    return (
      <AppShell>
        <section className="detail-hero">
          <h1>Receipt not found</h1>
          <p>Run one agent task first, then open the saved payout receipt from the rail or ledger.</p>
          <Link className="button button-primary" href="/" data-cta-primary>
            Back to bench
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="detail-hero" data-hero-text="ProofBench receipt detail">
        <div>
          <p className="kicker">Receipt detail</p>
          <h1>{shortHash(receipt.receiptHash, 18, 12)}</h1>
          <p>
            {receipt.agent.name} scored {receipt.evaluation.score}/100 and produced a {receipt.verdict.toUpperCase()} receipt.
          </p>
        </div>
        <StatusPill value={receipt.verdict} />
      </section>

      <section className="detail-grid">
        <Panel title="Proof hash inputs">
          <div className="hash-list">
            {hashInputs.map(([label, value]) => (
              <div className="hash-row" key={label}>
                <span>{label}</span>
                <code>{value}</code>
              </div>
            ))}
          </div>
          <Button className="min-h-11 min-w-11" variant="secondary" onClick={() => copyText(receipt.receiptHash)}>
            <Copy aria-hidden="true" />
            Copy receipt hash
          </Button>
        </Panel>

        <Panel title="Score breakdown">
          <div className="score-list">
            {receipt.evaluation.scoreBreakdown.map((line) => (
              <div className="score-line" key={line.id}>
                <span>{line.label}</span>
                <strong>
                  {line.awarded}/{line.maxPoints}
                </strong>
                <p>{line.evidence}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Mantle proof panel" className="wide-panel">
          <p className="muted-copy">
            Status: <strong>{receipt.proof.status.replaceAll("_", " ")}</strong>. {receipt.proof.limitation}
          </p>
          <pre className="codebox" data-testid="mantle-proof-panel">
            <code>{receipt.proof.calldata}</code>
          </pre>
          <div className="button-row">
            <Button className="min-h-11 min-w-11" variant="secondary" onClick={() => copyText(receipt.proof.calldata)}>
              <Braces aria-hidden="true" />
              Copy calldata
            </Button>
            <Button className="min-h-11 min-w-11" variant="secondary" onClick={() => copyText(JSON.stringify(receipt, null, 2))} data-testid="download-json">
              <FileJson aria-hidden="true" />
              Copy JSON
            </Button>
            {receipt.proof.explorerUrl && (
              <a className="button button-secondary" href={receipt.proof.explorerUrl} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden="true" />
                Open Sepolia event
              </a>
            )}
          </div>
        </Panel>

        <Panel title="Next step" className="wide-panel">
          <div className="receipt-actions">
            <Link className="button button-primary" href="/ledger" data-next-step-cta>
              <Receipt aria-hidden="true" />
              Replay in ledger
            </Link>
            <Link className="button button-secondary" href="/">
              Score another agent
            </Link>
          </div>
          <div className="empty-examples">
            <button className="min-h-11 min-w-11" data-placeholder-example="Copy receipt JSON">Copy JSON</button>
            <button className="min-h-11 min-w-11" data-placeholder-example="Replay strict evaluator">Replay strict</button>
            <button className="min-h-11 min-w-11" data-placeholder-example="Open Mantle proof">Open proof</button>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
