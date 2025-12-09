/**
 * Contract entity type matching database schema
 */
export interface Contract {
  id: string;
  contract_number: string;
  insured_name: string;
  coverage_type: string;
  start_date: string;
  end_date: string;
  broker_code: string;
  sum_insured: number;
  additional_si_percentage: number;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create a new contract
 */
export interface ContractCreate {
  contract_number: string;
  insured_name: string;
  coverage_type: string;
  start_date: string;
  end_date: string;
  broker_code: string;
  sum_insured: number;
  additional_si_percentage: number;
}

/**
 * Data for updating an existing contract (all fields optional)
 */
export interface ContractUpdate {
  contract_number?: string;
  insured_name?: string;
  coverage_type?: string;
  start_date?: string;
  end_date?: string;
  broker_code?: string;
  sum_insured?: number;
  additional_si_percentage?: number;
}
