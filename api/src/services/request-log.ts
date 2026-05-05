export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
}

const MAX_ENTRIES = 100;
const entries: LogEntry[] = [];

export function addLogEntry(entry: LogEntry): void {
  entries.unshift(entry);

  if (entries.length > MAX_ENTRIES) {
    entries.length = MAX_ENTRIES;
  }
}

export function getLogEntries(): LogEntry[] {
  return [...entries];
}

export function clearLogEntries(): void {
  entries.length = 0;
}
