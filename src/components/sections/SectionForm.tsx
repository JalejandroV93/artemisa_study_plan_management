/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/sections/SectionForm.tsx
"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Section } from "@prisma/client";
import { useToast } from "@/hooks/use-toast"

const createSectionSchema = z.object({
  name: z.string().min(1).max(255),
});

type SectionFormValues = z.infer<typeof createSectionSchema>;

interface SectionFormProps {
  section?: Section | null;
  onClose: () => void;
  onSuccess: () => void;
}


export function SectionForm({ section, onClose, onSuccess }: SectionFormProps) {
    const { toast } = useToast();
  const form = useForm<SectionFormValues>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: section
      ? { name: section.name }
      : { name: "" },
  });

  async function onSubmit(values: SectionFormValues) {
    try {
      const response = await fetch(section ? `/api/v1/sections/${section.id}` : '/api/v1/sections', {
        method: section ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (section ? "Failed to update section" : "Failed to create section"));
      }

      onSuccess();
      onClose();
      toast({
        description: section ? 'Section updated successfully' : 'Section created successfully',
      });

    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive"
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
              <FormLabel>Section Name</FormLabel>
              <FormControl>
                <Input placeholder="Section Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{section ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
}