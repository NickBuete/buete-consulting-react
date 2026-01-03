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
import { PrintableDoseSchedule } from "./PrintableDoseSchedule";

interface ScheduleEntry {
  time: string;
  medication: string;
  dose: string;
}

export const DoseScheduler: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [paracetamolFirstDose, setParacetamolFirstDose] = useState("08:00");
  const [ibuprofenFirstDose, setIbuprofenFirstDose] = useState("08:00");

  const schedule = useMemo((): ScheduleEntry[] => {
    const weightValue = Number(weight);

    if (!weightValue || weightValue <= 0) {
      return [];
    }

    // Calculate doses
    const paracetamolDose = Math.min(weightValue * 15, 1000);
    const ibuprofenDose = Math.min(weightValue * 10, 400);

    const entries: ScheduleEntry[] = [];

    // Helper function to add hours to time
    const addHours = (timeStr: string, hoursToAdd: number): string => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        return timeStr;
      }
      let newHour = (hours + hoursToAdd) % 24;
      return `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    // Paracetamol: 4 doses at 4-hour intervals
    if (paracetamolFirstDose) {
      for (let i = 0; i < 4; i++) {
        const time = addHours(paracetamolFirstDose, i * 4);
        entries.push({
          time,
          medication: 'Paracetamol',
          dose: `${Math.round(paracetamolDose)} mg`,
        });
      }
    }

    // Ibuprofen: 3 doses at 6-hour intervals
    if (ibuprofenFirstDose) {
      for (let i = 0; i < 3; i++) {
        const time = addHours(ibuprofenFirstDose, i * 6);
        entries.push({
          time,
          medication: 'Ibuprofen',
          dose: `${Math.round(ibuprofenDose)} mg`,
        });
      }
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
  }, [weight, paracetamolFirstDose, ibuprofenFirstDose]);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the printable schedule HTML
    const printContent = document.getElementById('printable-dose-schedule');
    if (!printContent) return;

    // Write the HTML with styles
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medication Schedule - ${childName || 'Patient'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .print-only {
              display: block;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 2px solid #000;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .text-center {
              text-align: center;
            }
            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <>
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
          <Label htmlFor="scheduler-child-name">Child's Name</Label>
          <Input
            id="scheduler-child-name"
            type="text"
            placeholder="e.g., Sarah"
            value={childName}
            onChange={(event) => setChildName(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduler-child-age">Age (years)</Label>
          <Input
            id="scheduler-child-age"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 5"
            value={childAge}
            onChange={(event) => setChildAge(event.target.value)}
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paracetamol-first-dose">Paracetamol First Dose Time</Label>
            <Input
              id="paracetamol-first-dose"
              type="time"
              value={paracetamolFirstDose}
              onChange={(event) => setParacetamolFirstDose(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ibuprofen-first-dose">Ibuprofen First Dose Time</Label>
            <Input
              id="ibuprofen-first-dose"
              type="time"
              value={ibuprofenFirstDose}
              onChange={(event) => setIbuprofenFirstDose(event.target.value)}
            />
          </div>
        </div>

        {schedule.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500 font-body">
              Enter weight and first dose times to generate schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-white p-4 space-y-3" id="dose-schedule">
              <div className="text-center space-y-1 print:block">
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  Medication Schedule
                </h3>
                {childName && (
                  <p className="text-sm text-gray-600 font-semibold">{childName}</p>
                )}
                <p className="text-sm text-gray-600">
                  {childAge && `Age: ${childAge} years | `}Weight: {weight} kg
                </p>
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
              className="w-full"
            >
              Print Schedule
            </Button>

            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="font-semibold mb-1">Safety Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Paracetamol: Maximum 4 doses per day (max 1g per dose, 4g per day)</li>
                <li>Ibuprofen: Maximum 3 doses per day (max 400mg per dose)</li>
                <li>This is a guide only - verify all doses with AMH Children's Dosing Companion</li>
                <li>Adjust schedule based on child's response and clinical assessment</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Hidden printable version */}
    <div id="printable-dose-schedule" style={{ display: 'none' }}>
      <PrintableDoseSchedule
        childName={childName}
        childAge={childAge}
        weight={weight}
        schedule={schedule}
      />
    </div>
    </>
  );
};
