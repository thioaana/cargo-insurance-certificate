'use server';

import {
  createContract,
  updateContract,
  deleteContract,
} from '@/lib/services/contracts';
import { getCurrentProfile } from '@/lib/services/profiles';
import type { ContractCreate, ContractUpdate } from '@/lib/types/contract';

interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Validate contract data
 */
function validateContractData(
  data: Partial<ContractCreate>,
  isUpdate = false
): string | null {
  // For updates, skip validation of missing fields
  const required = !isUpdate;

  if (required || data.contract_number !== undefined) {
    if (!data.contract_number?.trim()) {
      return 'Contract number is required';
    }
    if (data.contract_number.length > 50) {
      return 'Contract number must be 50 characters or less';
    }
  }

  if (required || data.insured_name !== undefined) {
    if (!data.insured_name?.trim()) {
      return 'Insured name is required';
    }
    if (data.insured_name.length > 200) {
      return 'Insured name must be 200 characters or less';
    }
  }

  if (required || data.coverage_type !== undefined) {
    if (!data.coverage_type?.trim()) {
      return 'Coverage type is required';
    }
    if (data.coverage_type.length > 100) {
      return 'Coverage type must be 100 characters or less';
    }
  }

  if (required || data.broker_code !== undefined) {
    if (!data.broker_code?.trim()) {
      return 'Broker code is required';
    }
    if (data.broker_code.length > 50) {
      return 'Broker code must be 50 characters or less';
    }
  }

  if (required || data.start_date !== undefined) {
    if (!data.start_date) {
      return 'Start date is required';
    }
  }

  if (required || data.end_date !== undefined) {
    if (!data.end_date) {
      return 'End date is required';
    }
  }

  // Validate date range if both dates are provided
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (end < start) {
      return 'End date must be on or after start date';
    }
  }

  if (required || data.sum_insured !== undefined) {
    if (data.sum_insured === undefined || data.sum_insured === null) {
      return 'Sum insured is required';
    }
    if (data.sum_insured <= 0) {
      return 'Sum insured must be greater than 0';
    }
  }

  if (required || data.additional_si_percentage !== undefined) {
    if (data.additional_si_percentage === undefined || data.additional_si_percentage === null) {
      return 'Additional SI percentage is required';
    }
    if (data.additional_si_percentage < 0) {
      return 'Additional SI percentage cannot be negative';
    }
  }

  return null;
}

/**
 * Create a new contract
 */
export async function createContractAction(
  data: ContractCreate
): Promise<ActionResult> {
  // Validate input
  const validationError = validateContractData(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  // Verify admin access (defense-in-depth)
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const contract = await createContract({
      contract_number: data.contract_number.trim(),
      insured_name: data.insured_name.trim(),
      coverage_type: data.coverage_type.trim(),
      start_date: data.start_date,
      end_date: data.end_date,
      broker_code: data.broker_code.trim(),
      sum_insured: data.sum_insured,
      additional_si_percentage: data.additional_si_percentage,
    });
    return { success: true, id: contract.id };
  } catch (error) {
    if (error instanceof Error && error.message === 'Contract number already exists') {
      return { success: false, error: 'Contract number already exists' };
    }
    return { success: false, error: 'Failed to create contract' };
  }
}

/**
 * Update an existing contract
 */
export async function updateContractAction(
  id: string,
  updates: ContractUpdate
): Promise<ActionResult> {
  // Validate updates
  if (!updates || Object.keys(updates).length === 0) {
    return { success: false, error: 'No updates provided' };
  }

  const validationError = validateContractData(updates, true);
  if (validationError) {
    return { success: false, error: validationError };
  }

  // Verify admin access (defense-in-depth)
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Trim string fields if present
    const cleanUpdates: ContractUpdate = {};
    if (updates.contract_number !== undefined) {
      cleanUpdates.contract_number = updates.contract_number.trim();
    }
    if (updates.insured_name !== undefined) {
      cleanUpdates.insured_name = updates.insured_name.trim();
    }
    if (updates.coverage_type !== undefined) {
      cleanUpdates.coverage_type = updates.coverage_type.trim();
    }
    if (updates.broker_code !== undefined) {
      cleanUpdates.broker_code = updates.broker_code.trim();
    }
    if (updates.start_date !== undefined) {
      cleanUpdates.start_date = updates.start_date;
    }
    if (updates.end_date !== undefined) {
      cleanUpdates.end_date = updates.end_date;
    }
    if (updates.sum_insured !== undefined) {
      cleanUpdates.sum_insured = updates.sum_insured;
    }
    if (updates.additional_si_percentage !== undefined) {
      cleanUpdates.additional_si_percentage = updates.additional_si_percentage;
    }

    await updateContract(id, cleanUpdates);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === 'Contract number already exists') {
      return { success: false, error: 'Contract number already exists' };
    }
    return { success: false, error: 'Failed to update contract' };
  }
}

/**
 * Delete a contract
 */
export async function deleteContractAction(id: string): Promise<ActionResult> {
  // Verify admin access (defense-in-depth)
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await deleteContract(id);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete contract' };
  }
}
