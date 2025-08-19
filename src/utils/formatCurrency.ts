
interface FormatCurrencyParams {
  amount: number;
  currencyCode: string;
}

export const formatCurrency = ({ amount, currencyCode }: FormatCurrencyParams): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100); // Assuming amount is in cents
};
