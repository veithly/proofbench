"use client";

import type { AgentId, GuestSession, ProofBenchReceipt } from "@/lib/types";
import { RECEIPT_STORAGE_KEY, REPUTATION_STORAGE_KEY, SESSION_STORAGE_KEY } from "@/lib/storage-keys";

const BASE_REPUTATION: Record<AgentId, number> = {
  deltascout: 74,
  yieldchaser: 68
};

function randomId(prefix: string) {
  const bytes = new Uint8Array(8);
  window.crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function getGuestSession(): GuestSession {
  if (typeof window === "undefined") {
    return {
      sessionId: "server_session",
      userId: "server_user",
      ownerId: "server_owner",
      createdAt: new Date().toISOString()
    };
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as GuestSession;
      if (parsed.sessionId && parsed.ownerId) return parsed;
    } catch {}
  }

  const session: GuestSession = {
    sessionId: randomId("session"),
    userId: randomId("guest"),
    ownerId: randomId("owner"),
    createdAt: new Date().toISOString()
  };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function loadReceipts(): ProofBenchReceipt[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(RECEIPT_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ProofBenchReceipt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReceipt(receipt: ProofBenchReceipt) {
  const receipts = loadReceipts().filter((item) => item.id !== receipt.id);
  const next = [receipt, ...receipts].slice(0, 30);
  window.localStorage.setItem(RECEIPT_STORAGE_KEY, JSON.stringify(next));
  saveReputation(receipt.agent.id, receipt.reputationAfter);
  return next;
}

export function findReceipt(id: string) {
  return loadReceipts().find((receipt) => receipt.id === id) || null;
}

export function loadReputation(): Record<AgentId, number> {
  if (typeof window === "undefined") return BASE_REPUTATION;
  const raw = window.localStorage.getItem(REPUTATION_STORAGE_KEY);
  if (!raw) return BASE_REPUTATION;
  try {
    return { ...BASE_REPUTATION, ...(JSON.parse(raw) as Partial<Record<AgentId, number>>) };
  } catch {
    return BASE_REPUTATION;
  }
}

export function saveReputation(agentId: AgentId, value: number) {
  const next = { ...loadReputation(), [agentId]: value };
  window.localStorage.setItem(REPUTATION_STORAGE_KEY, JSON.stringify(next));
  return next;
}
