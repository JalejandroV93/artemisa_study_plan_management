"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, GraduationCap, Home, Printer } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const subjects = [
  "Artes Plásticas y Visuales",
  "Ciencias Naturales",
  "Ciencias Sociales",
  "Danzas",
  "Educación Física",
  "English",
  "Filosofía",
  "Français",
  "Identidad San Miguel",
  "Lenguaje",
  "Matemáticas",
  "Música",
  "Teatro"
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r bg-white">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Study Plans</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-4 space-y-2">
          <Link href="/">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-2", {
                "bg-gray-100": pathname === "/"
              })}
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Link href="/subjects">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-2", {
                "bg-gray-100": pathname === "/subjects"
              })}
            >
              <BookOpen className="w-4 h-4" />
              Subjects
            </Button>
          </Link>
          <Link href="/grades">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-2", {
                "bg-gray-100": pathname === "/grades"
              })}
            >
              <GraduationCap className="w-4 h-4" />
              Grades
            </Button>
          </Link>
          <Link href="/print">
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-2", {
                "bg-gray-100": pathname === "/print"
              })}
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </Link>

          <div className="mt-6">
            <h3 className="mb-2 px-4 text-sm font-semibold text-gray-500">Quick Access</h3>
            <div className="space-y-1">
              {subjects.map((subject) => (
                <Link key={subject} href={`/subjects/${encodeURIComponent(subject.toLowerCase().replace(/ /g, '-'))}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm h-8 px-4"
                  >
                    {subject}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}