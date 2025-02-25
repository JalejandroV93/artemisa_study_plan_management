
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { PlusCircle, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Subject } from "@prisma/client"; // Make sure this is the correct type
import { useAuth } from "@/components/providers/AuthProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkeletonCard } from "@/components/skeletons/SkeletonsUI";
import { ContentLayout } from "@/components/panel-layout/content-layout";

export default function SubjectsPage() {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null); // Use null for "All Grades"
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([]);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSubjects = async (gradeId?: string | null) => {
    setLoading(true);
    try {
      const url = `/api/v1/subjects${
        gradeId ? `?gradeId=${gradeId}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data: Subject[] = await res.json(); // Type assertion
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subjects.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    // No setLoading here, it's a quick fetch
    try {
      const res = await fetch("/api/v1/grades"); // Your existing grades API
      if (!res.ok) {
        throw new Error("Failed to fetch grades");
      }
      const data = await res.json();
      setGrades(data);
    } catch (error) {
      console.error("Error fetching grades:", error);
      // Optional: Show a toast for grade fetching failure
    }
  };

  useEffect(() => {
    fetchSubjects(selectedGrade);
    fetchGrades(); // Fetch grades for the filter dropdown
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  const handleDelete = async () => {
    if (!deleteSubjectId) return;
    setIsDeleteDialogOpen(false);
    try {
      const res = await fetch(`/api/v1/subjects/${deleteSubjectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete subject");
      }
      setSubjects(subjects.filter((s) => s.id !== deleteSubjectId));
      toast({
        title: "Success",
        description: "Subject deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting subject:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete subject.",
      });
      fetchSubjects(selectedGrade);
    } finally {
      setDeleteSubjectId(null);
    }
  };

  return (
    <ContentLayout title="Planes de estudio">
    <div className=" py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-2">Manage your subject study plans</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedGrade || "all"}
            onValueChange={(value) =>
              setSelectedGrade(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user?.role === "ADMIN" && (
            <Link href="/v1/subjects/new">
              <Button className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                New Subject
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Use a dedicated skeleton component for better reusability
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : subjects.length === 0 ? (
          <p>No subjects found.</p>
        ) : (
          subjects.map((subject) => (
            <Card key={subject.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{subject.name}</h3>
                  <p className="text-sm text-gray-500">
                    {/* You might want a better way to show last updated */}
                    Last updated: 2 days ago
                  </p>
                </div>
                {user?.role === "ADMIN" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/v1/subjects/${subject.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/v1/subjects/${subject.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDeleteSubjectId(subject.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600 focus:bg-red-50 focus:text-red-900"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Available in grades:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/*  Display grade names, if available */}
                  </div>
                </div>
                <Link
                  href={`/v1/subjects/${subject.id}`} // Link to subject detail page
                >
                  <Button variant="secondary" className="w-full">
                    View Study Plan
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              subject and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </ContentLayout>
  );
}