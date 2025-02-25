// src/components/subjects/GeneralInformationForm.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react"; // More descriptive icons
import { SubjectFormValues, UpdateSubjectFormValues } from "./FormSchemas"; // Correct type

type FormValues = SubjectFormValues | UpdateSubjectFormValues;

export function GeneralInformationForm() {
  const { control, watch, setValue } = useFormContext<FormValues>(); // Correct type
  const specificObjectives = watch("specificObjectives");

  return (
    <div className="space-y-6">
      {/* ... (rest of your input fields, unchanged) ... */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter subject name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="vision"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vision</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter vision" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="mission"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mission</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter mission" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="generalObjective"
        render={({ field }) => (
          <FormItem>
            <FormLabel>General Objective</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter general objective" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Specific Objectives</FormLabel>
        {specificObjectives?.map((_, index) => (
          <FormField
            key={index}
            control={control}
            name={`specificObjectives.${index}`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 mt-2">
                <FormControl>
                  <Input placeholder={`Specific objective ${index + 1}`} {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newObjectives = [...specificObjectives];
                    newObjectives.splice(index, 1);
                    setValue("specificObjectives", newObjectives);
                  }}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </FormItem>
            )}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => {
            setValue("specificObjectives", [...(specificObjectives || []), ""]);
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Specific Objective
        </Button>
      </div>

      <FormField
        control={control}
        name="didactics"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Didactics</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter didactics" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
        </div>
  );
}