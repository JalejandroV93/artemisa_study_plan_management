
// src/components/subjects/SubjectForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Subject, Project, Grade, Group, AcademicCalendarSettings, TrimesterSettings } from "@prisma/client";
import { useToast } from "@/hooks/use-toast"
import { DynamicArrayInput } from "../ui/DynamicArrayInput";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { GradeOfferingForm, gradeOfferingSchema } from "./GradeOfferingForm"; // Import GradeOfferingForm
import { trimesterFormSchema } from "./TrimesterForm";
import { useEffect, useState } from "react";
import { Subject as SubjectType } from "@/types/index";
import { useDebounce } from "use-debounce";

const createSubjectSchema = z.object({
    name: z.string().min(1, "Subject name is required"),
    vision: z.string().optional(),
    mission: z.string().optional(),
    generalObjective: z.string().optional(),
    specificObjectives: z.array(z.string()).optional(),
    didactics: z.array(z.string()).optional(),
    crossCuttingProjects: z.array(z.string().uuid()).optional(), // Still an array of Project IDs.
    isActive: z.boolean().optional(),
    gradeOfferings: z.record(z.string(), z.record(z.string(), gradeOfferingSchema)).default({}), // Key is gradeId, value is GradeOfferingForm data
});

const updateSubjectSchema = createSubjectSchema.partial(); // All fields optional for updates.

type CreateFormValues = z.infer<typeof createSubjectSchema>;
type UpdateFormValues = z.infer<typeof updateSubjectSchema>;
type SubjectFormValues = CreateFormValues | UpdateFormValues; // Union type

interface SubjectFormProps {
    subject?: SubjectType | null; // Using the Extended Subject Type
    onClose: () => void;
}

