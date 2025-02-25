// src/components/subjects/SubjectForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Subject } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GeneralInformationForm } from "./GeneralInformationForm";
import { GradeOfferingsForm } from "./GradeOfferingsForm";
import { createSubjectSchema, updateSubjectSchema, SubjectFormValues, UpdateSubjectFormValues } from "./FormSchemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Project } from "@/types/index";
import { AcademicCalendarSettings, TrimesterSettings, Grade } from "@prisma/client";

interface SubjectFormProps {
  subject?: Subject | null;
  onClose: () => void;
}

export function SubjectForm({ subject, onClose }: SubjectFormProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [academicYear, setAcademicYear] = useState<AcademicCalendarSettings & { trimesters: TrimesterSettings[] } | null>(null);

  const router = useRouter();

  const form = useForm<SubjectFormValues | UpdateSubjectFormValues>({
    resolver: zodResolver(subject ? updateSubjectSchema : createSubjectSchema),
    defaultValues: subject
    ? {
        ...subject,
        // Ensure these are arrays, even if null in the database.
        specificObjectives: subject.specificObjectives ?? [],
        crossCuttingProjects: subject.crossCuttingProjects.map((p) => p.id),  // Correctly map project IDs
        gradeOfferings: subject.gradeOfferings.reduce(
          (acc, curr) => {
            // Build trimester data.
              const trimestersData = curr.trimesters.reduce(
                (trimesterAcc, trimester) => ({
                  ...trimesterAcc,
                  [trimester.number]: {
                    benchmarks: trimester.benchmarks,
                  },
                }),
                {}
              );

            acc[curr.gradeId] = {
              finalReport: curr.finalReport,
              trimesters: trimestersData,
              // groups: curr.enrollments.map((e) => ({ name: e.group.name })),  // Removed groups.
            };
            return acc;
          },
          {} as Record<string, any>
        ),
      }
      : {
        name: "",
        specificObjectives: [],
        crossCuttingProjects: [],
        gradeOfferings: {},
        didactics: "", // Initialize as empty string
        isActive: true
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
        if (!academicYearsRes.ok)
          throw new Error("Failed to fetch academic years");

        const projectsData:Project[] = await projectsRes.json();
        const gradesData: Grade[] = await gradesRes.json();
        const academicYearsData = await academicYearsRes.json();

        setProjects(projectsData);
        setGrades(gradesData);
        if (academicYearsData.length > 0) {
          academicYearsData.sort((a, b) =>
            b.academicYear.localeCompare(a.academicYear)
          );
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
  }, [toast]);



  // --- Form Submission ---
  async function onSubmit(values: SubjectFormValues | UpdateSubjectFormValues) {
    try {

      const apiReadyValues = subject
      ? { ...values, gradeOfferings: values.gradeOfferings ? values.gradeOfferings : undefined } // Keep gradeOfferings optional
      : { ...values, gradeOfferings: values.gradeOfferings || {} };

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
          if (typeof errorData.error === "object") {
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
        } else {
          throw new Error(
            errorData.error ||
              (subject ? "Failed to update subject" : "Failed to create subject")
          );
        }
      }

      const data = await response.json(); //  Get the returned data
      toast({
        title: "Success",
        description: subject ? "Subject updated!" : "Subject created!",
      });
      onClose();
      // Redirect to the subject detail page
      router.push(`/v1/subjects/${data.id}`);

    } catch (error: any) {
        console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    }
  }

  // Get initial selected grades for GradeOfferingsForm
  const initialSelectedGrades = subject
    ? subject.gradeOfferings.map((offering) => offering.gradeId)
    : [];

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <GeneralInformationForm />
        <FormField
          control={form.control}
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
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{subject ? "Update" : "Create"}</Button>
        </div>
      </form>
    </FormProvider>
  );
}