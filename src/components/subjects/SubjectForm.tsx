/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  createSubjectSchema,
  updateSubjectSchema,
  SubjectFormValues,
  UpdateSubjectFormValues,
} from "./FormSchemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Project } from "@/types/index";
import {
  AcademicCalendarSettings,
  TrimesterSettings,
  Grade,
} from "@prisma/client";

interface SubjectFormProps {
  subject?: (Subject & {
    gradeOfferings: {
      id?: string;
      gradeId: string;
      finalReport: string;
      trimesters: {
        id?: string;
        number: number;
        benchmarks: {
          id?: string;
          description: string;
          learningEvidence: string[];
          thematicComponents: string[];
        }[];
      }[];
    }[];
  }) | null;
  onClose: () => void;
}

type ApiSubjectValues = {
  name: string;
  vision?: string;
  mission?: string;
  generalObjective?: string;
  specificObjectives: string[];
  didactics?: string;
  crossCuttingProjects?: string[];
  isActive?: boolean;
  gradeOfferings: {
    id?: string;
    gradeId: string;
    finalReport: string;
    trimesters: {
      id?: string;
      number: number;
      benchmarks: {
        id?: string;
        description: string;
        learningEvidence: string[];
        thematicComponents: string[];
      }[];
    }[];
  }[];
};

export function SubjectForm({ subject, onClose }: SubjectFormProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [academicYear, setAcademicYear] = useState<
    (AcademicCalendarSettings & { trimesters: TrimesterSettings[] }) | null
  >(null);

  const router = useRouter();

  const form = useForm<SubjectFormValues | UpdateSubjectFormValues>({
    resolver: zodResolver(subject ? updateSubjectSchema : createSubjectSchema),
    defaultValues: subject
      ? {
          ...subject,
          vision: subject.vision ?? undefined,
          mission: subject.mission ?? undefined,
          generalObjective: subject.generalObjective ?? undefined,
          didactics: subject.didactics ?? undefined,
          specificObjectives: subject.specificObjectives ?? [],
          crossCuttingProjects: (subject as any).crossCuttingProjects?.map((p: { id: any; }) => p.id) || [],
          gradeOfferings: subject.gradeOfferings.map((offering) => ({
            id: offering.id,
            gradeId: offering.gradeId,
            finalReport: offering.finalReport || "",
            trimesters: offering.trimesters.map((trimester) => ({
              id: trimester.id,
              number: trimester.number,
              benchmarks: trimester.benchmarks.map((benchmark) => ({
                id: benchmark.id,
                description: benchmark.description,
                learningEvidence: benchmark.learningEvidence || [],
                thematicComponents: benchmark.thematicComponents || [],
              })),
            })),
          })),
        }
      : {
          name: "",
          specificObjectives: [],
          crossCuttingProjects: [],
          gradeOfferings: [],
          isActive: true,
          didactics: "",
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

        const projectsData: Project[] = await projectsRes.json();
        const gradesData: Grade[] = await gradesRes.json();
        const academicYearsData = await academicYearsRes.json();

        setProjects(projectsData);
        setGrades(gradesData);
        if (academicYearsData.length > 0) {
          // Sort academic years to get the latest one (assuming `academicYear` is comparable)
        interface AcademicYearWithTrimesters extends AcademicCalendarSettings {
            trimesters: TrimesterSettings[];
        }

        (academicYearsData as AcademicYearWithTrimesters[]).sort(
            (a: AcademicYearWithTrimesters, b: AcademicYearWithTrimesters) =>
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
      //Crucially: map the form data to the API format.
      const apiReadyValues: ApiSubjectValues = {
        ...values,
        name: values.name || "",
        specificObjectives: values.specificObjectives ?? [],
        crossCuttingProjects: values.crossCuttingProjects ?? [],
        gradeOfferings: (values.gradeOfferings ?? []).map((offering) => ({
          id: offering.id, // Incluye el ID si existe
          gradeId: offering.gradeId,
          finalReport: offering.finalReport || "",
          trimesters:
            offering.trimesters?.map((trimester) => ({
              id: trimester.id, // Incluye el ID si existe
              number: trimester.number,
              benchmarks:
                trimester.benchmarks?.map((benchmark) => ({
                  id: benchmark.id, // Incluye el ID si existe
                  description: benchmark.description,
                  learningEvidence: benchmark.learningEvidence || [],
                  thematicComponents: benchmark.thematicComponents || [],
                })) || [],
            })) || [],
        })),
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
        if (response.status === 400 && errorData.error) {
          form.setError("root", { message: "Error en los datos enviados." });
          return;
        } else {
          throw new Error(
            errorData.error ||
              (subject
                ? "Failed to update subject"
                : "Failed to create subject")
          );
        }
      }

      const data = await response.json(); //  Get the returned data
      toast({
        title: "Success",
        description: subject ? "Subject updated!" : "Subject created!",
      });
      onClose();
      router.push(`/v1/subjects/${data.id}`); // Redirect to new/updated subject
    } catch (error: any) {
      console.error(error);
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
        value={field.value?.join(',') || ''} // Asegúrate de que sea una cadena
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
