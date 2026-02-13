export interface AadhaarDetails {
  id?: number;
  aadhaar_number: string;
  name: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AadhaarFormData {
  aadhaar_number: string;
  name: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone_number?: string;
  email?: string;
}
