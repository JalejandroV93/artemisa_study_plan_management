"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Edit, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
      finalReport: "Integro diferentes lenguajes creativos mediante la transformación de experiencias en productos estéticos, teniendo en cuenta la fascinación, sensibilidad, contexto y referentes artísticos, con el objetivo de potenciar el pensamiento creativo a través de procesos de abstracción, construcción y transformación del ser.",
      trimesters: [
        {
          number: 1,
          benchmarks: [
            {
              benchmark: "Creo procesos pictóricos desde el concepto del paisaje natural en mi cotidianidad, como propuesta creativa contextual, con el objetivo de desarrollar habilidades de observación y evocación en la pintura.",
              learningEvidence: {
                communication: "Elaboro una propuesta pictórica para abordar la imagen paisajística desde mi perspectiva personal.",
                sensitivity: "Abordo creativamente el concepto impresionista mediante el dibujo y la pintura.",
                aestheticAppreciation: "Analizo referentes históricos del impresionismo para inspirar mi trabajo."
              },
              thematicsComponents: ["Bidimensional", "Dibujo", "Pintura"]
            }
          ]
        }
      ]
    }
  ]
};

export default function SubjectPage({ params }: { params: { subject: string } }) {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  
  const filteredOfferings = selectedGrade === "all"
    ? EXAMPLE_DATA.gradeOfferings
    : EXAMPLE_DATA.gradeOfferings.filter(offering => offering.grade === selectedGrade);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-4">
          <Link href="/subjects" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{EXAMPLE_DATA.name}</h1>
            <p className="text-gray-600 mt-2">Study Plan Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {EXAMPLE_DATA.gradeOfferings.map(offering => (
                <SelectItem key={offering.grade} value={offering.grade}>
                  Grade {offering.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href={`/subjects/${params.subject}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Study Plan
            </Button>
          </Link>
          <Button className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Study Plan
          </Button>
        </div>
      </div>

      {/* General Information */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXAMPLE_DATA.vision && (
            <div>
              <h3 className="font-medium mb-2">Vision</h3>
              <p className="text-gray-600">{EXAMPLE_DATA.vision}</p>
            </div>
          )}
          {EXAMPLE_DATA.mission && (
            <div>
              <h3 className="font-medium mb-2">Mission</h3>
              <p className="text-gray-600">{EXAMPLE_DATA.mission}</p>
            </div>
          )}
          {EXAMPLE_DATA.generalObjective && (
            <div>
              <h3 className="font-medium mb-2">General Objective</h3>
              <p className="text-gray-600">{EXAMPLE_DATA.generalObjective}</p>
            </div>
          )}
          {EXAMPLE_DATA.specificObjectives && (
            <div>
              <h3 className="font-medium mb-2">Specific Objectives</h3>
              <ul className="list-disc list-inside text-gray-600">
                {EXAMPLE_DATA.specificObjectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Grade Offerings */}
      <div className="space-y-6">
        {filteredOfferings.map((offering) => (
          <Card key={offering.grade} className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Grade {offering.grade}{offering.groupName ? ` - Group ${offering.groupName}` : ''}
            </h2>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Final Report</h3>
              <p className="text-gray-600">{offering.finalReport}</p>
            </div>

            {offering.trimesters.map((trimester) => (
              <div key={trimester.number} className="mb-6">
                <h3 className="font-medium mb-4">Trimester {trimester.number}</h3>
                {trimester.benchmarks.map((benchmark, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Benchmark</h4>
                      <p className="text-gray-600">{benchmark.benchmark}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Learning Evidence</h4>
                      <div className="space-y-2">
                        {benchmark.learningEvidence.communication && (
                          <p className="text-gray-600">
                            <span className="font-medium">Communication:</span>{' '}
                            {benchmark.learningEvidence.communication}
                          </p>
                        )}
                        {benchmark.learningEvidence.sensitivity && (
                          <p className="text-gray-600">
                            <span className="font-medium">Sensitivity:</span>{' '}
                            {benchmark.learningEvidence.sensitivity}
                          </p>
                        )}
                        {benchmark.learningEvidence.aestheticAppreciation && (
                          <p className="text-gray-600">
                            <span className="font-medium">Aesthetic Appreciation:</span>{' '}
                            {benchmark.learningEvidence.aestheticAppreciation}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Thematics/Components</h4>
                      <div className="flex flex-wrap gap-2">
                        {benchmark.thematicsComponents.map((component, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-sm bg-gray-100 rounded-full"
                          >
                            {component}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}