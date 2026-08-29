export function normalizeMobile(mobile: string): string {
  return mobile.replace(/\s+/g, '').trim();
}
