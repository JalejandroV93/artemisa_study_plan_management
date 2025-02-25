"use client"

import React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Section, Grade } from "@prisma/client"
import { ChevronDown, ChevronUp } from "lucide-react"

interface GradeGroupSelectionProps {
  sections: (Section & { grades: Grade[] })[]
  selectedGrades: string[]
  onGradeChange: (gradeId: string, checked: boolean) => void
}

export function GradeGroupSelection({ sections, selectedGrades, onGradeChange }: GradeGroupSelectionProps) {
  const [expandedSections, setExpandedSections] = React.useState<string[]>([])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-gray-800">{section.name}</h3>
            {expandedSections.includes(section.id) ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSections.includes(section.id) && (
            <div className="p-4 bg-white">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.grades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Label htmlFor={`grade-${grade.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                      {grade.name}
                    </Label>
                    <Switch
                      id={`grade-${grade.id}`}
                      checked={selectedGrades.includes(grade.id)}
                      onCheckedChange={(checked) => onGradeChange(grade.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

