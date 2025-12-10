import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from './profiles';
import { getContract } from './contracts';
import type {
  Certificate,
  CertificateWithContract,
  CertificateCreate,
  CertificateUpdate,
} from '@/lib/types/certificate';
import type { Contract } from '@/lib/types/contract';

/**
 * Generate the next certificate number in format CERT-YYYY-NNNN
 */
async function generateCertificateNumber(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const prefix = `CERT-${year}-`;

  // Get the highest certificate number for this year
  const { data, error } = await supabase
    .from('certificates')
    .select('certificate_number')
    .like('certificate_number', `${prefix}%`)
    .order('certificate_number', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error('Failed to generate certificate number');
  }

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = data[0].certificate_number;
    const lastSeq = parseInt(lastNumber.replace(prefix, ''), 10);
    if (!isNaN(lastSeq)) {
      nextNumber = lastSeq + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Validate loading_date is within contract's validity period
 */
function validateLoadingDate(loadingDate: string, contract: Contract): void {
  const loading = new Date(loadingDate);
  const start = new Date(contract.start_date);
  const end = new Date(contract.end_date);

  if (loading < start || loading > end) {
    throw new Error(
      `Loading date must be between ${contract.start_date} and ${contract.end_date}`
    );
  }
}

/**
 * Validate value_euro does not exceed contract limit
 */
function validateValueLimit(valueEuro: number, contract: Contract): void {
  const maxValue =
    contract.sum_insured * (1 + contract.additional_si_percentage / 100);

  if (valueEuro > maxValue) {
    throw new Error(
      `Value (${valueEuro.toFixed(2)} EUR) exceeds contract limit (${maxValue.toFixed(2)} EUR)`
    );
  }
}

/**
 * Check if user can access a certificate (based on contract's broker_code)
 */
async function canAccessCertificate(
  contractId: string,
  brokerCode: string | null,
  isAdmin: boolean
): Promise<boolean> {
  if (isAdmin) return true;
  if (!brokerCode) return false;

  const contract = await getContract(contractId);
  return contract?.broker_code === brokerCode;
}

/**
 * Get all certificates the current user can access
 * Admin: all certificates
 * Broker: only certificates for contracts matching their broker_code
 */
export async function getCertificates(): Promise<CertificateWithContract[]> {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const supabase = await createClient();
  const isAdmin = currentProfile.role === 'admin';

  let query = supabase
    .from('certificates')
    .select(
      `
      *,
      contract:contracts (
        contract_number,
        insured_name,
        coverage_type,
        start_date,
        end_date,
        broker_code,
        sum_insured,
        additional_si_percentage
      )
    `
    )
    .order('created_at', { ascending: false });

  // Broker can only see certificates for their contracts
  if (!isAdmin) {
    if (!currentProfile.broker_code) {
      return []; // Broker without broker_code sees nothing
    }
    query = query.eq('contract.broker_code', currentProfile.broker_code);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Failed to fetch certificates');
  }

  // Filter out any certificates where the join failed (contract is null)
  // This can happen for brokers due to the filter
  return (data as CertificateWithContract[]).filter((cert) => cert.contract);
}

/**
 * Get a single certificate by ID
 */
export async function getCertificate(
  id: string
): Promise<CertificateWithContract | null> {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('certificates')
    .select(
      `
      *,
      contract:contracts (
        contract_number,
        insured_name,
        coverage_type,
        start_date,
        end_date,
        broker_code,
        sum_insured,
        additional_si_percentage
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error('Failed to fetch certificate');
  }

  const certificate = data as CertificateWithContract;

  // Check access permissions
  const isAdmin = currentProfile.role === 'admin';
  if (
    !isAdmin &&
    certificate.contract?.broker_code !== currentProfile.broker_code
  ) {
    throw new Error('Unauthorized: Cannot access this certificate');
  }

  return certificate;
}

/**
 * Get contracts available for the current user to create certificates
 * Admin: all contracts
 * Broker: only contracts matching their broker_code
 */
export async function getAvailableContracts(): Promise<Contract[]> {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const supabase = await createClient();
  const isAdmin = currentProfile.role === 'admin';

  let query = supabase.from('contracts').select('*').order('contract_number');

  if (!isAdmin) {
    if (!currentProfile.broker_code) {
      return [];
    }
    query = query.eq('broker_code', currentProfile.broker_code);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error('Failed to fetch contracts');
  }

  return data as Contract[];
}

/**
 * Create a new certificate
 */
export async function createCertificate(
  certificateData: CertificateCreate
): Promise<Certificate> {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const isAdmin = currentProfile.role === 'admin';

  // Verify access to the contract
  const canAccess = await canAccessCertificate(
    certificateData.contract_id,
    currentProfile.broker_code,
    isAdmin
  );

  if (!canAccess) {
    throw new Error('Unauthorized: Cannot create certificate for this contract');
  }

  // Get the contract for validation
  const contract = await getContract(certificateData.contract_id);
  if (!contract) {
    throw new Error('Contract not found');
  }

  // Validate business rules
  validateLoadingDate(certificateData.loading_date, contract);
  validateValueLimit(certificateData.value_euro, contract);

  // Generate certificate number
  const certificateNumber = await generateCertificateNumber();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      ...certificateData,
      certificate_number: certificateNumber,
      created_by: currentProfile.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create certificate');
  }

  return data as Certificate;
}

/**
 * Update an existing certificate
 */
export async function updateCertificate(
  id: string,
  updates: CertificateUpdate
): Promise<Certificate> {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const isAdmin = currentProfile.role === 'admin';

  // Get existing certificate to check access
  const existing = await getCertificate(id);
  if (!existing) {
    throw new Error('Certificate not found');
  }

  // If contract_id is being changed, verify access to new contract
  const contractId = updates.contract_id || existing.contract_id;
  const canAccess = await canAccessCertificate(
    contractId,
    currentProfile.broker_code,
    isAdmin
  );

  if (!canAccess) {
    throw new Error('Unauthorized: Cannot update this certificate');
  }

  // Get the contract for validation
  const contract = await getContract(contractId);
  if (!contract) {
    throw new Error('Contract not found');
  }

  // Validate business rules with updated values
  const loadingDate = updates.loading_date || existing.loading_date;
  const valueEuro = updates.value_euro ?? existing.value_euro;

  validateLoadingDate(loadingDate, contract);
  validateValueLimit(valueEuro, contract);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('certificates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update certificate');
  }

  return data as Certificate;
}

/**
 * Delete a certificate
 */
export async function deleteCertificate(id: string): Promise<void> {
  const currentProfile = await getCurrentProfile();
  if (!currentProfile) {
    throw new Error('Unauthorized: Not authenticated');
  }

  const isAdmin = currentProfile.role === 'admin';

  // Get existing certificate to check access
  const existing = await getCertificate(id);
  if (!existing) {
    throw new Error('Certificate not found');
  }

  const canAccess = await canAccessCertificate(
    existing.contract_id,
    currentProfile.broker_code,
    isAdmin
  );

  if (!canAccess) {
    throw new Error('Unauthorized: Cannot delete this certificate');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('certificates').delete().eq('id', id);

  if (error) {
    throw new Error('Failed to delete certificate');
  }
}
