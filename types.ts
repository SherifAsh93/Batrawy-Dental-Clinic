
export interface MedicalHistory {
  highBloodPressure: boolean;
  diabetes: boolean;
  stomachUlcer: boolean;
  rheumaticFever: boolean;
  hepatitis: boolean;
  pregnancyOrNursing: boolean;
}

export interface MedicalQuestions {
  antibioticAllergy: boolean;
  anesthesiaAllergy: boolean;
  heartProblems: boolean;
  kidneyProblems: boolean;
  liverProblems: boolean;
  regularMedication: boolean;
}

export interface Medications {
  bloodPressure: boolean;
  diabetes: boolean;
  bloodThinners: boolean;
  other: string; // Text for "Other"
}

export interface Visit {
  id: string;
  visit_date: string;
  procedure: string;
  paid_amount: number;
}

export interface Patient {
  id?: string;
  created_at?: string;
  file_number: string;
  full_name: string;
  dob: string;
  job: string;
  address: string;
  phone: string;
  email: string;
  medical_history: MedicalHistory;
  questions: MedicalQuestions;
  medications: Medications;
  total_cost: number;
  visits: Visit[];
}

export interface Appointment {
  id: string;
  patient_id: string;
  start_time: string;
  end_time: string;
  procedure: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  patients?: Patient; // For joining data
}
