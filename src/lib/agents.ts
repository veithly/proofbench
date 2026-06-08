import { stableHash } from "@/lib/hash";
import type {
  AgentId,
  AgentManifest,
  AgentOutput,
  EvaluationResult,
  EvaluatorMode,
  EvaluatorPolicy,
  QuoteGuardTask,
  QuoteRoute,
  ReplayResult
} from "@/lib/types";

const baseTask = {
  taskId: "QG-MNT-001",
  taskType: "quote_guard_v1",
  title: "Mantle Quote Guard: USDC -> MNT",
  intent: "Prepare a safe route for swapping 100.00 USDC into MNT on Mantle.",
  sourceChain: {
    name: "Mantle Sepolia",
    chainId: 5003,
    chainIdHex: "0x138b",
    rpcUrl: "https://rpc.sepolia.mantle.xyz",
    explorerUrl: "https://explorer.sepolia.mantle.xyz"
  },
  inputAmountUsdc: 100,
  quotes: [
    { id: "Q-A", outputMnt: 312.4, priceImpactBps: 24, liquidityUsdc: 50000, ttlSeconds: 42, allowlisted: true },
    { id: "Q-B", outputMnt: 318.1, priceImpactBps: 112, liquidityUsdc: 30000, ttlSeconds: 40, allowlisted: true },
    { id: "Q-C", outputMnt: 334, priceImpactBps: 18, liquidityUsdc: 55000, ttlSeconds: 44, allowlisted: false }
  ]
} satisfies Omit<QuoteGuardTask, "fixtureHash">;

export const QUOTE_GUARD_TASK: QuoteGuardTask = {
  ...baseTask,
  fixtureHash: stableHash(baseTask)
};

export const AGENT_MANIFESTS: AgentManifest[] = [
  {
    id: "deltascout",
    name: "DeltaScout",
    version: "v1.0.0",
    behavior: "Applies allowlist, liquidity, TTL, and price-impact filters, then selects the highest-output eligible route.",
    limitation: "Will fail under strict replay if the original selected route violates stricter price-impact policy.",
    startingReputation: 74,
    manifestHash: stableHash({ id: "deltascout", behavior: "risk-filter-first", version: "v1.0.0" })
  },
  {
    id: "yieldchaser",
    name: "YieldChaser",
    version: "v1.0.0",
    behavior: "Greedy selector that ignores price impact after allowlist and chooses the highest allowlisted output.",
    limitation: "Optimizes output too aggressively and can lose payout on risk policy.",
    startingReputation: 68,
    manifestHash: stableHash({ id: "yieldchaser", behavior: "output-first", version: "v1.0.0" })
  }
];

export function getAgent(agentId: AgentId) {
  const agent = AGENT_MANIFESTS.find((item) => item.id === agentId);
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  return agent;
}

export function getEvaluatorPolicy(mode: EvaluatorMode): EvaluatorPolicy {
  const policy = {
    evaluatorId: "quote_guard_evaluator",
    version: "v1.0.0",
    mode,
    maxPriceImpactBps: mode === "strict" ? 20 : 50,
    minLiquidityUsdc: 10000,
    minTtlSeconds: 30,
    requireAllowlisted: true,
    slippageBps: mode === "strict" ? 30 : 50,
    passThreshold: mode === "strict" ? 95 : 85
  } satisfies Omit<EvaluatorPolicy, "rulesHash">;

  return {
    ...policy,
    rulesHash: stableHash(policy)
  };
}

function quoteHash(quote: QuoteRoute) {
  return stableHash(quote);
}

function eligibleQuotes(task: QuoteGuardTask, policy: EvaluatorPolicy) {
  return task.quotes.filter((quote) => {
    if (policy.requireAllowlisted && !quote.allowlisted) return false;
    if (quote.priceImpactBps > policy.maxPriceImpactBps) return false;
    if (quote.liquidityUsdc < policy.minLiquidityUsdc) return false;
    if (quote.ttlSeconds < policy.minTtlSeconds) return false;
    return true;
  });
}

function expectedQuote(task: QuoteGuardTask, policy: EvaluatorPolicy) {
  const eligible = eligibleQuotes(task, policy);
  if (!eligible.length) return null;
  return [...eligible].sort((a, b) => b.outputMnt - a.outputMnt)[0];
}

function minOut(outputMnt: number, slippageBps: number) {
  return Number((outputMnt * (1 - slippageBps / 10000)).toFixed(6));
}

