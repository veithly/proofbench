import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:4388"),
  title: "ProofBench",
  description: "Score 1 agent task into a Mantle payout receipt in 60 seconds.",
  openGraph: {
    title: "ProofBench",
    description: "Score 1 agent task into a Mantle payout receipt in 60 seconds.",
    images: ["/brand/og.png"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
