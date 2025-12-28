import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui";

export const UnitConverter: React.FC = () => {
  const [conversion, setConversion] = useState("mgml-to-percent");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    const value = Number(input);
    if (!value && value !== 0) {
      return "";
    }

    switch (conversion) {
      case "mgml-to-percent":
        return `${(value / 10).toFixed(4)} % w/v`;
      case "percent-to-mgml":
        return `${(value * 10).toFixed(3)} mg/mL`;
      case "mg-to-mcg":
        return `${(value * 1000).toFixed(0)} mcg`;
      case "mcg-to-mg":
        return `${(value / 1000).toFixed(3)} mg`;
      case "c-to-f":
        return `${(value * 9) / 5 + 32} °F`;
      case "f-to-c":
        return `${((value - 32) * 5) / 9} °C`;
      default:
        return "";
    }
  }, [conversion, input]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          Unit & Concentration Converter
        </CardTitle>
        <CardDescription className="font-body">
          Quick conversions between common pharmaceutical units, concentrations, and temperatures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="conversion">Conversion type</Label>
          <Select value={conversion} onValueChange={setConversion}>
            <SelectTrigger id="conversion">
              <SelectValue placeholder="Select conversion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mgml-to-percent">mg/mL → % w/v</SelectItem>
              <SelectItem value="percent-to-mgml">% w/v → mg/mL</SelectItem>
              <SelectItem value="mg-to-mcg">mg → mcg</SelectItem>
              <SelectItem value="mcg-to-mg">mcg → mg</SelectItem>
              <SelectItem value="c-to-f">°C → °F</SelectItem>
              <SelectItem value="f-to-c">°F → °C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="conversion-input">Value</Label>
          <Input
            id="conversion-input"
            type="number"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <p className="font-heading text-sm text-gray-600">Converted value</p>
          {output ? (
            <p className="text-lg font-semibold text-gray-900">{output}</p>
          ) : (
            <p className="text-sm text-gray-500 font-body">Enter a numeric value to see the conversion.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
