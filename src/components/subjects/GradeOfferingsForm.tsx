// src/components/subjects/GradeOfferingsForm.tsx
"use client";

import { useFormContext } from "react-hook-form";
import type {
  Grade,
  AcademicCalendarSettings,
  TrimesterSettings,
  Section,
} from "@prisma/client";
import { GradeOfferingForm } from "./GradeOfferingForm";
import type { SubjectFormValues, UpdateSubjectFormValues } from "./FormSchemas"; // Import
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useFieldArray } from "react-hook-form"; // Import useFieldArray

type FormValues = SubjectFormValues | UpdateSubjectFormValues;

interface GradeOfferingsFormProps {
  grades: Grade[];
  academicYear:
    | (AcademicCalendarSettings & { trimesters: TrimesterSettings[] })
    | null;
  initialSelectedGrades: string[];
}

export function GradeOfferingsForm({
  grades,
  academicYear,
  initialSelectedGrades,
}: GradeOfferingsFormProps) {
  const { control, getValues, formState } =
    useFormContext<FormValues>(); // Now using SubjectFormValues

  const { append, remove } = useFieldArray({
    control,
    name: "gradeOfferings", // Now an array
  });

  const [sections, setSections] = useState<(Section & { grades: Grade[] })[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    initialSelectedGrades
  );

  const fetchSections = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/sections?includeGradesAndGroups=true");
      if (!res.ok) {
        throw new Error("Failed to fetch sections");
      }
      const data = await res.json();
      const sectionsWithGrades = data.map(
        (section: Section & { grades?: Grade[] }) => ({
          ...section,
          grades: section.grades ?? [],
        })
      );
      setSections(sectionsWithGrades);
    } catch (error) {
      console.error("Error fetching sections: ", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    const currentGradeOfferings = getValues("gradeOfferings") || [];
    const gradeIds = grades.map((g) => g.id);

    // Agregar nuevos gradeOfferings
    gradeIds.forEach((gradeId) => {
      if (!currentGradeOfferings.some((go) => go.gradeId === gradeId)) {
        append({
          gradeId,
          finalReport: "",
          trimesters:
            academicYear?.trimesters.map((t) => ({
              id: crypto.randomUUID(),
              number: t.number,
              benchmarks: [],
            })) || [],
        });
      }
    });

    // Eliminar gradeOfferings obsoletos
    currentGradeOfferings.forEach((go, index) => {
      if (!gradeIds.includes(go.gradeId)) {
        remove(index);
      }
    });
  }, [grades, academicYear, append, remove, getValues]);

  //Update the SelectedGrades to reflect the state of the GradeOfferings
  useEffect(() => {
    const currentGradeOfferings = getValues("gradeOfferings") || [];
    setSelectedGrades(
      currentGradeOfferings.map((offering) => offering.gradeId)
    );
  }, [formState, getValues]); //Depend on formState changes
  const handleGradeChange = (gradeId: string, checked: boolean) => {
    const currentGradeOfferings = getValues('gradeOfferings') || [];
    if (checked) {
      if (!currentGradeOfferings.some(go => go.gradeId === gradeId)) {
        append({
          gradeId,
          finalReport: '',
          trimesters: academicYear?.trimesters.map(t => ({ id: crypto.randomUUID(), number: t.number, benchmarks: [] })) || [],
        });
      }
    } else {
      const index = currentGradeOfferings.findIndex(go => go.gradeId === gradeId);
      if (index !== -1) remove(index);
    }
    setSelectedGrades(prev => checked ? [...prev, gradeId] : prev.filter(id => id !== gradeId));
  };

  if (!grades) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Grade Offerings
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.id} className="border-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {section.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.grades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {grade.name}
                    </span>
                    <Switch
                      id={`grade-${grade.id}`}
                      checked={selectedGrades.includes(grade.id)}
                      onCheckedChange={(checked) =>
                        handleGradeChange(grade.id, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGrades.length > 0 && (
        <div className="mt-8 space-y-6">
          {selectedGrades.map((gradeId) => {
            //Map over the Selected Grades
            const grade = grades.find((g) => g.id === gradeId);
            if (!grade) return null;
            return (
              <GradeOfferingForm
                key={gradeId}
                grade={grade}
                trimesterSettings={academicYear?.trimesters || []}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
