import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from './profiles';
import type { Contract, ContractCreate, ContractUpdate } from '@/lib/types/contract';

/**
 * Verify the current user is an admin
 * @throws Error if not authenticated or not an admin
 */
async function requireAdmin(): Promise<void> {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile || currentProfile.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Get all contracts (admin only)
 */
export async function getAllContracts(): Promise<Contract[]> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch contracts');
  }

  return data as Contract[];
}

/**
 * Get a single contract by ID
 */
export async function getContract(id: string): Promise<Contract | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error('Failed to fetch contract');
  }

  return data as Contract;
}

/**
 * Create a new contract (admin only)
 */
export async function createContract(contractData: ContractCreate): Promise<Contract> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contracts')
    .insert(contractData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Contract number already exists');
    }
    throw new Error('Failed to create contract');
  }

  return data as Contract;
}

/**
 * Update an existing contract (admin only)
 */
export async function updateContract(
  id: string,
  updates: ContractUpdate
): Promise<Contract> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('contracts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Contract number already exists');
    }
    throw new Error('Failed to update contract');
  }

  return data as Contract;
}

/**
 * Delete a contract (admin only)
 */
export async function deleteContract(id: string): Promise<void> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Failed to delete contract');
  }
}
