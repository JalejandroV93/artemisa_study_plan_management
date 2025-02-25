"use client"

import { useFormContext } from "react-hook-form"
import type { Grade, AcademicCalendarSettings, TrimesterSettings, Section } from "@prisma/client"
import { GradeOfferingForm } from "./GradeOfferingForm"
import type { SubjectFormValues } from "./FormSchemas"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"

interface GradeOfferingsFormProps {
  grades: Grade[]
  academicYear: (AcademicCalendarSettings & { trimesters: TrimesterSettings[] }) | null
  initialSelectedGrades: string[]
}

export function GradeOfferingsForm({ grades, academicYear, initialSelectedGrades }: GradeOfferingsFormProps) {
  const { setValue, getValues } = useFormContext<SubjectFormValues>()
  const [selectedGrades, setSelectedGrades] = useState<string[]>(initialSelectedGrades || [])
  const [sections, setSections] = useState<(Section & { grades: Grade[] })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSections = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/v1/sections?includeGradesAndGroups=true")
      if (!res.ok) {
        throw new Error("Failed to fetch sections")
      }
      const data = await res.json()
      const sectionsWithGrades = data.map((section: Section & { grades?: Grade[] }) => ({
        ...section,
        grades: section.grades ?? [],
      }))
      setSections(sectionsWithGrades)
    } catch (error) {
      console.error("Error fetching sections: ", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  useEffect(() => {
    setSelectedGrades(initialSelectedGrades || [])
  }, [initialSelectedGrades])

  const handleGradeChange = (gradeId: string, checked: boolean) => {
    setSelectedGrades((prev) => {
      if (checked) {
        return [...prev, gradeId]
      } else {
        const updatedGrades = prev.filter((id) => id !== gradeId)
        const currentGradeOfferings = getValues("gradeOfferings") || {}
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [gradeId]: _removedGrade, ...remainingGrades } = currentGradeOfferings
        setValue("gradeOfferings", remainingGrades)
        return updatedGrades
      }
    })
  }

  if (!grades) return <p>Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Grade Offerings</h2>
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
                <CardTitle className="text-lg font-semibold">{section.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.grades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-700">{grade.name}</span>
                    <Switch
                      id={`grade-${grade.id}`}
                      checked={selectedGrades.includes(grade.id)}
                      onCheckedChange={(checked) => handleGradeChange(grade.id, checked)}
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
            const grade = grades.find((g) => g.id === gradeId)
            if (!grade) return null
            return <GradeOfferingForm key={gradeId} grade={grade} trimesterSettings={academicYear?.trimesters || []} />
          })}
        </div>
      )}
    </div>
  )
}

