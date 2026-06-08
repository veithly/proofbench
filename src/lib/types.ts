export type EvaluatorMode = "standard" | "strict";
export type AgentId = "deltascout" | "yieldchaser";
export type ReceiptVerdict = "pass" | "fail" | "error";
export type ProofStatus = "local" | "ready_calldata" | "sepolia_anchored" | "failed";

export type GuestSession = {
  sessionId: string;
  userId: string;
  ownerId: string;
  createdAt: string;
};

export type QuoteRoute = {
  id: "Q-A" | "Q-B" | "Q-C";
  outputMnt: number;
  priceImpactBps: number;
  liquidityUsdc: number;
  ttlSeconds: number;
  allowlisted: boolean;
};

export type QuoteGuardTask = {
  taskId: "QG-MNT-001";
  taskType: "quote_guard_v1";
  title: string;
  intent: string;
  sourceChain: {
    name: "Mantle Sepolia";
    chainId: 5003;
    chainIdHex: "0x138b";
    rpcUrl: string;
    explorerUrl: string;
  };
  inputAmountUsdc: number;
  quotes: QuoteRoute[];
  fixtureHash: string;
};

export type AgentManifest = {
  id: AgentId;
  name: string;
  version: string;
  behavior: string;
  limitation: string;
  startingReputation: number;
  manifestHash: string;
};

export type AgentOutput = {
  taskId: QuoteGuardTask["taskId"];
  agentId: AgentId;
  selectedQuoteId: QuoteRoute["id"] | null;
  abstain: boolean;
  minOutMnt: number | null;
  reasonCodes: string[];
  observedQuoteHashes: string[];
  fixtureHash: string;
  nonce: string;
  outputHash: string;
  producedAt: string;
};

export type EvaluatorPolicy = {
  evaluatorId: "quote_guard_evaluator";
  version: "v1.0.0";
  mode: EvaluatorMode;
  maxPriceImpactBps: number;
  minLiquidityUsdc: number;
  minTtlSeconds: number;
  requireAllowlisted: boolean;
  slippageBps: number;
  passThreshold: number;
  rulesHash: string;
};

export type ScoreLine = {
  id: string;
  label: string;
  maxPoints: number;
  awarded: number;
  evidence: string;
};

export type EvaluationResult = {
  evaluator: EvaluatorPolicy;
  expectedQuoteId: QuoteRoute["id"] | null;
  expectedAction: "select" | "abstain";
  score: number;
  verdict: ReceiptVerdict;
  scoreBreakdown: ScoreLine[];
  payoutMnt: number;
  reputationDelta: number;
};

export type MantleProof = {
  chainId: 5003;
  chainName: "Mantle Sepolia";
  status: ProofStatus;
  calldata: string;
  eventPayload: {
    agentIdHash: string;
    taskHash: string;
    outputHash: string;
    receiptHash: string;
    verdict: ReceiptVerdict;
    payoutMnt: number;
    reputationDelta: number;
  };
  txHash?: string;
  explorerUrl?: string;
  limitation?: string;
};

export type ProofBenchReceipt = {
  id: string;
  createdAt: string;
  sessionId: string;
  userId: string;
  ownerId: string;
  task: QuoteGuardTask;
  agent: AgentManifest;
  output: AgentOutput;
  evaluation: EvaluationResult;
  verdict: ReceiptVerdict;
  payoutState: "paid" | "no_payout";
  payoutMnt: number;
  reputationBefore: number;
  reputationDelta: number;
  reputationAfter: number;
  receiptHash: string;
  proof: MantleProof;
};

export type ReplayResult = {
  originalReceiptId: string;
  mode: EvaluatorMode;
  evaluation: EvaluationResult;
  changed: boolean;
};
