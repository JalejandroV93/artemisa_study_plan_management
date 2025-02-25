"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DynamicArrayInput } from "@/components/ui/DynamicArrayInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useFieldArray } from "react-hook-form";

// Esquema de un Benchmark
export const benchmarkSchema = z.object({
    description: z.string().min(1, "La descripción del benchmark es requerida"),
    learningEvidence: z.array(z.string()).optional(),
    thematicComponents: z.array(z.string()).optional(),
});

// Esquema del formulario de Trimester
export const trimesterFormSchema = z.object({
    benchmarks: z.array(benchmarkSchema).optional(),
});

interface TrimesterFormProps {
    trimesterNumber: number;
    gradeId: string;
}

export function TrimesterForm({ trimesterNumber, gradeId }: TrimesterFormProps) {
    const { control } = useFormContext();
    const fieldName = `gradeOfferings.${gradeId}.trimesters.${trimesterNumber}`;

    // Usar useFieldArray para manejar el arreglo de benchmarks
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${fieldName}.benchmarks`,
    });

    return (
        <div className="space-y-4">
            <h4 className="font-medium">Trimestre {trimesterNumber}</h4>
            {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded space-y-4">
                    {/* Campo para la descripción del benchmark */}
                    <FormField
                        control={control}
                        name={`${fieldName}.benchmarks.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción del Benchmark</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ingresa la descripción" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Campo para learningEvidence */}
                    <FormField
                        control={control}
                        name={`${fieldName}.benchmarks.${index}.learningEvidence`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Evidencias de Aprendizaje</FormLabel>
                                <FormControl>
                                    <DynamicArrayInput
                                        values={field.value || []}
                                        onChange={(newValues) => field.onChange(newValues)}
                                        placeholder="Añade una evidencia de aprendizaje..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Campo para thematicComponents */}
                    <FormField
                        control={control}
                        name={`${fieldName}.benchmarks.${index}.thematicComponents`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Componentes Temáticos</FormLabel>
                                <FormControl>
                                    <DynamicArrayInput
                                        values={field.value || []}
                                        onChange={(newValues) => field.onChange(newValues)}
                                        placeholder="Añade un componente..."
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                    >
                        Eliminar Benchmark
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                onClick={() =>
                    append({
                        description: "",
                        learningEvidence: [],
                        thematicComponents: [],
                    })
                }
            >
                Agregar Benchmark
            </Button>
        </div>
    );
}