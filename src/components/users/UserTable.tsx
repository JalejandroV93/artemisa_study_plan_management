// src/components/users/UserTable.tsx
"use client";

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
} from "@/components/ui/alert-dialog";
import { useUserStore } from "@/lib/stores/userStore"; // Import Zustand store
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Lock, Unlock, Trash2 } from "lucide-react";
import { SkeletonTable } from "@/components/skeletons/SkeletonsUI";

interface UserTableProps {
  onEdit: (user: User) => void;
}

export function UserTable({ onEdit }: UserTableProps) {
  const {
    users,
    fetchUsers,
    loading,
    deleteUser,
    blockUser,
    unblockUser
  } = useUserStore();
  const [currentPage, ] = useState(1);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage, fetchUsers]);
    if(loading){
        return <SkeletonTable />
    }


  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/users/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }
      deleteUser(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting user:", error);
      // Display error to user (using toast or other notification)
    }
  };

  const handleBlock = async (id: string, block: boolean) => {
      try {
          if(block){
            await blockUser(id)
          }else{
            await unblockUser(id)
          }

      } catch (error) {
        console.error("Error unblocking user:", error);
      }
    };

  return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.isBlocked ? "Blocked" : "Active"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.isBlocked ? (
                        <DropdownMenuItem
                          onClick={() => handleBlock(user.id, false)}
                        >
                          <Unlock className="mr-2 h-4 w-4" /> Unblock
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleBlock(user.id, true)}
                        >
                          <Lock className="mr-2 h-4 w-4" /> Block
                        </DropdownMenuItem>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-500 focus:bg-red-500 focus:text-white">
                            <Trash2 className="mr-2 h-4 w-4" />
                             Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the user.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                            >
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
    </>
  );
}