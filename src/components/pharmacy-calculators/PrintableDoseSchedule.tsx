import React from 'react';

interface ScheduleEntry {
  time: string;
  medication: string;
  dose: string;
}

interface PrintableDoseScheduleProps {
  childName: string;
  childAge: string;
  weight: string;
  schedule: ScheduleEntry[];
}

export const PrintableDoseSchedule: React.FC<PrintableDoseScheduleProps> = ({
  childName,
  childAge,
  weight,
  schedule,
}) => {
  if (schedule.length === 0) {
    return null;
  }

  return (
    <div className="print-only">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold font-heading">
          MEDICATION DOSING SCHEDULE
        </h1>
        {childName && (
          <p className="text-lg font-semibold font-body">{childName}</p>
        )}
        <p className="text-sm font-body">
          {childAge && `Age: ${childAge} years | `}Weight: {weight} kg
        </p>
        <p className="text-xs text-gray-600">
          Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Schedule Table */}
      <table className="w-full border-collapse border-2 border-gray-900 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-2 border-gray-900 p-3 text-left font-heading font-semibold">
              Time
            </th>
            <th className="border-2 border-gray-900 p-3 text-left font-heading font-semibold">
              Medication
            </th>
            <th className="border-2 border-gray-900 p-3 text-left font-heading font-semibold">
              Dose
            </th>
            <th className="border-2 border-gray-900 p-3 text-center font-heading font-semibold">
              Given ✓
            </th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((entry, index) => (
            <tr key={index}>
              <td className="border-2 border-gray-900 p-3 font-mono font-semibold">
                {entry.time}
              </td>
              <td className="border-2 border-gray-900 p-3 font-body">
                {entry.medication}
              </td>
              <td className="border-2 border-gray-900 p-3 font-semibold font-body">
                {entry.dose}
              </td>
              <td className="border-2 border-gray-900 p-3 text-center">
                <div className="inline-block w-6 h-6 border-2 border-gray-900"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Important Instructions */}
      <div className="border-2 border-gray-900 p-4 mb-6">
        <p className="font-semibold mb-2 font-heading">Important Instructions:</p>
        <ul className="list-disc list-inside space-y-1 text-sm font-body">
          <li>Check product concentration before administering each dose</li>
          <li>Mark the "Given" box after administering each dose</li>
          <li>Do not exceed maximum daily doses</li>
          <li>Give ibuprofen with food to minimize stomach upset</li>
        </ul>
      </div>

      {/* Safety Notes */}
      <div className="border-2 border-gray-900 p-4">
        <p className="font-semibold mb-2 font-heading">Safety Notes:</p>
        <ul className="list-disc list-inside space-y-1 text-sm font-body">
          <li>Paracetamol: Maximum 4 doses per day (max 1g per dose, 4g per day)</li>
          <li>Ibuprofen: Maximum 3 doses per day (max 400mg per dose)</li>
          <li>This is a guide only - verify all doses with AMH Children's Dosing Companion</li>
          <li>Adjust schedule based on child's response and clinical assessment</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-600 border-t-2 border-gray-900 pt-4">
        <p className="font-body">
          This medication schedule was generated on {new Date().toLocaleDateString()} and should be reviewed
          with a healthcare professional. Always follow your doctor or pharmacist's instructions and report any
          side effects or concerns.
        </p>
      </div>
    </div>
  );
};
