import Link from "next/link";

const navItems = [
  { href: "/", label: "Bench" },
  { href: "/run", label: "Run" },
  { href: "/ledger", label: "Ledger" },
  { href: "/proof", label: "Proof" }
] as const;

export function Sidebar() {
  return (
    <aside className="side-nav" aria-label="ProofBench navigation">
      <nav>
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <button className="side-nav-collapse min-h-11 min-w-11" data-collapse-toggle type="button">
        Collapse
      </button>
    </aside>
  );
}
