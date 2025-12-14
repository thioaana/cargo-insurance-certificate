'use server';

import { revalidatePath } from 'next/cache';
import {
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from '@/lib/services/certificates';
import { convertToEUR } from '@/lib/services/currency';
import type { CertificateCreate, CertificateUpdate } from '@/lib/types/certificate';

export interface ActionResult {
  success: boolean;
  error?: string;
  certificateId?: string;
}

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Date format regex (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate certificate data for create/update operations
 */
function validateCertificateData(
  data: Partial<Omit<CertificateCreate, 'value_euro' | 'exchange_rate'>>,
  isUpdate = false
): string | null {
  const required = !isUpdate;

  // Contract ID validation
  if (required || data.contract_id !== undefined) {
    if (!data.contract_id?.trim()) {
      return 'Contract is required';
    }
    if (!UUID_REGEX.test(data.contract_id)) {
      return 'Invalid contract ID format';
    }
  }

  // Insured name validation
  if (required || data.insured_name !== undefined) {
    if (!data.insured_name?.trim()) {
      return 'Insured name is required';
    }
    if (data.insured_name.length > 200) {
      return 'Insured name must be 200 characters or less';
    }
  }

  // Cargo description validation
  if (required || data.cargo_description !== undefined) {
    if (!data.cargo_description?.trim()) {
      return 'Cargo description is required';
    }
    if (data.cargo_description.length > 2000) {
      return 'Cargo description must be 2000 characters or less';
    }
  }

  // Departure country validation
  if (required || data.departure_country !== undefined) {
    if (!data.departure_country?.trim()) {
      return 'Departure country is required';
    }
    if (data.departure_country.length > 100) {
      return 'Departure country must be 100 characters or less';
    }
  }

  // Arrival country validation
  if (required || data.arrival_country !== undefined) {
    if (!data.arrival_country?.trim()) {
      return 'Arrival country is required';
    }
    if (data.arrival_country.length > 100) {
      return 'Arrival country must be 100 characters or less';
    }
  }

  // Transport means validation
  if (required || data.transport_means !== undefined) {
    if (!data.transport_means?.trim()) {
      return 'Transport means is required';
    }
    if (data.transport_means.length > 100) {
      return 'Transport means must be 100 characters or less';
    }
  }

  // Loading date validation
  if (required || data.loading_date !== undefined) {
    if (!data.loading_date) {
      return 'Loading date is required';
    }
    if (!DATE_REGEX.test(data.loading_date)) {
      return 'Invalid loading date format';
    }
    const date = new Date(data.loading_date);
    if (isNaN(date.getTime())) {
      return 'Invalid loading date';
    }
  }

  // Issue date validation
  if (required || data.issue_date !== undefined) {
    if (!data.issue_date) {
      return 'Issue date is required';
    }
    if (!DATE_REGEX.test(data.issue_date)) {
      return 'Invalid issue date format';
    }
    const date = new Date(data.issue_date);
    if (isNaN(date.getTime())) {
      return 'Invalid issue date';
    }
  }

  // Currency validation
  if (required || data.currency !== undefined) {
    if (!data.currency?.trim()) {
      return 'Currency is required';
    }
    // Currency codes are typically 3 uppercase letters
    if (!/^[A-Z]{3}$/.test(data.currency.toUpperCase())) {
      return 'Invalid currency code';
    }
  }

  // Value validation
  if (required || data.value_local !== undefined) {
    if (data.value_local === undefined || data.value_local === null) {
      return 'Value is required';
    }
    if (typeof data.value_local !== 'number' || isNaN(data.value_local)) {
      return 'Value must be a valid number';
    }
    if (data.value_local < 0) {
      return 'Value cannot be negative';
    }
    if (data.value_local > 999999999999.99) {
      return 'Value exceeds maximum allowed';
    }
  }

  return null;
}

export async function createCertificateAction(
  formData: Omit<CertificateCreate, 'value_euro' | 'exchange_rate'>
): Promise<ActionResult> {
  // Validate input
  const validationError = validateCertificateData(formData);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    // Convert local value to EUR using the API
    const { valueEuro, exchangeRate } = await convertToEUR(
      formData.value_local,
      formData.currency.toUpperCase()
    );

    const certificate = await createCertificate({
      contract_id: formData.contract_id.trim(),
      insured_name: formData.insured_name.trim(),
      cargo_description: formData.cargo_description.trim(),
      departure_country: formData.departure_country.trim(),
      arrival_country: formData.arrival_country.trim(),
      transport_means: formData.transport_means.trim(),
      loading_date: formData.loading_date,
      currency: formData.currency.toUpperCase(),
      value_local: formData.value_local,
      value_euro: valueEuro,
      exchange_rate: exchangeRate,
      issue_date: formData.issue_date,
    });

    revalidatePath('/certificates');
    return { success: true, certificateId: certificate.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create certificate',
    };
  }
}

export async function updateCertificateAction(
  id: string,
  formData: Omit<CertificateUpdate, 'value_euro' | 'exchange_rate'> & {
    value_local?: number;
    currency?: string;
  }
): Promise<ActionResult> {
  // Validate ID format
  if (!id || !UUID_REGEX.test(id)) {
    return { success: false, error: 'Invalid certificate ID' };
  }

  // Validate updates
  if (!formData || Object.keys(formData).length === 0) {
    return { success: false, error: 'No updates provided' };
  }

  const validationError = validateCertificateData(formData, true);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    // Build clean updates object with trimmed strings
    const cleanUpdates: CertificateUpdate = {};

    if (formData.contract_id !== undefined) {
      cleanUpdates.contract_id = formData.contract_id.trim();
    }
    if (formData.insured_name !== undefined) {
      cleanUpdates.insured_name = formData.insured_name.trim();
    }
    if (formData.cargo_description !== undefined) {
      cleanUpdates.cargo_description = formData.cargo_description.trim();
    }
    if (formData.departure_country !== undefined) {
      cleanUpdates.departure_country = formData.departure_country.trim();
    }
    if (formData.arrival_country !== undefined) {
      cleanUpdates.arrival_country = formData.arrival_country.trim();
    }
    if (formData.transport_means !== undefined) {
      cleanUpdates.transport_means = formData.transport_means.trim();
    }
    if (formData.loading_date !== undefined) {
      cleanUpdates.loading_date = formData.loading_date;
    }
    if (formData.issue_date !== undefined) {
      cleanUpdates.issue_date = formData.issue_date;
    }
    if (formData.currency !== undefined) {
      cleanUpdates.currency = formData.currency.toUpperCase();
    }
    if (formData.value_local !== undefined) {
      cleanUpdates.value_local = formData.value_local;
    }

    // If currency or value_local changed, recalculate EUR value
    if (cleanUpdates.currency && formData.value_local !== undefined) {
      const { valueEuro, exchangeRate } = await convertToEUR(
        formData.value_local,
        cleanUpdates.currency
      );
      cleanUpdates.value_euro = valueEuro;
      cleanUpdates.exchange_rate = exchangeRate;
    }

    await updateCertificate(id, cleanUpdates);

    revalidatePath('/certificates');
    revalidatePath(`/certificates/${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update certificate',
    };
  }
}

export async function deleteCertificateAction(id: string): Promise<ActionResult> {
  // Validate ID format
  if (!id || !UUID_REGEX.test(id)) {
    return { success: false, error: 'Invalid certificate ID' };
  }

  try {
    await deleteCertificate(id);

    revalidatePath('/certificates');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete certificate',
    };
  }
}
