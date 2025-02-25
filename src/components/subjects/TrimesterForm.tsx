// src/components/subjects/TrimesterForm.tsx
"use client"

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DynamicArrayInput } from "@/components/ui/DynamicArrayInput";
import { z } from "zod";

// Define the Zod schema for a single Benchmark:
const benchmarkSchema = z.object({
    description: z.string().min(1, "Benchmark description is required"),
    learningEvidence: z.array(z.string()).optional(), // Assuming an array of strings
    thematicComponents: z.array(z.string()).optional(),
});

// Define the Zod schema for the entire Trimester form.  This is used within the *GradeOfferingForm*.
export const trimesterFormSchema = z.object({ // Export this for use in GradeOfferingForm
    benchmarks: z.array(benchmarkSchema).optional(),
});

// Removed unused type TrimesterFormValues

interface TrimesterFormProps {
  trimesterNumber: number;
  gradeId: string; // Add gradeId prop
}


export function TrimesterForm({ trimesterNumber, gradeId }: TrimesterFormProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useFormContext<any>(); // Using 'any' temporarily, will be replaced with a more specific type later.
  const fieldName = `gradeOfferings.${gradeId}.trimesters.${trimesterNumber}`;

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Trimester {trimesterNumber}</h4>

        <FormField
            control={control}
            name={`${fieldName}.benchmarks`}
            render={({ field }) => (
                <FormItem>
                <FormLabel>Benchmark</FormLabel>
                <FormControl>
                    <DynamicArrayInput
                        values={field.value || []}
                        onChange={(newValues) => field.onChange(newValues)}
                        placeholder="Add a learning evidence..."
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={control}
            name={`${fieldName}.learningEvidence`}
            render={({ field }) => (
                <FormItem>
                    <DynamicArrayInput
                        values={field.value || []}
                        onChange={(newValues) => field.onChange(newValues)}
                        label="Learning Evidence"
                        placeholder="Add learning evidence..."
                    />
                <FormMessage />
                </FormItem>

            )}
        />

        <FormField
            control={control}
            name={`${fieldName}.thematicComponents`}
            render={({ field }) => (
                <FormItem>
                  <DynamicArrayInput
                      values={field.value || []}
                      onChange={(newValues) => field.onChange(newValues)}
                      label="Thematic Components"
                      placeholder="Add component..."
                  />
                <FormMessage />
                </FormItem>
            )}
        />
    </div>
  );
}