// src/components/subjects/GeneralInformationForm.tsx


"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { SubjectFormValues } from "./FormSchemas";

export function GeneralInformationForm() {
  const { control, watch, setValue } = useFormContext<SubjectFormValues>(); // Correct type
  const specificObjectives = watch("specificObjectives") || [];

  return (
    // ... (rest of your GeneralInformationForm code, unchanged.  Use the correct context type!)
     <div className="space-y-6">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Asignatura</FormLabel>
            <FormControl>
              <Input placeholder="Ingrese el nombre de la asignatura" {...field} />
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
            <FormLabel>Visión</FormLabel>
            <FormControl>
              <Textarea placeholder="Ingrese la visión" {...field} />
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
            <FormLabel>Misión</FormLabel>
            <FormControl>
              <Textarea placeholder="Ingrese la misión" {...field} />
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
            <FormLabel>Objetivo General</FormLabel>
            <FormControl>
              <Textarea placeholder="Ingrese el objetivo general" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel>Objetivos Específicos</FormLabel>
        {specificObjectives.map((_, index) => (
          <FormField
            key={index}
            control={control}
            name={`specificObjectives.${index}`}
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 mt-2">
                <FormControl>
                  <Input placeholder={`Objetivo específico ${index + 1}`} {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newObjectives = [...specificObjectives];
                    newObjectives.splice(index, 1);
                    setValue("specificObjectives", newObjectives); // Use setValue
                  }}
                >
                  <Minus className="h-4 w-4" />
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
            setValue("specificObjectives", [...specificObjectives, ""]); // Use setValue
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Objetivo Específico
        </Button>
      </div>

      <FormField
        control={control}
        name="didactics"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Didáctica</FormLabel>
            <FormControl>
              <Textarea placeholder="Ingrese la didáctica" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="crossCuttingProjects"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proyectos Transversales</FormLabel>
            <FormControl>
            <Input
                  placeholder="Ingrese los proyectos transversales"
                  {...field}
                  // Ensure the field value is always an array of strings
                  value={field.value ? field.value.join(',') : ''}
                  onChange={(e) => field.onChange(e.target.value.split(','))}
                />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}