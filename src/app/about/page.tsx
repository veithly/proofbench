import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/ui";

export default function AboutPage() {
  return (
    <AppShell>
      <section className="detail-hero">
        <div>
          <p className="kicker">Architecture</p>
          <h1>Useful work gets a receipt.</h1>
          <p>ProofBench keeps the P0 path honest: deterministic agents, visible evaluator rules, browser-saved receipts, and optional Mantle Sepolia notarization.</p>
        </div>
        <Link className="button button-primary" href="/">
          Run the bench
        </Link>
      </section>

      <section className="about-grid">
        <Panel title="P0 real backbone">
          <ul className="plain-list">
            <li>Static quote-guard fixture with hashable quote inputs.</li>
            <li>Deterministic local agents: no hidden LLM payout judge.</li>
            <li>Receipt hash: task, output, evaluator, payout, and reputation fields.</li>
            <li>Browser localStorage: saved receipt ledger and agent reputation.</li>
          </ul>
        </Panel>
        <Panel title="Optional chain write">
          <p className="muted-copy">`ProofBenchReceiptEmitter` is included for Mantle Sepolia event anchoring. A funded throwaway key and deployed contract are required before the app can claim an explorer-resolvable write.</p>
        </Panel>
        <Panel title="Cut list">
          <ul className="plain-list">
            <li>No real escrow movement in P0.</li>
            <li>No mainnet payment claims.</li>
            <li>No agent marketplace directory.</li>
            <li>No hidden LLM evaluator.</li>
          </ul>
        </Panel>
      </section>
    </AppShell>
  );
}
