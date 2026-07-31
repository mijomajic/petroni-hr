export type CorvuspayReconciliationKind =
  | 'matched_paid'
  | 'matched_unpaid'
  | 'provider_paid_local_unpaid'
  | 'provider_unpaid_local_paid'
  | 'lookup_failed';

const providerPaidStatuses = new Set(['authorized', 'completed']);

export function corvuspayProviderIsPaid(status: string | null): boolean {
  return providerPaidStatuses.has(status?.trim().toLowerCase() ?? '');
}

export function classifyCorvuspayReconciliation(input: {
  providerStatus: string | null;
  localPaid: boolean;
}): CorvuspayReconciliationKind {
  if (!input.providerStatus) return 'lookup_failed';
  const providerPaid = corvuspayProviderIsPaid(input.providerStatus);
  if (providerPaid && input.localPaid) return 'matched_paid';
  if (!providerPaid && !input.localPaid) return 'matched_unpaid';
  return providerPaid ? 'provider_paid_local_unpaid' : 'provider_unpaid_local_paid';
}

export function corvuspayReconciliationSeverity(
  kind: CorvuspayReconciliationKind
): 'warning' | 'critical' | null {
  if (kind === 'lookup_failed') return 'warning';
  if (kind === 'provider_paid_local_unpaid' || kind === 'provider_unpaid_local_paid') return 'critical';
  return null;
}
