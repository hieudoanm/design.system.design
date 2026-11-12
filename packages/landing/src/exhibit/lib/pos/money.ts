export const formatMoney = (amount: number): string => `$${amount.toFixed(2)}`;

export const formatSignedMoney = (amount: number): string =>
  formatMoney(amount);
