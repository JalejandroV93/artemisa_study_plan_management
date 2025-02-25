/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/subjects/TrimesterForm.tsx
"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DynamicArrayInput } from "./DynamicArrayInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubjectFormValues, UpdateSubjectFormValues } from "./FormSchemas"; // Import
import { useFieldArray } from "react-hook-form"; // Import useFieldArray

type FormValues = SubjectFormValues | UpdateSubjectFormValues;

interface TrimesterFormProps {
  trimesterNumber: number;
  gradeId: string;
}

interface Trimester {
    number: number;
    // add other properties if needed
}

interface GradeOffering {
    trimesters?: Trimester[];
}


export function TrimesterForm({ trimesterNumber, gradeId }: TrimesterFormProps) {
    const { control, getValues } = useFormContext<FormValues>();
    const values = getValues();
    const gradeOffering = (values.gradeOfferings as Record<string, any> | undefined)?.[gradeId];
    

    const trimesterIndex: number = (gradeOffering as GradeOffering | undefined)
        ?.trimesters?.findIndex((t: Trimester) => t.number === trimesterNumber) ?? -1;
  // Construct the field name for this specific trimester.
  const fieldName = `gradeOfferings.${gradeId}.trimesters.${trimesterIndex !== -1 ? trimesterIndex : trimesterNumber - 1}`;

  // Use useFieldArray to manage the benchmarks.
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${fieldName}.benchmarks` as any, // Correct name!
  });
    React.useEffect(() => {
      if (!fields.length) {
          append({ description: "", learningEvidence: [], thematicComponents: [] })
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields])


  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-medium">Trimester {trimesterNumber}</h4>
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded p-4 space-y-4">
            <FormField
              control={control}
              name={`${fieldName}.benchmarks.${index}.description` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benchmark</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter benchmark" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={control}
                name={`${fieldName}.benchmarks.${index}.learningEvidence` as any}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Learning Evidence</FormLabel>
                        <FormControl>
                        <DynamicArrayInput
                            values={field.value || []} // Ensure it's always an array
                            onChange={(newValues) => field.onChange(newValues)}
                            placeholder="Add learning evidence..."
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                 )}
              />

            <FormField
              control={control}
              name={`${fieldName}.benchmarks.${index}.thematicComponents` as any}
              render={({ field }) => (
               <FormItem>
                  <FormLabel>Thematic Components</FormLabel>
                  <FormControl>
                    <DynamicArrayInput
                      values={field.value || []}  // Ensure it's always an array
                      onChange={(newValues) => field.onChange(newValues)}
                      placeholder="Add thematic component..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => remove(index)}
            >
              Remove Benchmark
            </Button>
          </div>
        ))}
      <Button type="button" variant="outline" onClick={() => append({ description: "", learningEvidence: [], thematicComponents: [] })}>
        Add Benchmark
      </Button>
    </div>
  );
}