"use client";

import { CheckCircle2, ExternalLink, PlugZap, RefreshCw, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { shortHash } from "@/lib/format";

type DemoWalletPayload = {
  ok: boolean;
  chain?: string;
  chainId?: number;
  address?: string;
  explorerUrl?: string;
  balanceNative?: string;
  emitterAddress?: string;
  emitterExplorerUrl?: string;
  configured?: boolean;
  limitation?: string;
  error?: string;
};

function formatBalance(value?: string) {
  if (!value) return "0";
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function DemoWalletStatus() {
  const [status, setStatus] = useState<DemoWalletPayload | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch("/api/demo-wallet/status", { cache: "no-store" });
      setStatus((await response.json()) as DemoWalletPayload);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    setConnected(window.localStorage.getItem("proofbench.demoWalletConnected") === "1");
  }, []);

  const label = useMemo(() => {
    if (!status?.ok || !status.address) return "Demo wallet unavailable";
    if (!connected) return "Connect demo wallet";
    return `${shortHash(status.address, 6, 4)} · ${formatBalance(status.balanceNative)} MNT`;
  }, [connected, status]);

  function connect() {
    window.localStorage.setItem("proofbench.demoWalletConnected", "1");
    setConnected(true);
    void refresh();
  }

  return (
    <section className="wallet-status" data-testid="demo-wallet-status" data-connected={connected && status?.configured ? "true" : "false"}>
      <div className="wallet-main">
        <Wallet aria-hidden="true" />
        <div>
          <span>Demo relayer wallet</span>
          <strong>{label}</strong>
        </div>
      </div>
      <div className="wallet-actions">
        {status?.explorerUrl && (
          <a className="icon-link" href={status.explorerUrl} target="_blank" rel="noreferrer" aria-label="Open demo wallet on Mantle explorer">
            <ExternalLink aria-hidden="true" />
          </a>
        )}
        <button className="icon-link" type="button" onClick={refresh} aria-label="Refresh demo wallet" disabled={loading}>
          <RefreshCw aria-hidden="true" className={loading ? "spin" : undefined} />
        </button>
        <button className="wallet-connect min-h-11 min-w-11" type="button" data-testid="connect-demo-wallet" onClick={connect} disabled={!status?.ok}>
          {connected && status?.configured ? <CheckCircle2 aria-hidden="true" /> : <PlugZap aria-hidden="true" />}
          {connected && status?.configured ? "Connected" : "Connect"}
        </button>
      </div>
      {status?.configured && connected ? (
        <p>
          Mantle Sepolia event target:{" "}
          {status.emitterExplorerUrl ? (
            <a href={status.emitterExplorerUrl} target="_blank" rel="noreferrer">
              {shortHash(status.emitterAddress || "", 8, 6)}
            </a>
          ) : (
            shortHash(status.emitterAddress || "", 8, 6)
          )}
        </p>
      ) : (
        <p>{status?.limitation || status?.error || "Connect the funded relayer before anchoring the receipt."}</p>
      )}
    </section>
  );
}
