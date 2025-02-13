"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

// Importamos los componentes refactorizados
import { GeneralInformationForm } from "@/components/GeneralInformationForm";
import { StudyPlansForm } from "@/components/StudyPlansForm";

// Datos de ejemplo
const EXAMPLE_DATA = {
  name: "Artes Plásticas y Visuales",
  vision:
    "Desarrollar la creatividad y expresión artística de los estudiantes...",
  mission:
    "Formar estudiantes con sensibilidad artística y capacidad creativa...",
  generalObjective:
    "Potenciar las habilidades artísticas y creativas de los estudiantes...",
  specificObjectives: [
    "Desarrollar técnicas de dibujo y pintura",
    "Fomentar la apreciación artística",
    "Estimular la creatividad y expresión personal",
  ],
  didactics: "Metodología práctica basada en proyectos artísticos...",
  crossCuttingProjects:
    "Integración con otras áreas mediante proyectos interdisciplinarios...",
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
              learningEvidence: [
                "Elaboro una propuesta pictórica...",
                "Abordo creativamente el concepto impresionista...",
                "Analizo referentes históricos...",
              ],
              thematicsComponents: ["Bidimensional", "Dibujo", "Pintura"],
            },
          ],
        },
      ],
    },
  ],
};

export default function EditSubjectPage({
  params,
}: {
  params: { subject: string };
}) {
  const [activeSection, setActiveSection] = useState("general");

  const methods = useForm({
    defaultValues: EXAMPLE_DATA,
    resolver: zodResolver(z.object({})), // Ajustar según sea necesario
  });

  function onSubmit(values: any) {
    console.log(values);
    // Aquí se realizaría el guardado de la información
    toast({
      title: "Cambios guardados",
      description:
        "Los cambios en la asignatura han sido guardados exitosamente.",
    });
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="container py-8 max-w-5xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div className="space-y-4">
            <Link
              href={`/subjects/${params.subject}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la Asignatura
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar {EXAMPLE_DATA.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Modifica la información de la asignatura y los planes de estudio
              </p>
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>

        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Información General</h2>
            <GeneralInformationForm />
          </Card>

          <Separator />

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Planes de Estudio</h2>
            <StudyPlansForm />
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}
