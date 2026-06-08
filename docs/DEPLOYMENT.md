# ProofBench Deployment Runbook

Production URL: https://proofbench.veithly.workers.dev

ProofBench deploys the Next.js app to Cloudflare Workers through OpenNext and Wrangler. The app is intentionally wallet-free for the first minute: receipts are generated deterministically, then `/api/notarize` either writes a Mantle Sepolia event when relayer secrets are configured or returns ready calldata when they are not.

## Cloudflare Target

- Worker name: `proofbench`
- Config: `wrangler.jsonc`
- Worker entry: `.open-next/worker.js`
- Static assets binding: `ASSETS`
- Service binding: `WORKER_SELF_REFERENCE`
- Observability: enabled
- Public RPC var: `MANTLE_SEPOLIA_RPC_URL=https://rpc.sepolia.mantle.xyz`

No Cloudflare storage binding required for P0. Receipts use browser-owned local storage during the hackathon demo; Cloudflare D1 is the planned upgrade for public shared receipt URLs.

## Variables And Secrets

Configured in `wrangler.jsonc`:

```bash
MANTLE_SEPOLIA_RPC_URL=https://rpc.sepolia.mantle.xyz
```

Optional runtime notarization values:

```bash
npx wrangler secret put PRIVATE_KEY
npx wrangler secret put PROOFBENCH_EMITTER_ADDRESS
```

`PRIVATE_KEY` must be a throwaway Mantle Sepolia relayer key. `PROOFBENCH_EMITTER_ADDRESS` must point to a deployed `ProofBenchReceiptEmitter` contract. If either value is absent, the live app stays honest and shows generated calldata instead of a fabricated transaction hash.

## Deploy Commands

```bash
npm install
npm run build
npm run build:worker
npm run deploy:dry-run
npm run deploy
```

`npm run deploy` builds the OpenNext worker bundle and then runs `wrangler deploy`.

## Smoke Test Commands

```bash
curl https://proofbench.veithly.workers.dev/api/proof-health
PLAYWRIGHT_BASE_URL=https://proofbench.veithly.workers.dev npx playwright test tests/onboard.spec.ts tests/receipt-detail-integrity.spec.ts tests/chain-limitation-fallback.spec.ts tests/keyboard-accessibility.spec.ts
node /Users/rick/Documents/MySkill/hackathonhunter-skill/scripts/visual_qa_scan.mjs /Users/rick/Documents/Project/Hackathon/Mantle --url https://proofbench.veithly.workers.dev --fail-on error
node /Users/rick/Documents/MySkill/hackathonhunter-skill/scripts/audit_project.mjs /Users/rick/Documents/Project/Hackathon/Mantle --phase cloudflare
```

Expected result: the hero path creates a PASS receipt, the receipt detail exposes hash inputs and Mantle calldata, the proof panel never shows a transaction hash unless relayer settings exist, and the Cloudflare audit passes.
