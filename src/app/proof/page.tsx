import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/ui";

export default function ProofPage() {
  return (
    <AppShell>
      <section className="detail-hero" data-hero-text="ProofBench proof page">
        <div>
          <p className="kicker">Proof page</p>
          <h1>Contract, API, and test evidence.</h1>
          <p>Use this surface during Q&A to show the exact proof path behind a payout receipt.</p>
        </div>
        <Link className="button button-primary" href="/" data-cta-primary data-next-step-cta>
          Run agent task
        </Link>
      </section>

      <section className="about-grid">
        <Panel title="Contract target">
          <ul className="plain-list">
            <li>Contract: `contracts/ProofBenchReceiptEmitter.sol`</li>
            <li>Emitter: `0xa9df142d14218cc99f3068cbadc1d1965f7623b7`</li>
            <li>Chain: Mantle Sepolia, chain ID 5003</li>
            <li>Route: `POST /api/notarize`</li>
            <li>Status: event write when the relayer secret is present; ready calldata otherwise.</li>
          </ul>
          <div className="empty-examples">
            <button className="min-h-11 min-w-11" data-placeholder-example="Ready calldata">Ready calldata</button>
            <button className="min-h-11 min-w-11" data-placeholder-example="Sepolia event">Sepolia event</button>
            <button className="min-h-11 min-w-11" data-placeholder-example="Receipt hash">Receipt hash</button>
          </div>
        </Panel>
        <Panel title="Evaluator target">
          <ul className="plain-list">
            <li>Evaluator: `quote_guard_evaluator:v1.0.0`</li>
            <li>Standard threshold: 85</li>
            <li>Strict threshold: 95</li>
            <li>Replay route: `POST /api/replay`</li>
          </ul>
          <div className="empty-examples">
            <button className="min-h-11 min-w-11" data-placeholder-example="Standard PASS">Standard PASS</button>
            <button className="min-h-11 min-w-11" data-placeholder-example="Strict FAIL">Strict FAIL</button>
            <button className="min-h-11 min-w-11" data-placeholder-example="Score breakdown">Score breakdown</button>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
