// src/app/v1/(dashboard)/subjects/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Removed CardContent, CardHeader, CardTitle
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
import { useToast } from "@/hooks/use-toast";
import { Subject, Trimester, Benchmark, Project } from "@prisma/client"; // Import Project
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { useAuth } from "@/components/providers/AuthProvider";

//Extends interfaces or types
type ExtendedTrimester = Trimester & { benchmarks: Benchmark[] };
//Crucially, add the crossCuttingProjects here:
type ExtendedSubject = Subject & { gradeOfferings: { trimesters: ExtendedTrimester[]; grade: {name: string, id: string}}[], crossCuttingProjects: Project[] };


export default function SubjectDetailPage() {
    const { id } = useParams();
    const [subject, setSubject] = useState<ExtendedSubject | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null); // null for "All Grades"
    const [selectedTrimester, setSelectedTrimester] = useState<string | null>(null); // null for "All Trimesters"
    const [availableGrades, setAvailableGrades] = useState<{id: string, name: string}[]>([]); //For populate the grades filter
    const { toast } = useToast();
    const router = useRouter();
    const {user} = useAuth()


    useEffect(() => {
    const fetchSubject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/subjects/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch subject");
        }
        const data:ExtendedSubject = await res.json();
        setSubject(data);

        // Extract unique grades for the filter
        const grades = Array.from(new Set(data.gradeOfferings.map((offering) => offering.grade))).map(grade => ({
          id: grade.id,
          name: grade.name,
        }));

        setAvailableGrades(grades);

      } catch (error) {
        console.error("Error fetching subject:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch subject data.",
        });
        router.push("/v1/subjects"); // Redirect to the list page on error
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSubject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, router]);

    // Filter grade offerings based on selected grade
    const filteredOfferings = subject?.gradeOfferings.filter((offering) =>
        selectedGrade ? offering.gradeId === selectedGrade : true
    ) ?? [];

  if (loading) {
    return (
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-40" />
          <div>
            <Skeleton className="h-8 w-32 mr-2 inline-block" />
            <Skeleton className="h-8 w-32 inline-block" />
          </div>
        </div>
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-12 w-full mb-4" />
      </div>
    );
  }


    if (!subject) {
        return (
            <div className="container py-8 max-w-7xl mx-auto">
                <p>Subject not found.</p>
            </div>
        );
    }


  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div className="space-y-4">
          <Link
            href="/v1/subjects"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {subject.name}
            </h1>
            <p className="text-gray-600 mt-2">Study Plan Overview</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
           <Select value={selectedGrade || "all"} onValueChange={(value) => setSelectedGrade(value === "all" ? null : value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {availableGrades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user?.role === 'ADMIN' && (<Link href={`/v1/subjects/${subject.id}/edit`}>
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Study Plan
            </Button>
          </Link>)}
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
            <h2 className="text-2xl font-semibold ">{subject.name}</h2>
            <h3 className="font-medium">Liceo Taller San Miguel</h3>
            <p className="text-xs">2024-2025</p>
          </div>
          <div className="absolute top-0 right-0">
            <Logo />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            {subject.vision && (
              <>
                <h3 className="font-medium mb-2">Vision</h3>
                <p className="text-gray-600 mb-4">{subject.vision}</p>
              </>
            )}
            {subject.mission && (
              <>
                <h3 className="font-medium mb-2">Mission</h3>
                <p className="text-gray-600">{subject.mission}</p>
              </>
            )}
          </div>
          <div>
            {subject.generalObjective && (
              <>
                <h3 className="font-medium mb-2">General Objective</h3>
                <p className="text-gray-600 mb-4">
                  {subject.generalObjective}
                </p>
              </>
            )}
            {subject.specificObjectives?.length > 0 && (
              <>
                <h3 className="font-medium mb-2">Specific Objectives</h3>
                <ul
                  className="list-disc
list-outside text-gray-600 mb-4"
                >
                  {subject.specificObjectives.map((objective, index) => (
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
          {subject.didactics && (
            <>
              <h3 className="font-medium mb-2">Didactics</h3>
              <p className="text-gray-600 mb-4">{subject.didactics}</p>
            </>
          )}
          {subject.crossCuttingProjects && (
            <>
              <h3 className="font-medium mb-2">Cross-Cutting Projects</h3>
              <p className="text-gray-600">
                {/* Assuming crossCuttingProjects is an array of project names */}
                {subject.crossCuttingProjects.map((project) => project.name).join(', ')}
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Grade Offerings */}
      <div className="space-y-6">
        {filteredOfferings.map((offering) => (
          <Card key={offering.id} className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Grade {offering.grade.name}
            </h2>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Final Report</h3>
              <p className="text-gray-600">{offering.finalReport}</p>
            </div>

            <div className="mb-4">
              <Select
                value={selectedTrimester || "all"}
                onValueChange={(value) => setSelectedTrimester(value === "all" ? null : value)}
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
                    selectedTrimester === null ||
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
                            {benchmark.description}
                          </p>
                          {/* You'll need to adapt this based on your actual data structure
                          <h4 className="font-medium mb-2">
                            Learning Evidence
                          </h4>
                          <div className="space-y-2 mb-4">
                            {Object.entries(benchmark.learningEvidence).map(
                              ([key, value]) => (
                                <p key={key} className="text-gray-600">
                                  <strong>{key}:</strong> {value}
                                </p>
                              )
                            )}
                          </div>
                          */}

                          <h4 className="font-medium mb-2">
                            Thematics/Components
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {benchmark.thematicComponents.map(
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