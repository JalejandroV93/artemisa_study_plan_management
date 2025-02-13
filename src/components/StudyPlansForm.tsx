"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus } from "lucide-react"

const ALL_GRADES = ["6", "7", "8", "9", "10", "11"]
const ALL_TRIMESTERS = [1, 2, 3]

export function StudyPlansForm() {
  const { control, watch } = useFormContext()
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedTrimesters, setSelectedTrimesters] = useState<number[]>([])

  const handleGradeChange = (grade: string) => {
    setSelectedGrades((prev) => (prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]))
  }

  const handleTrimesterChange = (trimester: number) => {
    setSelectedTrimesters((prev) =>
      prev.includes(trimester) ? prev.filter((t) => t !== trimester) : [...prev, trimester],
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Seleccione Grados a Editar</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_GRADES.map((grade) => (
              <div key={grade} className="flex items-center space-x-2">
                <Checkbox
                  id={`grade-${grade}`}
                  checked={selectedGrades.includes(grade)}
                  onCheckedChange={() => handleGradeChange(grade)}
                />
                <label htmlFor={`grade-${grade}`} className="text-sm font-medium">
                  Grado {grade}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Seleccione Trimestres a Editar</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_TRIMESTERS.map((trimester) => (
              <div key={trimester} className="flex items-center space-x-2">
                <Checkbox
                  id={`trimester-${trimester}`}
                  checked={selectedTrimesters.includes(trimester)}
                  onCheckedChange={() => handleTrimesterChange(trimester)}
                />
                <label htmlFor={`trimester-${trimester}`} className="text-sm font-medium">
                  Trimestre {trimester}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {selectedGrades.map((grade) => (
          <AccordionItem key={grade} value={grade}>
            <AccordionTrigger className="text-lg font-medium">Grado {grade}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-4">
                <FormField
                  control={control}
                  name={`grades.${grade}.finalReport`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporte Final</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ingrese el reporte final" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedTrimesters.map((trimester) => (
                  <div key={trimester} className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Trimestre {trimester}</h4>
                    <FormField
                      control={control}
                      name={`grades.${grade}.trimesters.${trimester}.benchmarks`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Benchmark</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Ingrese benchmark" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["communication", "sensitivity", "aestheticAppreciation"].map((evidenceType) => (
                        <FormField
                          key={evidenceType}
                          control={control}
                          name={`grades.${grade}.trimesters.${trimester}.${evidenceType}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{evidenceType.charAt(0).toUpperCase() + evidenceType.slice(1)}</FormLabel>
                              <FormControl>
                                <Textarea placeholder={`Ingrese evidencia de ${evidenceType}`} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    <FormField
                      control={control}
                      name={`grades.${grade}.trimesters.${trimester}.thematicsComponents`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temáticas/Componentes</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {(field.value || []).map((component: string, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                <Input
                                  value={component}
                                  onChange={(e) => {
                                    const newComponents = [...field.value]
                                    newComponents[index] = e.target.value
                                    field.onChange(newComponents)
                                  }}
                                  className="w-auto"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const newComponents = [...field.value]
                                    newComponents.splice(index, 1)
                                    field.onChange(newComponents)
                                  }}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                field.onChange([...(field.value || []), ""])
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Componente
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

