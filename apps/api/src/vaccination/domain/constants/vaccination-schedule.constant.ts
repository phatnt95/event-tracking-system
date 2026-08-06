export interface VaccineScheduleItem {
  vaccineName: string;
  dose: string;
  recommendedAgeMonths: number;
  isOptional?: boolean;
}

export const DEFAULT_VACCINATION_SCHEDULE: VaccineScheduleItem[] = [
  // Sơ sinh (0 tháng)
  {
    vaccineName: 'Viêm gan B',
    dose: 'Mũi 0 (Sơ sinh)',
    recommendedAgeMonths: 0,
  },
  // 1 Tháng
  {
    vaccineName: 'Lao (BCG)',
    dose: 'Mũi 1',
    recommendedAgeMonths: 1,
  },
  // 2 Tháng
  {
    vaccineName: '6 trong 1',
    dose: 'Mũi 1',
    recommendedAgeMonths: 2,
  },
  {
    vaccineName: 'Phế cầu',
    dose: 'Mũi 1',
    recommendedAgeMonths: 2,
  },
  {
    vaccineName: 'Rota virus',
    dose: 'Liều 1',
    recommendedAgeMonths: 2,
  },
  {
    vaccineName: 'Màng não cầu B',
    dose: 'Mũi 1',
    recommendedAgeMonths: 2,
  },
  {
    vaccineName: 'Màng não cầu ACYW',
    dose: 'Mũi 1',
    recommendedAgeMonths: 2,
  },
  // 3 Tháng
  {
    vaccineName: '6 trong 1',
    dose: 'Mũi 2',
    recommendedAgeMonths: 3,
  },
  {
    vaccineName: 'Rota virus',
    dose: 'Liều 2',
    recommendedAgeMonths: 3,
  },
  {
    vaccineName: 'Phế cầu',
    dose: 'Mũi 2',
    recommendedAgeMonths: 3,
  },
  // 4 Tháng
  {
    vaccineName: '6 trong 1',
    dose: 'Mũi 3',
    recommendedAgeMonths: 4,
  },
  {
    vaccineName: 'Phế cầu',
    dose: 'Mũi 3',
    recommendedAgeMonths: 4,
  },
  {
    vaccineName: 'Màng não cầu B',
    dose: 'Mũi 2',
    recommendedAgeMonths: 4,
  },
  {
    vaccineName: 'Màng não cầu ACYW',
    dose: 'Mũi 2',
    recommendedAgeMonths: 4,
  },
  // 6 Tháng
  {
    vaccineName: 'Cúm mùa',
    dose: 'Mũi 1',
    recommendedAgeMonths: 6,
  },
  {
    vaccineName: 'Phế cầu',
    dose: 'Mũi 3',
    recommendedAgeMonths: 6,
  },
  {
    vaccineName: 'Màng não cầu ACYW',
    dose: 'Mũi 3',
    recommendedAgeMonths: 6,
  },
  {
    vaccineName: 'Màng não cầu BC',
    dose: 'Mũi 1',
    recommendedAgeMonths: 6,
    isOptional: true,
  },
  // 7 Tháng (1 tháng sau mũi cúm thứ 1)
  {
    vaccineName: 'Cúm mùa',
    dose: 'Mũi 2',
    recommendedAgeMonths: 7,
  },
  // 9 Tháng
  {
    vaccineName: 'Sởi - Quai bị - Rubella (MMR)',
    dose: 'Mũi 1',
    recommendedAgeMonths: 9,
  },
  {
    vaccineName: 'Thủy đậu',
    dose: 'Mũi 1',
    recommendedAgeMonths: 9,
  },
  {
    vaccineName: 'Viêm não Nhật Bản',
    dose: 'Mũi 1',
    recommendedAgeMonths: 9,
  },
  // 12 Tháng
  {
    vaccineName: 'Thủy đậu',
    dose: 'Mũi 2',
    recommendedAgeMonths: 12,
  },
  {
    vaccineName: 'Sởi - Quai bị - Rubella (MMR)',
    dose: 'Mũi 2',
    recommendedAgeMonths: 12,
  },
  {
    vaccineName: 'Phế cầu',
    dose: 'Mũi 4 (Nhắc lại)',
    recommendedAgeMonths: 12,
  },
  {
    vaccineName: 'Màng não cầu ACYW',
    dose: 'Mũi 4',
    recommendedAgeMonths: 12,
  },
];
