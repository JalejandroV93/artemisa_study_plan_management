// src/components/academic-years/AcademicYearTable.tsx

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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,

  } from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AcademicCalendarSettings, TrimesterSettings } from "@prisma/client"; // Import YOUR custom type.
import { SkeletonRows } from "@/components/skeletons/SkeletonsUI";


interface AcademicYearTableProps {
    onEdit: (academicYear: AcademicCalendarSettings & {trimesters: TrimesterSettings[]}) => void;
}

type ExtendedAcademicYear = AcademicCalendarSettings & { trimesters: TrimesterSettings[] };

export function AcademicYearTable({ onEdit }: AcademicYearTableProps) {
    const [academicYears, setAcademicYears] = useState<ExtendedAcademicYear[]>([]); // Use the custom Grade type
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [academicYearToDelete, setAcademicYearToDelete] = useState<string | null>(null);


    const fetchAcademicYears = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/academic-years");
            if (!res.ok) {
                throw new Error("Failed to fetch academic years");
            }
            const data: ExtendedAcademicYear[] = await res.json();
            // Convertir las cadenas de fecha en objetos Date
            const parsedData = data.map((ay) => ({
                ...ay,
                startDate: new Date(ay.startDate),
                endDate: new Date(ay.endDate),
                trimesters: ay.trimesters.map((t) => ({
                    ...t,
                    startDate: new Date(t.startDate),
                    endDate: new Date(t.endDate),
                })),
            }));
            setAcademicYears(parsedData);
        } catch (error) {
            console.error("Error fetching academic years:", error);
            // Handle error (e.g., show a toast)
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
      fetchAcademicYears();
    }, []);

    const handleDelete = async () => {
      if(!academicYearToDelete) return;

        try {
            const response = await fetch(`/api/v1/academic-years/${academicYearToDelete}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete academic year");
            }
            //Refetch the data
            fetchAcademicYears()

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error deleting academic year:", error);
            // Display error to user (using toast or other notification)
        } finally {
             setIsDeleteDialogOpen(false);
             setAcademicYearToDelete(null);
        }
    };


    if(loading) return <SkeletonRows />;


    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Academic Year</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Trimesters</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {academicYears.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No academic years found.
              </TableCell>
            </TableRow>
          ) : (
            academicYears.map((academicYear) => (
              <TableRow key={academicYear.id}>
                <TableCell>{academicYear.academicYear}</TableCell>
                <TableCell>{academicYear.startDate.toLocaleDateString()}</TableCell>
                <TableCell>{academicYear.endDate.toLocaleDateString()}</TableCell>
                <TableCell>
                  {academicYear.trimesters.map((t) => (
                    <div key={t.id}>
                      Trimester {t.number}: {t.startDate.toLocaleDateString()} - {t.endDate.toLocaleDateString()}
                    </div>
                  ))}
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
                      <DropdownMenuItem onClick={() => onEdit(academicYear)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:bg-red-600 focus:text-white"
                          onClick={() => {
                          setAcademicYearToDelete(academicYear.id); // Set ID on click
                          setIsDeleteDialogOpen(true); // Open dialog
                          }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>

            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>
                    Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently
                    delete the academic year and all related trimester data.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                    Continue
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>

        </AlertDialog>
        </Table>
    );
}