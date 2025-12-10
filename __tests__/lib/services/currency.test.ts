import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAvailableCurrencies,
  getExchangeRateToEUR,
  convertToEUR,
  CurrencyApiError,
} from '@/lib/services/currency';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Currency Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableCurrencies', () => {
    it('should return list of currencies', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            EUR: 'Euro',
            USD: 'United States Dollar',
            GBP: 'British Pound',
          }),
      });

      const currencies = await getAvailableCurrencies();

      expect(currencies).toHaveLength(3);
      expect(currencies).toContainEqual({ code: 'EUR', name: 'Euro' });
      expect(currencies).toContainEqual({
        code: 'USD',
        name: 'United States Dollar',
      });
    });

    it('should throw CurrencyApiError when API returns error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(getAvailableCurrencies()).rejects.toThrow(CurrencyApiError);
      await expect(getAvailableCurrencies()).rejects.toThrow(
        'Currency API unavailable'
      );
    });

    it('should throw CurrencyApiError on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(getAvailableCurrencies()).rejects.toThrow(CurrencyApiError);
      await expect(getAvailableCurrencies()).rejects.toThrow('Network error');
    });
  });

  describe('getExchangeRateToEUR', () => {
    it('should return rate 1 for EUR to EUR', async () => {
      const result = await getExchangeRateToEUR('EUR');

      expect(result.rate).toBe(1);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return exchange rate for non-EUR currency', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            base: 'USD',
            date: '2025-01-15',
            rates: { EUR: 0.92 },
          }),
      });

      const result = await getExchangeRateToEUR('USD');

      expect(result.rate).toBe(0.92);
      expect(result.date).toBe('2025-01-15');
    });

    it('should throw CurrencyApiError for unsupported currency', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(getExchangeRateToEUR('XXX')).rejects.toThrow(CurrencyApiError);
      await expect(getExchangeRateToEUR('XXX')).rejects.toThrow('not supported');
    });

    it('should throw CurrencyApiError when API unavailable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getExchangeRateToEUR('USD')).rejects.toThrow(CurrencyApiError);
    });
  });

  describe('convertToEUR', () => {
    it('should convert amount to EUR using exchange rate', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            base: 'USD',
            date: '2025-01-15',
            rates: { EUR: 0.92 },
          }),
      });

      const result = await convertToEUR(100, 'USD');

      expect(result.valueEuro).toBe(92);
      expect(result.exchangeRate).toBe(0.92);
      expect(result.date).toBe('2025-01-15');
    });

    it('should round to 2 decimal places', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            base: 'USD',
            date: '2025-01-15',
            rates: { EUR: 0.923456 },
          }),
      });

      const result = await convertToEUR(100, 'USD');

      expect(result.valueEuro).toBe(92.35);
    });

    it('should return same amount for EUR', async () => {
      const result = await convertToEUR(100, 'EUR');

      expect(result.valueEuro).toBe(100);
      expect(result.exchangeRate).toBe(1);
    });
  });
});
