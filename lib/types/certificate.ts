/**
 * Certificate entity type matching database schema
 */
export interface Certificate {
  id: string;
  certificate_number: string;
  contract_id: string;
  insured_name: string;
  cargo_description: string;
  departure_country: string;
  arrival_country: string;
  transport_means: string;
  loading_date: string;
  currency: string;
  value_local: number;
  value_euro: number;
  exchange_rate: number;
  issue_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Certificate with joined contract data for display
 */
export interface CertificateWithContract extends Certificate {
  contract: {
    contract_number: string;
    insured_name: string;
    coverage_type: string;
    start_date: string;
    end_date: string;
    broker_code: string;
    sum_insured: number;
    additional_si_percentage: number;
  };
}

/**
 * Data required to create a new certificate
 * certificate_number is auto-generated server-side
 */
export interface CertificateCreate {
  contract_id: string;
  insured_name: string;
  cargo_description: string;
  departure_country: string;
  arrival_country: string;
  transport_means: string;
  loading_date: string;
  currency: string;
  value_local: number;
  value_euro: number;
  exchange_rate: number;
  issue_date: string;
}

/**
 * Data for updating an existing certificate (all fields optional)
 * certificate_number cannot be changed
 */
export interface CertificateUpdate {
  contract_id?: string;
  insured_name?: string;
  cargo_description?: string;
  departure_country?: string;
  arrival_country?: string;
  transport_means?: string;
  loading_date?: string;
  currency?: string;
  value_local?: number;
  value_euro?: number;
  exchange_rate?: number;
  issue_date?: string;
}
