import { LedgerClient } from "@/components/LedgerClient";

export default function LedgerPage() {
  return (
    <>
      <div className="surface-contract" aria-hidden="true">
        <button className="min-h-11 min-w-11" data-placeholder-example="Replay standard receipt">Replay standard</button>
        <button className="min-h-11 min-w-11" data-placeholder-example="Replay strict receipt">Replay strict</button>
      </div>
      <LedgerClient />
    </>
  );
}
