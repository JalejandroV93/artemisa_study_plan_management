// src/components/sections/SectionTable.tsx
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
    
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Section } from "@prisma/client";  // Import Section type
import { SkeletonRows } from "@/components/skeletons/SkeletonsUI";

interface SectionTableProps {
    onEdit: (section: Section) => void;
}

export function SectionTable({ onEdit }: SectionTableProps) {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/sections");
            if (!res.ok) {
                throw new Error("Failed to fetch sections");
            }
            const data = await res.json();
            setSections(data);
        } catch (error) {
            console.error("Error fetching sections:", error);
            // Handle error (e.g., show a toast)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);


    const handleDelete = async () => { // No ID parameter
      if (!sectionToDelete) return;
        try {
            const response = await fetch(`/api/v1/sections/${sectionToDelete}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete section");
            }
            //Refetch the data
            fetchSections()

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error deleting section:", error);
            // Display error to user (using toast or other notification)
        } finally {
            setIsDeleteDialogOpen(false);
            setSectionToDelete(null);
        }
    };

    if (loading) {
        return <SkeletonRows/>;  // Or a more sophisticated loading indicator
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Section Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sections.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center">
                            No data found.
                        </TableCell>
                    </TableRow>
                ) : (
                    sections.map((section) => (
                        <TableRow key={section.id}>
                            <TableCell>{section.name}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(section)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="text-red-600 focus:bg-red-600 focus:text-white"
                                            onClick={() => {
                                                setSectionToDelete(section.id); // Set the ID to delete
                                                setIsDeleteDialogOpen(true); // Open the confirmation dialog
                                            }}
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
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will
                            permanently delete the section and all related grades.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              
            </AlertDialog>
        </Table>
    );
}