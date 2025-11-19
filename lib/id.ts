export function makeEntryId(date: string, blockId: string): string {
  // Deterministic composite ID for a per-day, per-timeframe entry
  return `${date}:${blockId}`;
}
