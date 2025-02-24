// src/components/ui/DynamicArrayInput.tsx
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface DynamicArrayInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?:string;
}

export function DynamicArrayInput({ values, onChange, placeholder = "Enter item", label }: DynamicArrayInputProps) {
  return (
    <div>
      {label && (<label className="block text-sm font-medium text-gray-700">{label}</label>)}
      <div className="mt-1">
        {values.map((value, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              value={value}
              onChange={(e) => {
                const newValues = [...values];
                newValues[index] = e.target.value;
                onChange(newValues);
              }}
              placeholder={placeholder}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                const newValues = [...values];
                newValues.splice(index, 1);
                onChange(newValues);
              }}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...values, ""])}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  );
}