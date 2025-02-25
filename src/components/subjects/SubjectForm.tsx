/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/subjects/SubjectForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Subject } from "@prisma/client";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/navigation";
import { GeneralInformationForm } from "./GeneralInformationForm";  // Import
import { GradeOfferingsForm } from "./GradeOfferingsForm";      // Import
import { createSubjectSchema, updateSubjectSchema, SubjectFormValues } from "./FormSchemas"; // Import Type
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"; // Import
import { Project, Grade } from "@/types/index";

interface SubjectFormProps {
  subject?: Subject | null;
  onClose: () => void;
}

export function SubjectForm({ subject, onClose }: SubjectFormProps) {
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
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
                    const trimestersData = curr.trimesters.reduce(
                        (trimesterAcc, trimester) => ({
                            ...trimesterAcc,
                            [trimester.number]: {
                                benchmarks: trimester.benchmarks,
                            },
                        }),
                        {}
                    );
                    return {
                        ...acc,
                        [curr.gradeId]: {
                            finalReport: curr.finalReport,
                            trimesters: trimestersData,
                            groups: curr.enrollments.map((e) => ({ name: e.group.name })),
                        },
                    };
                }, {} as Record<string, any>),
            }
          : {
                name: "",
                specificObjectives: [],
                crossCuttingProjects: [],
                gradeOfferings: {},
                didactics: []
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
  // --- Debounced Values & Local Storage ---
  const [debouncedValues] = useDebounce(methods.watch(), 500);

  useEffect(() => {
    if (subject?.id) {
      // Only save if it's an existing subject
      localStorage.setItem(
        `subject_draft_${subject.id}`,
        JSON.stringify(debouncedValues)
      );
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
      // Prepare the data for the API request.  Crucially, *remove* the `groups`
      // from the gradeOfferings before sending.  We only use `groups` client-side.
      const apiReadyValues = {
        ...values,
        gradeOfferings: values.gradeOfferings
          ? Object.fromEntries(
              Object.entries(values.gradeOfferings).map(([gradeId, offering]) => [
                gradeId,
                {
                  ...offering,
                  groups: undefined, // Remove groups
                },
              ])
            )
          : undefined, // Make sure gradeOfferings is optional for updates.
      };

      const response = await fetch(
        subject ? `/api/v1/subjects/${subject.id}` : "/api/v1/subjects",
        {
          method: subject ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiReadyValues),
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

      if (subject?.id) {
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

  // Get initial selected grades for GradeOfferingsForm
  const initialSelectedGrades = subject
    ? subject.gradeOfferings.map((offering) => offering.gradeId)
    : [];

    const initialGradeOfferings = subject
    ? subject.gradeOfferings.map((offering) => ({
        gradeId: offering.gradeId,
        groups: offering.enrollments.map((e) => ({ name: e.group.name })),
      }))
    : [];


  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <GeneralInformationForm />
        <FormField
          control={methods.control}
          name="crossCuttingProjects"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cross-Cutting Projects</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? value.split(',') : [])}
                defaultValue={field.value?.join(',')}
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

        <GradeOfferingsForm
           grades={grades}
           academicYear={academicYear}
           initialSelectedGrades={initialSelectedGrades}
           initialGradeOfferings={initialGradeOfferings}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {subject ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}