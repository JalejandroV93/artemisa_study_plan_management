// src/components/subjects/SubjectTable.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Subject } from "@prisma/client"; // Import your Subject type
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
import { useToast } from "@/hooks/use-toast";
import { SkeletonRows } from "@/components/skeletons/SkeletonsUI"; // Import the skeleton

interface SubjectTableProps {
  // onEdit: (subject: Subject) => void; // You *could* use this, but direct navigation is often better.
}

export function SubjectTable({ /* onEdit */ }: SubjectTableProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null); // ID of subject to delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/subjects");
      if (!res.ok) {
        throw new Error("Failed to fetch subjects");
      }
      const data = await res.json();
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

  useEffect(() => {
    fetchSubjects();
  }, []);

    const handleDelete = async () => {
        if (!deleteSubjectId) return;
        setIsDeleteDialogOpen(false); // Close dialog *before* API call
        try {
            const res = await fetch(`/api/v1/subjects/${deleteSubjectId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete subject");
            }
            //Optimistic UI update: remove the deleted subject immediately.
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
            //Refetch in case of failure, to ensure data consistency.
            fetchSubjects()
        }
        setDeleteSubjectId(null)
    };

  if (loading) {
    return <SkeletonRows />; // Show loading skeleton.
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject Name</TableHead>
            <TableHead>Grade Offerings</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.length === 0 ? (
             <TableRow>
             <TableCell colSpan={3} className="text-center">
               No subjects found.
             </TableCell>
           </TableRow>
          ) : (
            subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.name}</TableCell>
                <TableCell>
                   {subject.gradeOfferings.map(offering => offering.gradeId).join(', ')}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/v1/subjects/${subject.id}`}>
                          <Edit className="mr-2 h-4 w-4" /> View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDeleteSubjectId(subject.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              subject and all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}