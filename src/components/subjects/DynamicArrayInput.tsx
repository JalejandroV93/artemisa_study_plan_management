// src/components/ui/DynamicArrayInput.tsx

"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, MinusCircle } from "lucide-react"; // More descriptive icons
import React from "react";

interface DynamicArrayInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string; // Optional label prop
}

export function DynamicArrayInput({ values, onChange, placeholder = "Enter item", label }: DynamicArrayInputProps) {
    const [localValues, setLocalValues] = React.useState(values || []);  // Local State

    // Keep local state in sync with prop changes
    React.useEffect(() => {
        setLocalValues(values || []);
    }, [values]);

    const handleInputChange = (index: number, newValue: string) => {
        const updatedValues = [...localValues];
        updatedValues[index] = newValue;
        setLocalValues(updatedValues)  // Update local state *first*
        onChange(updatedValues); // Then, notify parent
    };

    const handleAdd = () => {
        const updatedValues = [...localValues, ""];
        setLocalValues(updatedValues)
        onChange(updatedValues); // Notify parent
    };

    const handleRemove = (index: number) => {
        const updatedValues = [...localValues];
        updatedValues.splice(index, 1);
        setLocalValues(updatedValues)
        onChange(updatedValues); // Notify parent
    };


  return (
    <div>
      {label && (<label className="block text-sm font-medium text-gray-700">{label}</label>)}
      <div className="mt-1">
        {localValues.map((value, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder={placeholder}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemove(index)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
}