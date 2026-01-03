import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
} from "../ui";

interface ScheduleEntry {
  time: string;
  medication: string;
  dose: string;
}

export const DoseScheduler: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [firstDoseTime, setFirstDoseTime] = useState("08:00");

  const schedule = useMemo((): ScheduleEntry[] => {
    const weightValue = Number(weight);

    if (!weightValue || weightValue <= 0 || !firstDoseTime) {
      return [];
    }

    // Calculate doses
    const paracetamolDose = Math.min(weightValue * 15, 1000);
    const ibuprofenDose = Math.min(weightValue * 10, 400);

    // Parse first dose time
    const [hours, minutes] = firstDoseTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return [];
    }

    const entries: ScheduleEntry[] = [];

    // Helper function to add hours to time
    const addHours = (hour: number, minute: number, hoursToAdd: number): string => {
      let newHour = (hour + hoursToAdd) % 24;
      return `${String(newHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    // Paracetamol: 4 doses at 4-hour intervals
    for (let i = 0; i < 4; i++) {
      const time = addHours(hours, minutes, i * 4);
      entries.push({
        time,
        medication: 'Paracetamol',
        dose: `${Math.round(paracetamolDose)} mg`,
      });
    }

    // Ibuprofen: 3 doses at 6-hour intervals
    for (let i = 0; i < 3; i++) {
      const time = addHours(hours, minutes, i * 6);
      entries.push({
        time,
        medication: 'Ibuprofen',
        dose: `${Math.round(ibuprofenDose)} mg`,
      });
    }

    // Sort by time
    return entries.sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });
  }, [weight, firstDoseTime]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">📅</span>
          Daily Dose Scheduler
        </CardTitle>
        <CardDescription className="font-body">
          Generate a printable medication schedule for paracetamol and ibuprofen dosing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scheduler-weight">Weight (kg)</Label>
          <Input
            id="scheduler-weight"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g., 15"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="first-dose-time">First Dose Time</Label>
          <Input
            id="first-dose-time"
            type="time"
            value={firstDoseTime}
            onChange={(event) => setFirstDoseTime(event.target.value)}
          />
        </div>

        {schedule.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500 font-body">
              Enter weight and first dose time to generate schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-white p-4 space-y-3" id="dose-schedule">
              <div className="text-center space-y-1 print:block">
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  Medication Schedule
                </h3>
                <p className="text-sm text-gray-600">Weight: {weight} kg</p>
                <p className="text-xs text-gray-500">
                  Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="border-t pt-3">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-3 font-heading text-sm font-semibold text-gray-700">
                        Time
                      </th>
                      <th className="text-left py-2 px-3 font-heading text-sm font-semibold text-gray-700">
                        Medication
                      </th>
                      <th className="text-left py-2 px-3 font-heading text-sm font-semibold text-gray-700">
                        Dose
                      </th>
                      <th className="text-center py-2 px-3 font-heading text-sm font-semibold text-gray-700 print:table-cell">
                        Given ✓
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 px-3 font-mono text-sm font-semibold">
                          {entry.time}
                        </td>
                        <td className="py-3 px-3 text-sm">
                          {entry.medication}
                        </td>
                        <td className="py-3 px-3 text-sm font-semibold text-brand-600">
                          {entry.dose}
                        </td>
                        <td className="py-3 px-3 text-center print:table-cell">
                          <div className="w-6 h-6 border-2 border-gray-400 rounded inline-block"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-3 mt-3 text-xs text-gray-600 space-y-1">
                <p className="font-semibold">Important Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check product concentration before administering each dose</li>
                  <li>Mark the "Given" box after administering each dose</li>
                  <li>Do not exceed maximum daily doses</li>
                  <li>Give ibuprofen with food to minimize stomach upset</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handlePrint}
              className="w-full print:hidden"
            >
              🖨️ Print Schedule
            </Button>

            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 print:hidden">
              <p className="font-semibold mb-1">⚠️ Safety Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Paracetamol: Maximum 4 doses per day (max 1g per dose, 4g per day)</li>
                <li>Ibuprofen: Maximum 3 doses per day (max 400mg per dose)</li>
                <li>This is a guide only - verify all doses with AMH Children's Dosing Companion</li>
                <li>Adjust schedule based on child's response and clinical assessment</li>
              </ul>
            </div>
          </div>
        )}

        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              #dose-schedule, #dose-schedule * {
                visibility: visible;
              }
              #dose-schedule {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 2rem;
              }
              .print\\:hidden {
                display: none !important;
              }
              .print\\:block {
                display: block !important;
              }
              .print\\:table-cell {
                display: table-cell !important;
              }
            }
          `}
        </style>
      </CardContent>
    </Card>
  );
};
