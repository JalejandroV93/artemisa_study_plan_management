// src/components/academic-years/AcademicYearForm.tsx
"use client";

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
    AcademicCalendarSettings,
    TrimesterSettings,
} from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea


// Reuse the Zod schemas from your API routes
const createAcademicYearSchema = z.object({
  academicYear: z.string().min(4).max(9), // e.g., "2024-2025"
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  trimesters: z.array(
    z.object({
      number: z.number().int().min(1).max(4),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
    })
  ).min(1),
});

const updateAcademicYearSchema = createAcademicYearSchema.partial();

type CreateAcademicYearFormValues = z.infer<typeof createAcademicYearSchema>;
type UpdateAcademicYearFormValues = z.infer<typeof updateAcademicYearSchema>;
type FormValues = CreateAcademicYearFormValues | UpdateAcademicYearFormValues;

interface AcademicYearFormProps {
  academicYear?: AcademicCalendarSettings & { trimesters: TrimesterSettings[] } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AcademicYearForm({ academicYear, onClose, onSuccess }: AcademicYearFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(academicYear ? updateAcademicYearSchema : createAcademicYearSchema),
    defaultValues: academicYear
      ? {
          academicYear: academicYear.academicYear,
          startDate: academicYear.startDate, // No toLocaleDateString()
          endDate: academicYear.endDate,
          trimesters: academicYear.trimesters.map((t) => ({
            number: t.number,
            startDate: t.startDate,  // No toLocaleDateString()
            endDate: t.endDate,
          })),
        }
      : {
          academicYear: "",
          startDate: undefined, // Use undefined for default date values
          endDate: undefined,
          trimesters: [],
      },
  });

    // Add a function to add a new trimester to the form
    const addTrimester = () => {
        const nextNumber = (form.getValues("trimesters")?.length ?? 0) + 1;
        if (nextNumber > 4) {  // Limit to 4 trimesters
            toast({
                title: "Limit Reached",
                description: "You can only add up to 4 trimesters.",
                variant: "destructive"
            });
            return;
        }
        form.setValue("trimesters", [
            ...(form.getValues("trimesters") || []),
            { number: nextNumber, startDate: new Date(), endDate: new Date() }, // Inicializa con fechas válidas
        ]);
    };

    // Remove a trimester
    const removeTrimester = (index: number) => {
      const currentTrimesters = form.getValues("trimesters") || [];
      if (currentTrimesters.length > 1) {  // Keep at least one
          currentTrimesters.splice(index, 1);
          //Re-assign numbers to maintain the correct index
          const updatedTrimesters = currentTrimesters.map((trimester, index) => ({
            ...trimester,
            number: index + 1,
          }));

          form.setValue("trimesters", updatedTrimesters);

      }else{
        toast({
            title: "Trimester Required",
            description: "At least one trimester is required",
            variant: "destructive"
        });
      }
    };



  async function onSubmit(values: FormValues) {
    try {
      // Check trimester dates (this is your existing validation logic)
       if (values.trimesters) {
        for (let i = 0; i < values.trimesters.length; i++) {
          const trimester = values.trimesters[i];
          if (trimester.startDate >= trimester.endDate) {
            toast({
              title: "Invalid Dates",
              description: `Trimester ${trimester.number} end date must be after start date.`,
              variant: "destructive"
            });
            return;
          }
          // Check for overlaps with other trimesters
          for (let j = 0; j < values.trimesters.length; j++) {
            if (i !== j) {
              const other = values.trimesters[j];
              if (
                (trimester.startDate >= other.startDate && trimester.startDate <= other.endDate) ||
                (trimester.endDate >= other.startDate && trimester.endDate <= other.endDate)
              ) {
                toast({
                  title: "Invalid Dates",
                  description: `Trimester dates Overlaping.`,
                  variant: "destructive"
                });
                return;
              }
            }
          }
        }
      }
      const response = await fetch(
        academicYear ? `/api/v1/academic-years/${academicYear.id}` : '/api/v1/academic-years',
        {
          method: academicYear ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Check for Zod errors, and display them as toasts
        if (errorData.error && typeof errorData.error === 'object') { // Zod errors
          for (const field in errorData.error) {
            if (errorData.error.hasOwnProperty(field)) {
              const fieldErrors = errorData.error[field];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach((errorMessage: string) => {
                  toast({
                    title: "Validation Error",
                    description: `Error on field ${field}: ${errorMessage}`,
                    variant: "destructive",
                  });
                });
              }
            }
          }
        } else {
          throw new Error(errorData.error || 'Failed to create/update academic year');
        }

      } else {
        onSuccess();
        onClose();
        toast({
          description: academicYear ? 'Academic year updated successfully' : 'Academic year created successfully',
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        description: error.message,
        variant: "destructive"
      });
    }
  }

  return (
    <ScrollArea className="max-h-96">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="academicYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Year</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 2024-2025"
                  {...field}
                  // Add a pattern for basic validation (optional):
                  pattern="[0-9]{4}(-[0-9]{4})?"
                  title="Enter a year (e.g., 2024) or a year range (e.g., 2024-2025)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                       {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
          <div className="mb-4">
             <Button type="button" variant="outline" onClick={addTrimester}>
              Add Trimester
            </Button>
          </div>
        
       
          {form.watch("trimesters")?.map((trimester, index) => (
            <div key={index} className="border p-4 mb-4 rounded-md">
              <h3 className="font-semibold mb-2">
                Trimester {index + 1}  {/* Display Trimester Number */}
              </h3>
              <FormField
                control={form.control}
                name={`trimesters.${index}.startDate`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange} // Use onChange from field
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`trimesters.${index}.endDate`}
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-4">
                    <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                               variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                               {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => removeTrimester(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{academicYear ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Form>
    </ScrollArea>
  );
}