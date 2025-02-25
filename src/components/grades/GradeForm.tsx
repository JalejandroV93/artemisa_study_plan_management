/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/grades/GradeForm.tsx
"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Grade, Section } from "@prisma/client";
import { useToast } from "@/hooks/use-toast"

const createGradeSchema = z.object({
    name: z.string().min(1).max(255),
    colombianGrade: z.number().int().min(1).max(11),
    sectionId: z.string().uuid(),
});

// Important: Separate schemas for create and update.  This is best practice.
const updateGradeSchema = z.object({
  name: z.string().min(1).max(255).optional(),  // Now optional
  colombianGrade: z.number().int().min(1).max(11).optional(), // Now optional
  sectionId: z.string().uuid().optional(), // Now optional
});


type CreateGradeFormValues = z.infer<typeof createGradeSchema>;
type UpdateGradeFormValues = z.infer<typeof updateGradeSchema>; // Type for update

interface GradeFormProps {
  grade?: Grade | null;
  onClose: () => void;
  onSuccess: () => void;
  sections: Section[]; // Receive sections as a prop
}

export function GradeForm({ grade, onClose, onSuccess, sections }: GradeFormProps) {
  const { toast } = useToast();

  // Use the correct form type based on whether it's an update or create.
  const form = useForm<CreateGradeFormValues | UpdateGradeFormValues>({
    resolver: zodResolver(grade ? updateGradeSchema : createGradeSchema), //  Correct schema
    defaultValues: grade
        ? {
            name: grade.name,
            colombianGrade: grade.colombianGrade ?? undefined, // Convert null to undefined when necessary
            sectionId: grade.sectionId,
          }
        : {
            name: "",
            colombianGrade: undefined, // Use undefined for default number values.
            sectionId: "",
          },
  });

  async function onSubmit(values: CreateGradeFormValues | UpdateGradeFormValues) {
    try {
      // Crucial: Convert to number before sending!
      const dataToSubmit = grade ? values : { // Conditional data based on create/update
        ...values,
        colombianGrade: Number(values.colombianGrade), // Explicit conversion!
      }

      const response = await fetch(grade ? `/api/v1/grades/${grade.id}` : '/api/v1/grades', {
        method: grade ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit), // Send the correctly typed data.
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Improved error handling with Zod.
        if (response.status === 400 && errorData.error) {
            form.setError("root", { message: "Error en los datos enviados."})
            return;
        }  else {
          throw new Error(
            errorData.error ||
              (grade ? "Failed to update grade" : "Failed to create grade")
          );
        }
      }

      onSuccess();
      onClose();
      toast({
        description: grade
          ? "Grade updated successfully"
          : "Grade created successfully",
      });

    } catch (error: any) {
        console.log(error)
      toast({
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Grado</FormLabel>
              <FormControl>
                <Input placeholder="e.j., Noveno, Décimo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="colombianGrade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equivalente en Colombia</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.j., 9, 10"
                  value={field.value === undefined ? '' : String(field.value)} // Handle undefined
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sección</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una Sección" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{grade ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
    </Form>
  );
}