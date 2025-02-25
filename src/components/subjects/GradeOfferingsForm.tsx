// src/components/subjects/GradeOfferingsForm.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { Grade, AcademicCalendarSettings, TrimesterSettings, Section, Group } from "@prisma/client";
import { GradeOfferingForm } from "./GradeOfferingForm";
import { GradeGroupSelection } from "./GradeGroupSelection";
import { SubjectFormValues } from "./FormSchemas"; // Import type
import { useState, useEffect } from "react";

interface GradeOfferingsFormProps {
    grades: Grade[];
    academicYear: (AcademicCalendarSettings & { trimesters: TrimesterSettings[] }) | null;
    initialSelectedGrades: string[]; // Add this prop
    initialGradeOfferings: { gradeId: string; groups?: { name: string }[] }[]; // Add this

}

export function GradeOfferingsForm({ grades, academicYear, initialSelectedGrades }: GradeOfferingsFormProps) {
    const { setValue, getValues } = useFormContext<SubjectFormValues>();  // Correct type
    const [selectedGrades, setSelectedGrades] = useState<string[]>(initialSelectedGrades || []);
    const [sections, setSections] = useState<(Section & { grades: (Grade & { groups: Group[] })[] })[]>([]);
    const [, setLoading] = useState(true);

     // Fetch Sections
     const fetchSections = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/v1/sections?includeGradesAndGroups=true");  // Add query parameter
        if (!res.ok) {
          throw new Error("Failed to fetch sections");
        }
        const data = await res.json();
        setSections(data);
      } catch (error) {
        console.error("Error fetching sections: ", error);
      } finally {
        setLoading(false)
      }
    };

    useEffect(() => {
      fetchSections();
    }, []);

    // Initialize selectedGrades from initialSelectedGrades
    useEffect(() => {
      setSelectedGrades(initialSelectedGrades || []);
    }, [initialSelectedGrades]);


    const handleGradeChange = (gradeId: string, checked: boolean) => {
      setSelectedGrades((prev) => {
        if (checked) {
          // Add the grade ID to selected grades.
          return [...prev, gradeId];
        } else {
          // Remove the grade ID, and also remove any associated gradeOfferings data.
          const updatedGrades = prev.filter((id) => id !== gradeId);

           // Get current gradeOfferings and remove data for the unselected grade
           const currentGradeOfferings = getValues("gradeOfferings") || {};
           const { [gradeId]: removedGrade, ...remainingGrades } = currentGradeOfferings;
        console.log(removedGrade);
            // Set Value
            setValue("gradeOfferings", remainingGrades);
            return updatedGrades;
        }
      });
    };

     // New handler for group changes
     const handleGroupChange = (gradeId: string, groupName: string, checked: boolean) => {
      const currentGradeOfferings = getValues("gradeOfferings") || {};

      if (checked) {
          // Add group to the gradeOffering.
          const existingOffering = currentGradeOfferings[gradeId] || { gradeId, trimesters: {}, groups: [] };
          const updatedGroups = [...(existingOffering.groups || []), { name: groupName }];  // Add group

          setValue(`gradeOfferings.${gradeId}`, {
              ...existingOffering,
              groups: updatedGroups,
          });

      } else {
          // Remove group from the gradeOffering.
          if (currentGradeOfferings[gradeId]) {
              const updatedGroups = currentGradeOfferings[gradeId].groups?.filter((g: { name: string }) => g.name !== groupName) || [];
              setValue(`gradeOfferings.${gradeId}.groups`, updatedGroups);

               // Remove gradeOffering if no groups are selected
               if (updatedGroups.length === 0) {
                const { [gradeId]: removedGrade, ...remainingGrades } = currentGradeOfferings;
                console.log(removedGrade);
                setValue("gradeOfferings", remainingGrades);
            }

          }
      }
    };

    // Make sure grades are available
    if(!grades) return <p>Loading</p>

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Grade Offerings</h2>
            <GradeGroupSelection
                sections={sections}
                selectedGrades={selectedGrades}
                onGradeChange={handleGradeChange}
                onGroupChange={handleGroupChange} // Pass down the new handler
                gradeOfferings={Object.values(getValues("gradeOfferings") || {})} //Important
            />

            {selectedGrades.map((gradeId) => {
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
    );
}