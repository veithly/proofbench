import { clsx } from "clsx";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  return (
    <button className={clsx("button min-h-11 min-w-11", `button-${variant}`, className)} {...props}>
      {children}
    </button>
  );
}

export function Panel({
  children,
  className,
  title,
  action
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={clsx("panel", className)}>
      {(title || action) && (
        <div className="panel-head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusPill({ value }: { value: "allow" | "warn" | "block" | "pass" | "fail" | "error" }) {
  return <span className={clsx("status-pill", `status-${value}`)}>{value.toUpperCase()}</span>;
}
