"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

// Example data (same as in the view page)
const EXAMPLE_DATA = {
  name: "Artes Plásticas y Visuales",
  vision: "Desarrollar la creatividad y expresión artística de los estudiantes...",
  mission: "Formar estudiantes con sensibilidad artística y capacidad creativa...",
  generalObjective: "Potenciar las habilidades artísticas y creativas de los estudiantes...",
  specificObjectives: [
    "Desarrollar técnicas de dibujo y pintura",
    "Fomentar la apreciación artística",
    "Estimular la creatividad y expresión personal"
  ],
  didactics: "Metodología práctica basada en proyectos artísticos...",
  crossCuttingProjects: "Integración con otras áreas mediante proyectos interdisciplinarios...",
  gradeOfferings: [
    {
      grade: "9",
      groupName: "A",
      finalReport: "Integro diferentes lenguajes creativos...",
      trimesters: [
        {
          number: 1,
          benchmarks: [
            {
              benchmark: "Creo procesos pictóricos...",
              learningEvidence: {
                communication: "Elaboro una propuesta pictórica...",
                sensitivity: "Abordo creativamente el concepto impresionista...",
                aestheticAppreciation: "Analizo referentes históricos..."
              },
              thematicsComponents: ["Bidimensional", "Dibujo", "Pintura"]
            }
          ]
        }
      ]
    }
  ]
};

const ALL_GRADES = ["6", "7", "8", "9", "10", "11"];
const ALL_TRIMESTERS = [1, 2, 3];

export default function EditSubjectPage({ params }: { params: { subject: string } }) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedTrimesters, setSelectedTrimesters] = useState<number[]>([]);

  const form = useForm({
    defaultValues: EXAMPLE_DATA
  });

  function onSubmit(values: any) {
    console.log(values);
    // Here you would save the changes
  }

  const handleGradeChange = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  const handleTrimesterChange = (trimester: number) => {
    setSelectedTrimesters(prev =>
      prev.includes(trimester)
        ? prev.filter(t => t !== trimester)
        : [...prev, trimester]
    );
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-4">
          <Link 
            href={`/subjects/${params.subject}`} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subject
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Edit {EXAMPLE_DATA.name}</h1>
            <p className="text-gray-600 mt-2">Modify subject information and study plans</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="study-plans">Study Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="vision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vision</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter vision statement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter mission statement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="generalObjective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Objective</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter general objective" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="study-plans" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Select Grades to Edit</h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_GRADES.map(grade => (
                    <div key={grade} className="flex items-center space-x-2">
                      <Checkbox
                        id={`grade-${grade}`}
                        checked={selectedGrades.includes(grade)}
                        onCheckedChange={() => handleGradeChange(grade)}
                      />
                      <label
                        htmlFor={`grade-${grade}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Grade {grade}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Select Trimesters to Edit</h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_TRIMESTERS.map(trimester => (
                    <div key={trimester} className="flex items-center space-x-2">
                      <Checkbox
                        id={`trimester-${trimester}`}
                        checked={selectedTrimesters.includes(trimester)}
                        onCheckedChange={() => handleTrimesterChange(trimester)}
                      />
                      <label
                        htmlFor={`trimester-${trimester}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Trimester {trimester}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Accordion type="single" collapsible className="space-y-4">
                {selectedGrades.map(grade => (
                  <AccordionItem key={grade} value={grade}>
                    <AccordionTrigger className="text-lg font-medium">
                      Grade {grade}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 pt-4">
                        <FormField
                          control={form.control}
                          name={`grades.${grade}.finalReport`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Final Report</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter final report" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {selectedTrimesters.map(trimester => (
                          <div key={trimester} className="space-y-4 border-t pt-4">
                            <h4 className="font-medium">Trimester {trimester}</h4>
                            
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name={`grades.${grade}.trimesters.${trimester}.benchmarks`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Benchmark</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Enter benchmark" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`grades.${grade}.trimesters.${trimester}.communication`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Communication</FormLabel>
                                      <FormControl>
                                        <Textarea placeholder="Enter communication evidence" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`grades.${grade}.trimesters.${trimester}.sensitivity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Sensitivity</FormLabel>
                                      <FormControl>
                                        <Textarea placeholder="Enter sensitivity evidence" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`grades.${grade}.trimesters.${trimester}.aestheticAppreciation`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Aesthetic Appreciation</FormLabel>
                                      <FormControl>
                                        <Textarea placeholder="Enter aesthetic appreciation evidence" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name={`grades.${grade}.trimesters.${trimester}.thematicsComponents`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Thematics/Components</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="Enter components (comma-separated)" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {selectedGrades.length > 0 && selectedTrimesters.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}