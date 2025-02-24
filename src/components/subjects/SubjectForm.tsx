
// src/components/subjects/SubjectForm.tsx

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
import { Textarea } from "@/components/ui/textarea";  // Import Textarea
import { Subject } from "@prisma/client";
import { useToast } from "@/hooks/use-toast"

const createSubjectSchema = z.object({
    name: z.string().min(1, "Subject name is required"),
    vision: z.string().optional(),
    mission: z.string().optional(),
    generalObjective: z.string().optional(),
    specificObjectives: z.array(z.string()).optional(), // Array of strings
    didactics: z.string().optional(),
    crossCuttingProjects: z.array(z.string()).optional(),  // Array of strings
    isActive: z.boolean().optional(), // You might want a default in the schema itself.
});

const updateSubjectSchema = createSubjectSchema.partial(); // All fields optional for updates

type CreateFormValues = z.infer<typeof createSubjectSchema>;
type UpdateFormValues = z.infer<typeof updateSubjectSchema>;

interface SubjectFormProps {
    subject?: Subject | null;
    onClose: () => void;
}

export function SubjectForm({ subject, onClose }: SubjectFormProps) {
    const { toast } = useToast();
    const form = useForm<CreateFormValues | UpdateFormValues>({
        resolver: zodResolver(subject ? updateSubjectSchema : createSubjectSchema),
        defaultValues: subject
            ? { ...subject, specificObjectives: subject.specificObjectives || [], crossCuttingProjects: subject.crossCuttingProjects || []} // Ensure arrays
            : { name: "" }, // Default for create mode
    });

    async function onSubmit(values: CreateFormValues | UpdateFormValues) {
        try {
            const response = await fetch(
                subject ? `/api/v1/subjects/${subject.id}` : "/api/v1/subjects",
                {
                    method: subject ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                 if (response.status === 400 && errorData.error) {
                    form.setError("root", { message: "Error en los datos enviados."})
                    return;
                }  else {
                    throw new Error(errorData.error || (subject ? "Failed to update subject" : "Failed to create subject"));
                }
            }

            // Success handling
            toast({
                title: "Success",
                description: subject ? "Subject updated!" : "Subject created!",
            });
            onClose(); // Close the form (or navigate)
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "An unexpected error occurred.",
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
                        <FormLabel>Subject Name</FormLabel>
                        <FormControl>
                        <Input placeholder="Subject name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
                    name="generalObjective"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>General Objective</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Enter General Objective" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="specificObjectives"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Specific Objectives</FormLabel>
                             <FormControl>
                                <Textarea
                                    placeholder="Enter specific objectives separated by commas"
                                    value={field.value ? (Array.isArray(field.value) ? field.value.join(', ') : String(field.value)) : ''}
                                    onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                    />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
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
                <FormField
                    control={form.control}
                    name="crossCuttingProjects"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cross Cutting Projects</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Enter cross-cutting projects separated by commas"
                                value={field.value ? (Array.isArray(field.value) ? field.value.join(', ') : String(field.value)): ''}
                                onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 {subject && ( // Conditionally render isActive field
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Active</FormLabel>
                            <FormControl>
                            <input
                                type="checkbox"
                                checked={field.value ?? false} // Handle potential undefined
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="mr-2"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">{subject ? "Update" : "Create"}</Button>
                </div>
            </form>
        </Form>
    );
}