const VND_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number, currency: 'VND' | 'USD' = 'VND'): string {
  if (currency === 'VND') return VND_FORMATTER.format(amount);
  return USD_FORMATTER.format(amount);
}

export function formatMoneyCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B ₫`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ₫`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K ₫`;
  }
  return formatMoney(amount);
}
