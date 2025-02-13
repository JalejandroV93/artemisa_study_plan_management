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
import { PlusCircle, Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const EXAMPLE_SUBJECTS = [
  {
    name: "Artes Plásticas y Visuales",
    grades: ["6", "7", "8", "9"],
    lastUpdated: "2 days ago"
  },
  {
    name: "Ciencias Naturales",
    grades: ["6", "7", "8", "9", "10", "11"],
    lastUpdated: "1 week ago"
  },
  {
    name: "Ciencias Sociales",
    grades: ["6", "7", "8", "9", "10"],
    lastUpdated: "3 days ago"
  },
  {
    name: "Danzas",
    grades: ["6", "7", "8"],
    lastUpdated: "1 day ago"
  },
  {
    name: "Educación Física",
    grades: ["6", "7", "8", "9", "10", "11"],
    lastUpdated: "5 days ago"
  },
  {
    name: "English",
    grades: ["6", "7", "8", "9", "10", "11"],
    lastUpdated: "1 week ago"
  }
];

const ALL_GRADES = ["6", "7", "8", "9", "10", "11"];

export default function SubjectsPage() {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");

  const filteredSubjects = selectedGrade === "all"
    ? EXAMPLE_SUBJECTS
    : EXAMPLE_SUBJECTS.filter(subject => subject.grades.includes(selectedGrade));

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-2">Manage your subject study plans</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {ALL_GRADES.map(grade => (
                <SelectItem key={grade} value={grade}>
                  Grade {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/subjects/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              New Subject
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject.name} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{subject.name}</h3>
                <p className="text-sm text-gray-500">Last updated: {subject.lastUpdated}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Available in grades:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {subject.grades.map((grade) => (
                    <span
                      key={grade}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full"
                    >
                      Grade {grade}
                    </span>
                  ))}
                </div>
              </div>
              <Link href={`/subjects/${encodeURIComponent(subject.name.toLowerCase().replace(/ /g, '-'))}`}>
                <Button variant="secondary" className="w-full">
                  View Study Plan
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}