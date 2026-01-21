import type { MedicationSchedule } from '../../types/doseCalculator';
import { calculateDoseSchedule } from './schedule';

describe('calculateDoseSchedule', () => {
  it('builds a linear titration schedule with max dose plateau', () => {
    const medication: MedicationSchedule = {
      id: 'med-1',
      medicationName: 'TestMed',
      unit: 'mg',
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-06T00:00:00Z'),
      scheduleType: 'linear',
      linearConfig: {
        startingDose: 10,
        titrationDirection: 'increase',
        changeAmount: 5,
        intervalDays: 2,
        maximumDose: 20,
      },
      preparationMode: 'none',
    };

    const doses = calculateDoseSchedule(medication);

    expect(doses).toHaveLength(6);
    expect(doses.map(dose => dose.dose)).toEqual([10, 10, 15, 15, 20, 20]);
  });

  it('builds a cyclic schedule with off days', () => {
    const medication: MedicationSchedule = {
      id: 'med-2',
      medicationName: 'CycleMed',
      unit: 'mg',
      startDate: new Date('2024-02-01T00:00:00Z'),
      endDate: new Date('2024-02-03T00:00:00Z'),
      scheduleType: 'cyclic',
      cyclicConfig: {
        dose: 20,
        daysOn: 2,
        daysOff: 1,
      },
      preparationMode: 'none',
    };

    const doses = calculateDoseSchedule(medication);

    expect(doses).toHaveLength(3);
    expect(doses.map(dose => dose.dose)).toEqual([20, 20, 0]);
    expect(doses.map(dose => dose.isOffDay)).toEqual([false, false, true]);
  });
});
