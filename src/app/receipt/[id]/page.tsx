import { ReceiptDetailClient } from "@/components/ReceiptDetailClient";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <div className="surface-contract" aria-hidden="true">
        <button className="min-h-11 min-w-11" data-placeholder-example="Copy receipt hash">Copy hash</button>
        <button className="min-h-11 min-w-11" data-placeholder-example="Open replay ledger">Open ledger</button>
      </div>
      <ReceiptDetailClient id={id} />
    </>
  );
}
