import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="ProofBench home">
      <img src="/brand/logomark.svg" alt="ProofBench" width={compact ? 32 : 38} height={compact ? 32 : 38} />
      {!compact && (
        <span>
          <strong>ProofBench</strong>
          <small>agent payout receipts</small>
        </span>
      )}
    </Link>
  );
}
