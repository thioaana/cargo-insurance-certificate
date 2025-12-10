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

export async function createCertificateAction(
  formData: Omit<CertificateCreate, 'value_euro' | 'exchange_rate'>
): Promise<ActionResult> {
  try {
    // Convert local value to EUR using the API
    const { valueEuro, exchangeRate } = await convertToEUR(
      formData.value_local,
      formData.currency
    );

    const certificate = await createCertificate({
      ...formData,
      value_euro: valueEuro,
      exchange_rate: exchangeRate,
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
  try {
    let updates: CertificateUpdate = { ...formData };

    // If currency or value_local changed, recalculate EUR value
    if (formData.currency && formData.value_local !== undefined) {
      const { valueEuro, exchangeRate } = await convertToEUR(
        formData.value_local,
        formData.currency
      );
      updates = {
        ...updates,
        value_euro: valueEuro,
        exchange_rate: exchangeRate,
      };
    }

    await updateCertificate(id, updates);

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
