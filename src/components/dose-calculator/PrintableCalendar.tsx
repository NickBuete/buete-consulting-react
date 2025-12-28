import React, { useMemo } from 'react';
import { format } from 'date-fns';
import {
  getDateRangeForAllMedications,
  getMonthsInRange,
  generateCalendarDays,
  formatDose,
  formatDate,
} from '../../utils/doseCalculation';
import type { PatientDetails, MedicationSchedule, DoseEntry } from '../../types/doseCalculator';

interface PrintableCalendarProps {
  patient: PatientDetails | null;
  medications: MedicationSchedule[];
  calculatedDoses: Map<string, DoseEntry[]>;
}

export const PrintableCalendar: React.FC<PrintableCalendarProps> = ({
  patient,
  medications,
  calculatedDoses,
}) => {
  // Get all months to render
  const months = useMemo(() => {
    const dateRange = getDateRangeForAllMedications(calculatedDoses);
    if (!dateRange) return [];
    return getMonthsInRange(dateRange.start, dateRange.end);
  }, [calculatedDoses]);

  // Removed unused medicationIndexMap - colors are shown via legend instead

  if (!patient || medications.length === 0) {
    return null;
  }

  // Calculate patient age from DOB
  const age = Math.floor(
    (new Date().getTime() - patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  return (
    <div className="print-only">
      {/* Patient Header */}
      <div className="patient-header-print">
        <h1 className="text-2xl font-bold text-center mb-4 font-heading">
          MEDICATION DOSING SCHEDULE
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-body">
              <span className="font-semibold">Patient:</span> {patient.name}
            </p>
            <p className="font-body">
              <span className="font-semibold">Date of Birth:</span>{' '}
              {formatDate(patient.dateOfBirth)} (Age: {age})
            </p>
          </div>
          <div>
            <p className="font-body">
              <span className="font-semibold">Address:</span> {patient.address}
            </p>
            <p className="font-body">
              <span className="font-semibold">Generated:</span> {formatDate(new Date())}
            </p>
          </div>
        </div>

        {/* Medication Legend */}
        <div className="mt-4">
          <p className="font-semibold text-sm mb-2">Medications:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {medications.map((med, index) => (
              <div key={med.id} className="font-body">
                {index + 1}. {med.medicationName} {med.strength}{med.unit} -{' '}
                {med.titrationDirection === 'decrease' && `Reduce by ${med.changeAmount}${med.unit}`}
                {med.titrationDirection === 'increase' && `Increase by ${med.changeAmount}${med.unit}`}
                {med.titrationDirection === 'maintain' && 'Maintain dose'}{' '}
                every {med.intervalDays} day{med.intervalDays > 1 ? 's' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Months */}
      {months.map((month, monthIndex) => {
        const calendarDays = generateCalendarDays(month, calculatedDoses);

        return (
          <div key={monthIndex} className="calendar-month mt-6">
            <h2 className="text-xl font-bold mb-4 font-heading">
              {format(month, 'MMMM yyyy')}
            </h2>

            <table className="calendar-grid-print">
              <thead>
                <tr>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                    (day) => (
                      <th
                        key={day}
                        className="text-xs font-semibold text-gray-700 bg-gray-100 p-2 font-heading"
                      >
                        {day}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                  <tr key={weekIndex}>
                    {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((calDay, dayIndex) => (
                      <td
                        key={dayIndex}
                        className={`align-top ${
                          calDay.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div
                          className={`text-sm font-semibold mb-1 ${
                            calDay.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {format(calDay.date, 'd')}
                        </div>

                        {calDay.doses.length > 0 && (
                          <div className="space-y-1">
                            {calDay.doses.map((dose) => (
                              <div
                                key={dose.medicationId}
                                className="medication-dose-print"
                              >
                                <div className="font-semibold">
                                  {dose.medicationName}:
                                </div>
                                <div>{formatDose(dose.dose, dose.unit)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-600 border-t pt-4">
        <p>
          This medication schedule was generated on {formatDate(new Date())} and should be reviewed
          with a healthcare professional. Always follow your doctor's instructions and report any
          side effects or concerns.
        </p>
      </div>
    </div>
  );
};
