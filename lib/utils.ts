// Formatea un monto en bolivianos: 120 -> "Bs 120"
export function formatBs(amount: number): string {
  return `Bs ${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(amount)}`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}
