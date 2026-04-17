// CrowdFlow — Shared Queue Constants & Types
// Safe to import in both Client and Server components

export const QUEUE_GATES: Record<string, string> = {
  Q1: 'Gate A — North Stand',
  Q2: 'Gate B — South Stand',
  Q3: 'Gate C — East Stand',
  Q4: 'Gate D — West Stand',
  Q5: 'Gate E — VIP Entrance',
};

export const QUEUE_IDS = Object.keys(QUEUE_GATES);
export const QUEUE_CAPACITY = 50;
export const MISSED_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export interface AssignResult {
  success: boolean;
  queueId?: string;
  gate?: string;
  number?: number;
  slotId?: string;
  error?: 'already_checked_in' | 'all_queues_full' | 'user_not_found' | 'transaction_failed';
}
