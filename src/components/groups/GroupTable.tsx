// src/components/groups/GroupTable.tsx
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
import { Group } from "@prisma/client";

interface GroupTableProps {
  onEdit: (group: Group) => void;
}

export function GroupTable({ onEdit }: GroupTableProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/groups");
      if (!res.ok) {
        throw new Error("Failed to fetch groups");
      }
      const data = await res.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      // Handle error (e.g., show a toast)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);
console.log("grupos", groups)
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/groups/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete group");
      }
      //Refetch groups
      fetchGroups()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting group:", error);
      // Display error to user (using toast or other notification)
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }
  console.log("groups", groups)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Group Name</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={group.id}>
            <TableCell>{group.name}</TableCell>
            <TableCell>{group.gradeId}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(group)}>
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
                          delete the group and all related enrollments.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(group.id)}>
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