export function runAgentTask(agentId: AgentId, task = QUOTE_GUARD_TASK): AgentOutput {
  const agent = getAgent(agentId);
  const standardPolicy = getEvaluatorPolicy("standard");
  const observedQuoteHashes = task.quotes.map(quoteHash);
  const nonce = stableHash({
    agentId,
    taskId: task.taskId,
    fixtureHash: task.fixtureHash,
    minute: new Date().toISOString().slice(0, 16)
  }).slice(0, 18);

  let selected: QuoteRoute | null = null;
  let reasonCodes: string[] = [];

  if (agent.id === "deltascout") {
    selected = expectedQuote(task, standardPolicy);
    reasonCodes = selected
      ? ["allowlist_ok", "impact_ok", "liquidity_ok", "highest_safe_output"]
      : ["abstain_no_eligible_route"];
  } else {
    selected = task.quotes
      .filter((quote) => quote.allowlisted)
      .sort((a, b) => b.outputMnt - a.outputMnt)[0] || null;
    reasonCodes = selected ? ["allowlist_ok", "highest_allowlisted_output", "risk_ignored"] : ["abstain_no_allowlisted_route"];
  }

  const outputBase = {
    taskId: task.taskId,
    agentId: agent.id,
    selectedQuoteId: selected?.id ?? null,
    abstain: !selected,
    minOutMnt: selected ? minOut(selected.outputMnt, standardPolicy.slippageBps) : null,
    reasonCodes,
    observedQuoteHashes,
    fixtureHash: task.fixtureHash,
    nonce
  };

  return {
    ...outputBase,
    outputHash: stableHash(outputBase),
    producedAt: new Date().toISOString()
  };
}

export function evaluateOutput(output: AgentOutput, mode: EvaluatorMode, task = QUOTE_GUARD_TASK): EvaluationResult {
  const evaluator = getEvaluatorPolicy(mode);
  const expected = expectedQuote(task, evaluator);
  const expectedAction = expected ? "select" : "abstain";
  const selected = task.quotes.find((quote) => quote.id === output.selectedQuoteId) || null;

  const schemaValid =
    output.taskId === task.taskId &&
    output.agentId &&
    Array.isArray(output.reasonCodes) &&
    Array.isArray(output.observedQuoteHashes) &&
    typeof output.abstain === "boolean";
  const bindingValid = output.fixtureHash === task.fixtureHash && Boolean(output.nonce);
  const routeCorrect = expected ? output.selectedQuoteId === expected.id && !output.abstain : output.abstain && !output.selectedQuoteId;
  const mathCorrect = expected
    ? output.minOutMnt === minOut(expected.outputMnt, evaluator.slippageBps) ||
      (mode === "strict" && selected?.id === expected.id && output.minOutMnt === minOut(expected.outputMnt, 50))
    : output.minOutMnt === null;
  const evidenceComplete =
    output.observedQuoteHashes.length === task.quotes.length &&
    output.reasonCodes.length > 0 &&
    output.outputHash === stableHash({
      taskId: output.taskId,
      agentId: output.agentId,
      selectedQuoteId: output.selectedQuoteId,
      abstain: output.abstain,
      minOutMnt: output.minOutMnt,
      reasonCodes: output.reasonCodes,
      observedQuoteHashes: output.observedQuoteHashes,
      fixtureHash: output.fixtureHash,
      nonce: output.nonce
    });
  const timingSafe = Boolean(output.producedAt && output.nonce);

  const scoreBreakdown = [
    {
      id: "schema",
      label: "Schema validity",
      maxPoints: 15,
      awarded: schemaValid ? 15 : 0,
      evidence: schemaValid ? "canonical output fields present" : "output schema missing fields"
    },
    {
      id: "binding",
      label: "Task binding",
      maxPoints: 10,
      awarded: bindingValid ? 10 : 0,
      evidence: bindingValid ? "task, fixture, agent, and nonce match" : "binding mismatch"
    },
    {
      id: "route",
      label: "Route correctness",
      maxPoints: 35,
      awarded: routeCorrect ? 35 : 0,
      evidence: expected ? `expected ${expected.id}, got ${output.selectedQuoteId || "abstain"}` : `expected abstain, got ${output.selectedQuoteId || "abstain"}`
    },
    {
      id: "math",
      label: "Math correctness",
      maxPoints: 20,
      awarded: mathCorrect ? 20 : 0,
      evidence: expected ? `min_out policy ${evaluator.slippageBps} bps` : "abstain requires null min_out"
    },
    {
      id: "evidence",
      label: "Evidence completeness",
      maxPoints: 10,
      awarded: evidenceComplete ? 10 : 0,
      evidence: evidenceComplete ? "quote hashes and output hash verify" : "quote hashes or output hash mismatch"
    },
    {
      id: "replay",
      label: "Replay safety",
      maxPoints: 10,
      awarded: timingSafe ? 10 : 0,
      evidence: timingSafe ? "run carries nonce and timestamp" : "missing nonce or timestamp"
    }
  ];

  const score = scoreBreakdown.reduce((sum, line) => sum + line.awarded, 0);
  const verdict = score >= evaluator.passThreshold ? "pass" : "fail";

  return {
    evaluator,
    expectedQuoteId: expected?.id ?? null,
    expectedAction,
    score,
    verdict,
    scoreBreakdown,
    payoutMnt: verdict === "pass" ? 10 : 0,
    reputationDelta: verdict === "pass" ? 8 : -6
  };
}

export function replayOutput(output: AgentOutput, mode: EvaluatorMode): ReplayResult {
  const evaluation = evaluateOutput(output, mode);
  return {
    originalReceiptId: "",
    mode,
    evaluation,
    changed: true
  };
}
