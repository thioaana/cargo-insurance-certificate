const FRANKFURTER_API_BASE = 'https://api.frankfurter.dev/v1';

/**
 * Currency info from the API
 */
export interface CurrencyInfo {
  code: string;
  name: string;
}

/**
 * Exchange rate response
 */
export interface ExchangeRateResult {
  rate: number;
  date: string;
}

/**
 * Error thrown when currency API is unavailable
 */
export class CurrencyApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CurrencyApiError';
  }
}

/**
 * Fetch all available currencies from Frankfurter API
 * @throws CurrencyApiError if API is unavailable
 */
export async function getAvailableCurrencies(): Promise<CurrencyInfo[]> {
  try {
    const response = await fetch(`${FRANKFURTER_API_BASE}/currencies`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new CurrencyApiError('Currency API unavailable');
    }

    const data: Record<string, string> = await response.json();

    // Convert object to array of CurrencyInfo
    return Object.entries(data).map(([code, name]) => ({
      code,
      name,
    }));
  } catch (error) {
    if (error instanceof CurrencyApiError) {
      throw error;
    }
    throw new CurrencyApiError('Failed to fetch currencies: Network error');
  }
}

/**
 * Get exchange rate from a currency to EUR
 * @param fromCurrency - Source currency code (e.g., 'USD')
 * @returns Exchange rate and date
 * @throws CurrencyApiError if API is unavailable or currency not supported
 */
export async function getExchangeRateToEUR(
  fromCurrency: string
): Promise<ExchangeRateResult> {
  // EUR to EUR is always 1
  if (fromCurrency.toUpperCase() === 'EUR') {
    return {
      rate: 1,
      date: new Date().toISOString().split('T')[0],
    };
  }

  try {
    const response = await fetch(
      `${FRANKFURTER_API_BASE}/latest?base=${fromCurrency}&symbols=EUR`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new CurrencyApiError(`Currency ${fromCurrency} not supported`);
      }
      throw new CurrencyApiError('Currency API unavailable');
    }

    const data = await response.json();

    if (!data.rates?.EUR) {
      throw new CurrencyApiError(`No EUR rate available for ${fromCurrency}`);
    }

    return {
      rate: data.rates.EUR,
      date: data.date,
    };
  } catch (error) {
    if (error instanceof CurrencyApiError) {
      throw error;
    }
    throw new CurrencyApiError('Failed to fetch exchange rate: Network error');
  }
}

/**
 * Convert an amount from a currency to EUR
 * @param amount - Amount in source currency
 * @param fromCurrency - Source currency code
 * @returns Converted amount in EUR and the exchange rate used
 * @throws CurrencyApiError if API is unavailable
 */
export async function convertToEUR(
  amount: number,
  fromCurrency: string
): Promise<{ valueEuro: number; exchangeRate: number; date: string }> {
  const { rate, date } = await getExchangeRateToEUR(fromCurrency);

  return {
    valueEuro: Math.round(amount * rate * 100) / 100, // Round to 2 decimal places
    exchangeRate: rate,
    date,
  };
}
