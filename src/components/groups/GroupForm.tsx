// src/components/groups/GroupForm.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input" // ADDED
import { Group } from "@prisma/client";
import { useToast } from "@/hooks/use-toast"

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(10, "Group name must be less than 10 characters"), // Added String Validation
  gradeId: z.string().uuid(),
});

const updateGroupSchema = z.object({ // Seperate schema for update
    name: z.string().min(1, "Group name is required").max(10, "Group name must be less than 10 characters").optional(),
    gradeId: z.string().uuid().optional(), // Keep gradeId
})

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;
type UpdateGroupFormValues = z.infer<typeof updateGroupSchema>


interface GroupFormProps {
  group?: Group | null;
  onClose: () => void;
  onSuccess: () => void;
  grades: { id: string, name: string, section: { name: string } }[]; //for the select dropdown
}

export function GroupForm({ group, onClose, onSuccess, grades }: GroupFormProps) {
  const { toast } = useToast();

  // Important: Use correct form type based on create/update
  const form = useForm<CreateGroupFormValues | UpdateGroupFormValues>({
    resolver: zodResolver(group ? updateGroupSchema : createGroupSchema),  // Choose schema
    defaultValues: group
      ? { name: group.name ?? "", gradeId: group.gradeId }
      : { name: "", gradeId: "" }, // Default to ""
  });

  async function onSubmit(values: CreateGroupFormValues | UpdateGroupFormValues) {
    try {
      const response = await fetch(group ? `/api/v1/groups/${group.id}` : '/api/v1/groups', {
        method: group ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
          if (response.status === 400 && errorData.error) {
            form.setError("root", { message: "Error en los datos enviados."}) //Form Validation Errors
            return;
          }  else {
            throw new Error(
              errorData.error ||
              (group ? "Failed to update group" : "Failed to create group")
            );
          }
      }

      onSuccess();
      onClose();
      toast({
        description: group ? 'Group updated successfully' : 'Group created successfully',
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          name="gradeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a grade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name} ({grade.section.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name (e.g., A, B, C)" {...field} /> {/* Use Input */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{group ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
}