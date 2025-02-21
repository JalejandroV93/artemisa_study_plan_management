"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { useParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const EXAMPLE_DATA = {
  name: "Artes Plásticas y Visuales",
  vision:
    "La visión del área de artes del Liceo Taller San Miguel es formar jóvenes críticos, sensibles y creativos con capacidad de contribuir al desarrollo cultural y social en su contexto.",
  mission:
    "Desarrollar en los estudiantes del Liceo Taller San Miguel potencial creativo desde de su fascinación, con el objeto de formar seres sensibles que, partiendo de la experiencia estética como forma de indagar en aspectos del ser humano y del contexto social fluctuante, creen sentido por medio de lenguajes artísticos. La misión del área de artes del Liceo Taller San Miguel es desarrollar el potencial sensible y creativo de los y las estudiantes, teniendo en cuenta su propia fascinación, donde el arte se posibilite como medio principal de interacción con el entorno.",
  generalObjective:
    "Integrar diferentes lenguajes creativos mediante la transformación de experiencias en productos estéticos, teniendo en cuenta la fascinación, sensibilidad, contexto y referentes artísticos, con el objetivo de potenciar el pensamiento creativo a través de procesos de abstracción, construcción y transformación del ser.",
  specificObjectives: [
    "Comprender el proceso creativo como una combinación entre experiencias, referentes, observaciones y vivencias mediadas a través de los procesos culturales que se desarrollan en nuestra cotidianidad",
    "Desarrollar a través de las relaciones: arte y educación, nuevos paradigmas que tengan como eje principal la apropiación, el pensamiento crítico y la creación de sentido a través de lenguajes artísticos.",
    "Implementar por medio del trabajo por proyectos una ruta donde el producto final sea concebido como parte de todo un proceso, para que la experiencia de creación sea igual de significativa en todas sus etapas.",
  ],
  didactics: `Se aborda la investigación-creación performativa (el hacer como una forma de indagar y descubrir), el trabajo a partir de
      proyectos (uno por trimestre), la experiencia del laboratorio creativo como espacio de experimentación con diversidad de
      lenguajes y el abordaje de referentes artísticos como antecedentes creativos que nos sirven como elementos útiles para
      relacionarlos en el trabajo propios.
      Los proyectos se realizan desde el abordaje de diversas técnicas y lenguajes pertenecientes a las artes visuales y
      sonoras, donde se toman las técnicas tradicionales como el dibujo, la pintura, el grabado y la escultura como referentes y
      activadores, hasta lenguajes contemporáneos y experimentales como son la fotografía, el video y las prácticas sonoras.
      Lo anterior nos brinda un gran abanico de posibilidades creativas, mixturas entre técnicas y la experimentación como
      herramienta para descubrir y generar nuevo conocimiento.
      Todo lo relacionado con la creación estético-artística pertenece al ámbito de lo subjetivo, lo que abre posibilidades
      de evaluar más allá de los métodos tradicionales y se busca reconocer el potencial y el talento de los estudiantes. A
      continuación se explicita la forma de evaluar de estas asignaturas:
      Artes visuales: Se aborda la investigación-creación performativa el hacer como una forma de indagar y
      descubrir la diversidad de lenguajes expresivos reconociendo en los referentes históricos antecedentes creativos que
      constituyen el conocimiento actual. Durante el trimestre se realizarán 3 entregas con un porcentaje del 30% cada una y
      una autoevaluación del 10%; esta última encaminada a que el estudiante se empodere de su proceso y sea reflexivo
      ante este.`,
  crossCuttingProjects:
    "Integración con otras áreas mediante proyectos interdisciplinarios...",

  gradeOfferings: [
    {
      grade: "9",
      groupName: "A",
      finalReport:
        "Integro diferentes lenguajes creativos mediante la transformación de experiencias en productos estéticos, teniendo en cuenta la fascinación, sensibilidad, contexto y referentes artísticos, con el objetivo de potenciar el pensamiento creativo a través de procesos de abstracción, construcción y transformación del ser.",
      trimesters: [
        {
          number: 1,
          benchmarks: [
            {
              benchmark:
                "Creo procesos pictóricos desde el concepto del paisaje natural en mi cotidianidad, como propuesta creativa contextual, con el objetivo de desarrollar habilidades de observación y evocación en la pintura.",
              learningEvidence: [
                "Elaboro una propuesta pictórica para abordar la imagen paisajística desde mi perspectiva personal.",
                "Abordo creativamente el concepto impresionista mediante el dibujo y la pintura.",
                "Analizo referentes históricos del impresionismo para inspirar mi trabajo.",
              ],
              thematicsComponents: ["Bidimensional", "Dibujo", "Pintura"],
            },
          ],
        },
        {
          number: 2,
          benchmarks: [
            {
              benchmark:
                "Creo procesos pictóricos desde el concepto del paisaje natural en mi cotidianidad, como propuesta creativa contextual, con el objetivo de desarrollar habilidades de observación y evocación en la pintura.",
              learningEvidence: [
                "Elaboro una propuesta pictórica para abordar la imagen paisajística desde mi perspectiva personal.",
                "Abordo creativamente el concepto impresionista mediante el dibujo y la pintura.",
                "Analizo referentes históricos del impresionismo para inspirar mi trabajo.",
              ],
              thematicsComponents: ["Bidimensional", "Dibujo", "Pintura"],
            },
          ],
        },
      ],
    },
  ],
};