export function SubjectForm({ subject, onClose }: SubjectFormProps) {
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]); // IDs of selected grades
     const [academicYear, setAcademicYear] = useState<AcademicCalendarSettings & { trimesters: TrimesterSettings[] } | null>(null);
    const [isSaving, setIsSaving] = useState(false); // Track saving state
    const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const methods = useForm<SubjectFormValues>({
        resolver: zodResolver(subject ? updateSubjectSchema : createSubjectSchema),
        defaultValues: subject
        ? {
            ...subject,
            specificObjectives: subject.specificObjectives || [],
            crossCuttingProjects: subject.crossCuttingProjects.map((p) => p.id),
            gradeOfferings: subject.gradeOfferings
                ? subject.gradeOfferings.reduce(
                    (acc, curr) => ({
                    ...acc,
                    [curr.grade.id]: {
                        ...(acc[curr.grade.id] || {}),
                        [curr.group.id]: { // Use group.id, not groupName
                        finalReport: curr.finalReport,
                        trimesters: curr.trimesters.reduce(
                            (trimesterAcc, trimester) => ({
                            ...trimesterAcc,
                            [trimester.number]: {
                                benchmarks: trimester.benchmarks,
                            },
                            }),
                            {} as any
                        ),
                        }
                    },
                    }),
                    {} as Record<string, Record<string, any>>
                )
                : {}, // Ensure gradeOfferings is initialized

          }
        : {
            name: "",
            specificObjectives: [],  // Initialize empty arrays
            crossCuttingProjects: [],
            gradeOfferings: {}
          },
    });

    //Auto save
    const [debouncedValues] = useDebounce(methods.watch(), 500);

  useEffect(() => {
    if (subject) { // Only auto-save in edit mode
      localStorage.setItem(`subject_draft_${subject.id}`, JSON.stringify(debouncedValues));
      if (!isSaving){
          toast({
              title: "Draft Saved",
              description: "Your changes have been saved locally.",
              variant: "default"
          })
      }
    }
  }, [debouncedValues, subject, isSaving]);

  //Load from local storage
  useEffect(() => {
    if (subject) {
      const savedDraft = localStorage.getItem(`subject_draft_${subject.id}`);
      if (savedDraft) {
        methods.reset(JSON.parse(savedDraft));
        toast({
          title: "Draft Loaded",
          description: "Previous changes loaded from local storage.",
        });
      }
    }
  }, [subject, methods]);

    // Fetch Projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch("/api/v1/projects");
                if (!res.ok) {
                    throw new Error("Failed to fetch projects");
                }
                const data = await res.json();
                setProjects(data);
            } catch (error) {
                console.error("Error fetching projects", error);
                // Consider showing a toast here.
            }
        };
        fetchProjects();
    }, []);

    // Fetch Grades
    useEffect(() => {
        const fetchGrades = async () => {
          try {
            const res = await fetch("/api/v1/grades");
            if (!res.ok) {
              throw new Error("Failed to fetch grades");
            }
            const data = await res.json();
            setGrades(data);
          } catch (error) {
            console.error("Error fetching grades:", error);
          }
        };
        fetchGrades();
      }, []);

      // Fetch Academic Year with Trimesters (For new Subjects)
        useEffect(() => {
            const fetchAcademicYear = async () => {
            try {
                const res = await fetch("/api/v1/academic-years"); // Fetch all academic years
                if (!res.ok) {
                throw new Error("Failed to fetch academic years");
                }
                const data: (AcademicCalendarSettings & { trimesters: TrimesterSettings[] })[] = await res.json(); // Include trimesters
                 // Sort academic years in descending order (most recent first)
                data.sort((a, b) => b.academicYear.localeCompare(a.academicYear));
                setAcademicYear(data[0] || null); // Get the first/or null if empty

            } catch (error) {
                console.error("Error fetching academic year:", error);
            }
            }
                //Only if is a new subject
                if(!subject){
                    fetchAcademicYear();
                }
    
            }, [subject]);
    
    
          const handleGradeChange = (gradeId: string, checked: boolean) => {
            setSelectedGrades((prevSelectedGrades) => {
                if (checked) {
                  // Add grade ID to selectedGrades
                  return [...prevSelectedGrades, gradeId];
                } else {
                  // Remove grade ID from selectedGrades
                  return prevSelectedGrades.filter((id) => id !== gradeId);
                }
              });
          };
    
    
        async function onSubmit(values: SubjectFormValues) {
          setIsSaving(true); // Set isSaving to true when submitting
          console.log("Submitting values:", values);  // Debug: Log form values
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
                    // Improved error handling with Zod.
                    if (response.status === 400 && errorData.error) {
                        //form.setError("root", { message: "Error en los datos enviados."}) // This is not the best way
                        //Better: Display the errors using formState.errors from react-hook-form.
                        //Iterate zod errors
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
                        }
                        return; // Prevent moving forward
                    }  else {
                        throw new Error(errorData.error || (subject ? "Failed to update subject" : "Failed to create subject"));
                    }
                }
                //Success
                if(subject?.id){
                    localStorage.removeItem(`subject_draft_${subject.id}`); //Clear on succesful submit
                }
                toast({
                    title: "Success",
                    description: subject ? "Subject updated!" : "Subject created!",
                });
                onClose();
    
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                 toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message || "An unexpected error occurred.",
                });
            } finally {
              setIsSaving(false); // Reset isSaving after the request completes
            }
        }
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                     <FormField
                        control={methods.control}
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
                        control={methods.control}
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
                        control={methods.control}
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
                        control={methods.control}
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
                        control={methods.control}
                        name="specificObjectives"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Specific Objectives</FormLabel>
                            <FormControl>
                            <DynamicArrayInput
                                values={field.value || []}
                                onChange={(newValues) => field.onChange(newValues)}
                                placeholder="Enter specific objective..."
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
    
                    <FormField
                        control={methods.control}
                        name="didactics"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Didactics</FormLabel>
                            <FormControl>
                            <DynamicArrayInput
                                values={field.value || []}
                                onChange={(newValues) => field.onChange(newValues)}
                                placeholder="Enter didactics..."
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
    
    
                    <FormField
                        control={methods.control}
                        name="crossCuttingProjects"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cross-Cutting Projects</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value ? field.value.join(",") : undefined} // Convert array to string
                            >
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select projects" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
    
                        <FormField
                            control={methods.control}
                            name="gradeOfferings"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Grades</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                    const selectedGradeIds = value.split(",");
                                    setSelectedGrades(selectedGradeIds);
                                    // You could initialize GradeOfferingForm data here, if needed.
                                    }}
                                    defaultValue={selectedGrades.join(",")} // Convert array to string
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grades" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {grades.map((grade) => (
                                        <SelectItem
                                            key={grade.id}
                                            value={grade.id}
                                        >
                                            {grade.name}
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    {selectedGrades.map((gradeId) => {
                        const selectedGrade = grades.find((g) => g.id === gradeId);
                        if (!selectedGrade) return null; // Or some placeholder
                        return (
                        <GradeOfferingForm
                            key={gradeId}
                            grade={selectedGrade}
                            trimesterSettings={academicYear?.trimesters || []} // Pass trimesters down
    
                        />
                        );
                    })}
    
    
                     {subject && ( // Conditionally render isActive field
                        <FormField
                            control={methods.control}
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
                        <Button type="submit" isLoading={isSaving}>{subject ? "Update" : "Create"}</Button>
                    </div>
                </form>
            </FormProvider>
        );
    }