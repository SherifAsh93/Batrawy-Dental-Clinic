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
}