export default function SubjectPage() {
  const { params } = useParams();
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedTrimester, setSelectedTrimester] = useState<string>("all");

  const filteredOfferings =
    selectedGrade === "all"
      ? EXAMPLE_DATA.gradeOfferings
      : EXAMPLE_DATA.gradeOfferings.filter(
          (offering) => offering.grade === selectedGrade
        );

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div className="space-y-4">
          <Link
            href="/subjects"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {EXAMPLE_DATA.name}
            </h1>
            <p className="text-gray-600 mt-2">Study Plan Overview</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {EXAMPLE_DATA.gradeOfferings.map((offering) => (
                <SelectItem key={offering.grade} value={offering.grade}>
                  Grade {offering.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href={`/subjects/${params}/edit`}>
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Study Plan
            </Button>
          </Link>
          <Button className="w-full sm:w-auto flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Study Plan
          </Button>
        </div>
      </div>

      {/* General Information */}
      <Card className="p-6 mb-8">
        <div className="relative mb-6">
          <div>
            <h2 className="text-2xl font-semibold ">{EXAMPLE_DATA.name}</h2>
            <h3 className="font-medium">Liceo Taller San Miguel</h3>
            <p className="text-xs">2024-2025</p>
          </div>
          <div className="absolute top-0 right-0">
            <Logo />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            {EXAMPLE_DATA.vision && (
              <>
                <h3 className="font-medium mb-2">Vision</h3>
                <p className="text-gray-600 mb-4">{EXAMPLE_DATA.vision}</p>
              </>
            )}
            {EXAMPLE_DATA.mission && (
              <>
                <h3 className="font-medium mb-2">Mission</h3>
                <p className="text-gray-600">{EXAMPLE_DATA.mission}</p>
              </>
            )}
          </div>
          <div>
            {EXAMPLE_DATA.generalObjective && (
              <>
                <h3 className="font-medium mb-2">General Objective</h3>
                <p className="text-gray-600 mb-4">
                  {EXAMPLE_DATA.generalObjective}
                </p>
              </>
            )}
            {EXAMPLE_DATA.specificObjectives?.length > 0 && (
              <>
                <h3 className="font-medium mb-2">Specific Objectives</h3>
                <ul
                  className="list-disc 
list-outside text-gray-600 mb-4"
                >
                  {EXAMPLE_DATA.specificObjectives.map((objective, index) => (
                    <li key={index} className="pl-2">
                      {objective}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        <div>
          {EXAMPLE_DATA.didactics && (
            <>
              <h3 className="font-medium mb-2">Didactics</h3>
              <p className="text-gray-600 mb-4">{EXAMPLE_DATA.didactics}</p>
            </>
          )}
          {EXAMPLE_DATA.crossCuttingProjects && (
            <>
              <h3 className="font-medium mb-2">Cross-Cutting Projects</h3>
              <p className="text-gray-600">
                {EXAMPLE_DATA.crossCuttingProjects}
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Grade Offerings */}
      <div className="space-y-6">
        {filteredOfferings.map((offering) => (
          <Card key={offering.grade} className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Grade {offering.grade}
              {offering.groupName ? ` - Group ${offering.groupName}` : ""}
            </h2>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Final Report</h3>
              <p className="text-gray-600">{offering.finalReport}</p>
            </div>

            <div className="mb-4">
              <Select
                value={selectedTrimester}
                onValueChange={setSelectedTrimester}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by trimester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trimesters</SelectItem>
                  {offering.trimesters.map((trimester) => (
                    <SelectItem
                      key={trimester.number}
                      value={trimester.number.toString()}
                    >
                      Trimester {trimester.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Accordion
              type="multiple"
              defaultValue={offering.trimesters.map(
                (t) => `trimester-${t.number}`
              )}
              className="w-full"
            >
              {offering.trimesters
                .filter(
                  (trimester) =>
                    selectedTrimester === "all" ||
                    trimester.number.toString() === selectedTrimester
                )
                .map((trimester) => (
                  <AccordionItem
                    key={trimester.number}
                    value={`trimester-${trimester.number}`}
                  >
                    <AccordionTrigger>
                      Trimester {trimester.number}
                    </AccordionTrigger>
                    <AccordionContent>
                      {trimester.benchmarks.map((benchmark, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 mb-4 last:mb-0"
                        >
                          <h4 className="font-medium mb-2">Benchmark</h4>
                          <p className="text-gray-600 mb-4">
                            {benchmark.benchmark}
                          </p>

                          <h4 className="font-medium mb-2">
                            Learning Evidence
                          </h4>
                          <div className="space-y-2 mb-4">
                            <ul className="ml-4 list-disc list-outside text-gray-600">
                            {Object.entries(benchmark.learningEvidence).map(
                              ([key, value]) => (
                                <li key={key} className="text-gray-600">
                                  {value}
                                </li>
                              )
                            )}
                            </ul>
                          </div>

                          <h4 className="font-medium mb-2">
                            Thematics/Components
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {benchmark.thematicsComponents.map(
                              (component, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 text-sm bg-gray-100 rounded-full"
                                >
                                  {component}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </Card>
        ))}
      </div>
    </div>
  );
}
