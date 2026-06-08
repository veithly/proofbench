import Link from "next/link";
import { Brand } from "@/components/Brand";
import { DemoWalletStatus } from "@/components/DemoWalletStatus";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell" data-visual-lane="data-newsroom" data-hero-composition="receipt-bench">
      <header className="topbar">
        <Brand />
        <DemoWalletStatus />
        <nav aria-label="Primary navigation">
          <Link href="/">Bench</Link>
          <Link href="/run">Run</Link>
          <Link href="/ledger">Ledger</Link>
          <Link href="/proof">Proof</Link>
        </nav>
      </header>
      <Sidebar />
      {children}
    </main>
  );
}
