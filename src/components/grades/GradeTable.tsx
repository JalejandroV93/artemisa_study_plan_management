// src/components/grades/GradeTable.tsx
"use client"

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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Grade } from "@/types/school_settings"; // Import YOUR custom type.
import { SkeletonTable } from "@/components/skeletons/SkeletonsUI";


interface GradeTableProps {
onEdit: (grade: Grade) => void;
}

export function GradeTable({ onEdit }: GradeTableProps) {
const [grades, setGrades] = useState<Grade[]>([]); // Use the custom Grade type
const [loading, setLoading] = useState(true);

const fetchGrades = async () => {
    setLoading(true);
    try {
    const res = await fetch("/api/v1/grades");
    if (!res.ok) {
        throw new Error("Failed to fetch grades");
    }
    const data: Grade[] = await res.json();  // Type assertion here
    setGrades(data);
    } catch (error) {
    console.error("Error fetching grades:", error);
    // Handle error (e.g., show a toast)
    } finally {
    setLoading(false);
    }
};

useEffect(() => {
    fetchGrades();
}, []);

const handleDelete = async (id: string) => {
    try {
    const response = await fetch(`/api/v1/grades/${id}`, { method: 'DELETE' });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete grade");
    }
    //Refetch the data
    fetchGrades()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
    console.error("Error deleting grade:", error);
    // Display error to user (using toast or other notification)
    }
};

console.log("grades", grades)
if (loading) {
    return <SkeletonTable />;
}

return (
    <Table>
    <TableHeader>
        <TableRow>
        <TableHead>Grade Name (Intl)</TableHead>
        <TableHead>Colombian Grade</TableHead>
        <TableHead>Section</TableHead>
        <TableHead className="text-right">Actions</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {grades.map((grade) => (
        <TableRow key={grade.id}>
            <TableCell>{grade.name}</TableCell>
            <TableCell>{grade.colombianGrade}</TableCell>
            <TableCell>{grade.section.name}</TableCell> {/* Access section name */}
            <TableCell className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(grade)}>
                <Edit className="h-4 w-4 mr-2"/>
                    Edit
                </DropdownMenuItem>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-600 focus:bg-red-600 focus:text-white">
                    <Trash2 className="h-4 w-4 mr-2"/>
                        Delete
                    </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                        Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the grade and all related groups and data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(grade.id)}>
                        Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
            </TableCell>
        </TableRow>
        ))}
    </TableBody>
    </Table>
);
}