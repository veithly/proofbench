# Design

## Format
Product UI design context for ProofBench.

## Visual Theme
Agent payout bench under clean lab light: pure white architecture, deep forest proof marks, amber failure ribbons, ink-heavy typography, receipt-paper microtextures, quote ledgers, and visible evaluator stamps.

## Color Palette
Use OKLCH custom properties.

- `--bg`: `oklch(1 0 0)`
- `--surface`: `oklch(0.972 0.010 165)`
- `--surface-strong`: `oklch(0.935 0.026 165)`
- `--ink`: `oklch(0.185 0.030 165)`
- `--muted`: `oklch(0.455 0.035 165)`
- `--primary`: `oklch(0.400 0.087 160)`
- `--primary-ink`: `oklch(1 0 0)`
- `--accent`: `oklch(0.705 0.145 78)`
- `--accent-ink`: `oklch(0.185 0.030 165)`
- `--warn`: `oklch(0.680 0.150 68)`
- `--danger`: `oklch(0.560 0.145 28)`
- `--line`: `oklch(0.780 0.040 165)`

Color strategy: restrained product palette. Primary marks identity and proof; amber/danger carry evaluator and payout state, not decoration.

## Typography
Use one refined sans stack for interface text and one mono stack for hashes, calldata, and quote IDs. Avoid fluid product headings, cramped display tracking, and all-caps body copy.

## Components
- Score console shell
- Agent identity cards
- Quote guard fixture table
- Evaluator rule stamps
- Verdict and payout cards
- Reputation delta card
- Receipt hash rail
- Mantle proof panel
- Ledger replay drawer

## Layout
Desktop uses a three-column proof bench: agents left, quote/evaluator center, receipt/proof rail right. Mobile collapses into receipt-first review: verdict, payout state, receipt hash, proof status, and copy/download actions.

## Motion
Use short, purposeful transitions: evaluator rules resolve, verdict stamps land, receipt slides into the rail, replay diff updates. Respect `prefers-reduced-motion`.

## Anti-Slop Rules
No gradient text, no glassmorphism, no nested cards, no oversized landing hero, no decorative bokeh/orbs, no fake terminal feed, no unreadable long hashes, no hidden LLM evaluator language.
