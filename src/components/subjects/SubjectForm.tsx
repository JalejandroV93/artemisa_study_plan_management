// src/components/subjects/SubjectForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {  Project, Grade, AcademicCalendarSettings, TrimesterSettings } from "@prisma/client";
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
import { Subject as SubjectType } from "@/types/index"; // Use the extended type
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";


// --- Zod Schemas (using Prisma types where possible) ---
const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  vision: z.string().optional(),
  mission: z.string().optional(),
  generalObjective: z.string().optional(),
  specificObjectives: z.array(z.string()).optional(),
  didactics: z.array(z.string()).optional(),
  crossCuttingProjects: z.array(z.string().uuid()).optional(),  // Array of Project IDs
  isActive: z.boolean().optional(),
  gradeOfferings: z.record(z.string(), gradeOfferingSchema).default({}), // Key is gradeId, value is GradeOfferingForm data
});

const updateSubjectSchema = createSubjectSchema.partial(); // All fields optional for updates.

// --- Types ---
type CreateFormValues = z.infer<typeof createSubjectSchema>;
type UpdateFormValues = z.infer<typeof updateSubjectSchema>;
type SubjectFormValues = CreateFormValues | UpdateFormValues; // Union type

interface SubjectFormProps {
  subject?: SubjectType | null;  // Using the Extended Subject Type
  onClose: () => void;
}

// --- Component ---
export function SubjectForm({ subject, onClose }: SubjectFormProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]); // IDs of selected grades
  const [academicYear, setAcademicYear] = useState<AcademicCalendarSettings & { trimesters: TrimesterSettings[] } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const methods = useForm<SubjectFormValues>({
    resolver: zodResolver(subject ? updateSubjectSchema : createSubjectSchema),
    defaultValues: subject
    ? {
        ...subject,
        specificObjectives: subject.specificObjectives || [],
        crossCuttingProjects: subject.crossCuttingProjects.map((p) => p.id),
        gradeOfferings: subject.gradeOfferings.reduce((acc, curr) => {
          const trimestersData = curr.trimesters.reduce((trimesterAcc, trimester) => ({
            ...trimesterAcc,
            [trimester.number]: {
              benchmarks: trimester.benchmarks,
            },
          }), {} as any); // Type assertion for nested structure

          return {
            ...acc,
            [curr.gradeId]: {
              finalReport: curr.finalReport,
              trimesters: trimestersData,
            },
          };
        }, {} as Record<string, any>), // Top-level type assertion
      }
    : {
      name: "",
      specificObjectives: [],  // Initialize empty arrays.
      crossCuttingProjects: [],
      gradeOfferings: {}
      },
  });

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, gradesRes, academicYearsRes] = await Promise.all([
          fetch("/api/v1/projects"),
          fetch("/api/v1/grades"),
          fetch("/api/v1/academic-years"),
        ]);

        if (!projectsRes.ok) throw new Error("Failed to fetch projects");
        if (!gradesRes.ok) throw new Error("Failed to fetch grades");
        if (!academicYearsRes.ok) throw new Error("Failed to fetch academic years");

        const projectsData = await projectsRes.json();
        const gradesData = await gradesRes.json();
        const academicYearsData: (AcademicCalendarSettings & { trimesters: TrimesterSettings[] })[] = await academicYearsRes.json();

        setProjects(projectsData);
        setGrades(gradesData);
        if (academicYearsData.length > 0) {
          //Sort by academic Year
          academicYearsData.sort((a, b) => b.academicYear.localeCompare(a.academicYear));
          setAcademicYear(academicYearsData[0]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch initial data.",
          });
      }
    };

    fetchData();
  }, []);

  // --- Grade Selection ---
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

    // --- Debounced Values & Local Storage ---
    const [debouncedValues] = useDebounce(methods.watch(), 500);

    useEffect(() => {
        if (subject?.id) {  // Only save if it's an existing subject
        localStorage.setItem(`subject_draft_${subject.id}`, JSON.stringify(debouncedValues));
        }
    }, [debouncedValues, subject?.id]);

    useEffect(() => {
        if (subject?.id) {
        const savedDraft = localStorage.getItem(`subject_draft_${subject.id}`);
        if (savedDraft) {
            methods.reset(JSON.parse(savedDraft));
            toast({
                title: "Draft Loaded",
                description: "Restored unsaved changes from local storage.",
            });
        }
        }
    }, [methods, subject?.id]);


    // --- Form Submission ---
    async function onSubmit(values: SubjectFormValues) {
        setIsSaving(true);
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
                    if (errorData.error && typeof errorData.error === 'object') {
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
                    return; // Don't proceed if Zod validation errors exist
                }  else {
                    throw new Error(errorData.error || (subject ? "Failed to update subject" : "Failed to create subject"));
                }
            }

        const data = await response.json(); //  Get the returned data
        if(subject?.id){
            localStorage.removeItem(`subject_draft_${subject.id}`);
        }
        toast({
          title: "Success",
          description: subject ? "Subject updated!" : "Subject created!",
        });
        onClose();
         // Redirect to the subject detail page
         router.push(`/v1/subjects/${data.id}`);

        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "An unexpected error occurred.",
          });
        } finally {
          setIsSaving(false);
        }
      }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {/* General Information Fields (as before, but using DynamicArrayInput) */}

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

        {/* Dynamic array for specificObjectives */}
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

        {/* Didactics (also a dynamic array) */}
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


        {/* Cross-Cutting Projects (Select, similar to your original implementation) */}
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

            {/* Grade Selection (NEW) */}
            <FormField
            control={methods.control}
            name="gradeOfferings" //  name for the entire gradeOfferings structure
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
            {/* Conditionally Render GradeOfferingForms */}
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
                            className="mr-2" // Add some spacing
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