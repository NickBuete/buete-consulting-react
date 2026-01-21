import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "../ui";

type BMICategory = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

const getBMICategory = (bmi: number): BMICategory => {
  if (bmi < 18.5) {
    return {
      label: "Underweight",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    };
  }
  if (bmi < 25) {
    return {
      label: "Healthy weight",
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    };
  }
  if (bmi < 30) {
    return {
      label: "Overweight",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    };
  }
  if (bmi < 35) {
    return {
      label: "Obese class I",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    };
  }
  if (bmi < 40) {
    return {
      label: "Obese class II",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    };
  }
  return {
    label: "Obese class III",
    color: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
  };
};

export const BMICalculator: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const result = useMemo(() => {
    const weightValue = Number(weight);
    const heightValue = Number(height);

    if (!weightValue || !heightValue || weightValue <= 0 || heightValue <= 0) {
      return null;
    }

    // BMI = weight (kg) / height (m)²
    const heightInMeters = heightValue / 100;
    const bmi = weightValue / (heightInMeters * heightInMeters);

    return {
      bmi: bmi.toFixed(1),
      category: getBMICategory(bmi),
    };
  }, [weight, height]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">⚖️</span>
          BMI Calculator
        </CardTitle>
        <CardDescription className="font-body">
          Calculate Body Mass Index using metric units (kg and cm) as standard in Australia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bmi-weight">Weight (kg)</Label>
            <Input
              id="bmi-weight"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g., 70"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmi-height">Height (cm)</Label>
            <Input
              id="bmi-height"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g., 170"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-2">
          <p className="font-heading text-sm text-gray-600">Body Mass Index</p>
          {result === null ? (
            <p className="text-sm text-gray-500 font-body">Enter weight and height to calculate BMI.</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">{result.bmi} kg/m²</p>
              <p className={`text-sm font-semibold ${result.category.color}`}>
                {result.category.label}
              </p>
              <p className="text-xs text-gray-600 font-body">
                Formula: BMI = weight (kg) ÷ height (m)²
              </p>
            </>
          )}
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
          <p className="font-heading text-sm text-gray-700 mb-2">BMI Categories (WHO)</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-body">
            <div className="flex justify-between">
              <span className="text-blue-700">Underweight</span>
              <span className="text-gray-600">&lt; 18.5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Healthy</span>
              <span className="text-gray-600">18.5 – 24.9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-700">Overweight</span>
              <span className="text-gray-600">25 – 29.9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-700">Obese I</span>
              <span className="text-gray-600">30 – 34.9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Obese II</span>
              <span className="text-gray-600">35 – 39.9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-700">Obese III</span>
              <span className="text-gray-600">≥ 40</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="font-semibold mb-1">Clinical Note:</p>
          <p>
            BMI is a screening tool and does not directly measure body fat or health.
            Consider waist circumference, muscle mass, ethnicity, and other clinical factors when assessing weight-related health risks.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
