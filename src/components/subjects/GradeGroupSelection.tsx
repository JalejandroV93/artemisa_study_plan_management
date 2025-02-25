// src/components/subjects/GradeGroupSelection.tsx
"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Section, Grade, Group } from "@prisma/client"; // Import Prisma types

interface GradeGroupSelectionProps {
  sections: (Section & { grades: (Grade & { groups: Group[] })[] })[];
  selectedGrades: string[]; // Array of grade IDs
  onGradeChange: (gradeId: string, checked: boolean) => void;
  onGroupChange: (gradeId: string, groupName: string, checked: boolean) => void; // Add this
  gradeOfferings?: { gradeId: string; groups?: { name: string }[] }[]; // Existing grade offerings
}

export function GradeGroupSelection({
  sections,
  selectedGrades,
  onGradeChange,
  onGroupChange,
  gradeOfferings = [], // Default to empty array
}: GradeGroupSelectionProps) {

  // Build a map of existing grade/group selections for easy checking.
  const existingGradeGroups = React.useMemo(() => {
    const map: Record<string, Set<string>> = {};  // gradeId: Set<groupName>
    for (const offering of gradeOfferings) {
        map[offering.gradeId] = new Set(offering.groups?.map(g => g.name) ?? []);
    }
    return map;
  }, [gradeOfferings]);


  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="border p-4 rounded-md">
          <h3 className="text-lg font-medium">{section.name}</h3>
          <div className="mt-2 space-y-2">
            {/* Optional Chaining and Nullish Coalescing */}
            {section.grades?.map((grade) => (
              <div key={grade.id} className="border-b pb-2 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`grade-${grade.id}`} className="text-sm font-medium">
                    {grade.name}
                    </Label>
                    <Switch
                        id={`grade-${grade.id}`}
                        checked={selectedGrades.includes(grade.id)}
                        onCheckedChange={(checked) => onGradeChange(grade.id, checked)}
                    />
                </div>


                <div className="mt-2 grid grid-cols-2 gap-4">
                  {grade.groups?.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Label htmlFor={`grade-${grade.id}-group-${group.name}`} className="text-sm">
                        {group.name}
                      </Label>
                      <Switch
                        id={`grade-${grade.id}-group-${group.name}`}
                        checked={selectedGrades.includes(grade.id) && existingGradeGroups[grade.id]?.has(group.name ?? "")}  //Check both grade and if it's in existing groups.
                        disabled={!selectedGrades.includes(grade.id)}
                        onCheckedChange={(checked) => onGroupChange(grade.id, group.name ?? "", checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )) ?? []}
          </div>
        </div>
      ))}
    </div>
  );
}