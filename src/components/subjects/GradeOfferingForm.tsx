// src/components/subjects/GradeOfferingForm.tsx
"use client"

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { TrimesterForm, trimesterFormSchema } from "./TrimesterForm"; // Import TrimesterForm
import { Grade,  TrimesterSettings } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { z } from "zod";

// Define a schema for a single GradeOffering
export const gradeOfferingSchema = z.object({ // Export this
    finalReport: z.string().optional(),
    trimesters: z.record(z.string(), trimesterFormSchema), // Key is trimester number, value is TrimesterForm data.
  });


interface GradeOfferingFormProps {
  grade: Grade;
  trimesterSettings: TrimesterSettings[]; // Add trimesterSettings prop
}

export function GradeOfferingForm({ grade, trimesterSettings }: GradeOfferingFormProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { control } = useFormContext<any>(); // Replace 'any' later.
    return (
      <Accordion type="multiple" defaultValue={[grade.id]} className="w-full">
          <AccordionItem  value={grade.id}>
            <AccordionTrigger>
              {grade.name}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <FormField
                  control={control}
                  name={`gradeOfferings.${grade.id}.finalReport`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Report</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter final report" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {trimesterSettings.map((trimesterSetting) => (
                  <TrimesterForm
                    key={trimesterSetting.number}
                    trimesterNumber={trimesterSetting.number}
                    gradeId={grade.id}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
      </Accordion>
    );
}