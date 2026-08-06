export interface VaccineScheduleItem {
  vaccineName: string;
  dose: string;
  recommendedAgeMonths: number;
  isOptional?: boolean;
}

export const DEFAULT_VACCINATION_SCHEDULE: VaccineScheduleItem[] = [
  // Birth (0 months)
  {
    vaccineName: 'Hepatitis B',
    dose: 'Dose 0',
    recommendedAgeMonths: 0,
  },
  // 1 Month
  {
    vaccineName: 'BCG (Tuberculosis)',
    dose: 'Dose 1',
    recommendedAgeMonths: 1,
  },
  // 2 Months
  {
    vaccineName: '6-in-1',
    dose: 'Dose 1',
    recommendedAgeMonths: 2,
  },
  {
    vaccineName: 'Pneumococcal',
    dose: 'Dose 1',
    recommendedAgeMonths: 2,
  },
  {
    vaccineName: 'Rotavirus',
    dose: 'Dose 1',
    recommendedAgeMonths: 2,
  },
  {
    vaccineName: 'Meningococcal B',
    dose: 'Dose 1',
    recommendedAgeMonths: 2,
  },
  {
    vaccineName: 'Meningococcal ACYW',
    dose: 'Dose 1',
    recommendedAgeMonths: 2,
  },
  // 3 Months
  {
    vaccineName: '6-in-1',
    dose: 'Dose 2',
    recommendedAgeMonths: 3,
  },
  {
    vaccineName: 'Rotavirus',
    dose: 'Dose 2',
    recommendedAgeMonths: 3,
  },
  {
    vaccineName: 'Pneumococcal',
    dose: 'Dose 2',
    recommendedAgeMonths: 3,
  },
  // 4 Months
  {
    vaccineName: '6-in-1',
    dose: 'Dose 3',
    recommendedAgeMonths: 4,
  },
  {
    vaccineName: 'Pneumococcal',
    dose: 'Dose 3',
    recommendedAgeMonths: 4,
  },
  {
    vaccineName: 'Meningococcal B',
    dose: 'Dose 2',
    recommendedAgeMonths: 4,
  },
  {
    vaccineName: 'Meningococcal ACYW',
    dose: 'Dose 2',
    recommendedAgeMonths: 4,
  },
  // 6 Months
  {
    vaccineName: 'Seasonal Influenza',
    dose: 'Dose 1',
    recommendedAgeMonths: 6,
  },
  {
    vaccineName: 'Pneumococcal',
    dose: 'Dose 3',
    recommendedAgeMonths: 6,
  },
  {
    vaccineName: 'Meningococcal ACYW',
    dose: 'Dose 3',
    recommendedAgeMonths: 6,
  },
  {
    vaccineName: 'Meningococcal BC',
    dose: 'Dose 1',
    recommendedAgeMonths: 6,
    isOptional: true,
  },
  // 7 Months (1 month after 1st flu shot)
  {
    vaccineName: 'Seasonal Influenza',
    dose: 'Dose 2',
    recommendedAgeMonths: 7,
  },
  // 9 Months
  {
    vaccineName: 'MMR',
    dose: 'Dose 1',
    recommendedAgeMonths: 9,
  },
  {
    vaccineName: 'Chickenpox',
    dose: 'Dose 1',
    recommendedAgeMonths: 9,
  },
  {
    vaccineName: 'Japanese Encephalitis',
    dose: 'Dose 1',
    recommendedAgeMonths: 9,
  },
  // 12 Months
  {
    vaccineName: 'Chickenpox',
    dose: 'Dose 2',
    recommendedAgeMonths: 12,
  },
  {
    vaccineName: 'MMR',
    dose: 'Dose 2',
    recommendedAgeMonths: 12,
  },
  {
    vaccineName: 'Pneumococcal',
    dose: 'Dose 4 (Booster)',
    recommendedAgeMonths: 12,
  },
  {
    vaccineName: 'Meningococcal ACYW',
    dose: 'Dose 4',
    recommendedAgeMonths: 12,
  },
];
