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
} from "@/components/ui/alert-dialog";
import { useUserStore } from "@/lib/stores/userStore";
import { User } from "@prisma/client";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Lock, Unlock, Trash2 } from "lucide-react";
import { SkeletonRows } from "@/components/skeletons/SkeletonsUI";
interface UserTableProps {
  onEdit: (user: User) => void;
}

// Componente auxiliar para renderizar filas esqueléticas


export function UserTable({ onEdit }: UserTableProps) {
  const {
    users,
    fetchUsers,
    loading,
    deleteUser,
    blockUser,
    unblockUser,
  } = useUserStore();
  const [currentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers({
      page: currentPage,
      search: debouncedSearchTerm,
      sortColumn,
      sortOrder,
    });
  }, [currentPage, debouncedSearchTerm, sortColumn, sortOrder, fetchUsers]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting user with ID:", id);
      const response = await fetch(`/api/v1/users/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el usuario");
      }
      deleteUser(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting user:", error);
      // Aquí podrías mostrar una notificación al usuario
    }
  };

  const handleBlock = async (id: string, block: boolean) => {
    try {
      if (block) {
        await blockUser(id);
      } else {
        await unblockUser(id);
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded"
        />
      </div>
      <Table>
        {/* Las columnas se mantienen estáticas */}
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => handleSort("username")}
              className="cursor-pointer"
            >
              Nombre de usuario{" "}
              {sortColumn === "username" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              onClick={() => handleSort("document")}
              className="cursor-pointer"
            >
              Documento{" "}
              {sortColumn === "document" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              onClick={() => handleSort("fullName")}
              className="cursor-pointer"
            >
              Nombre completo{" "}
              {sortColumn === "fullName" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              onClick={() => handleSort("email")}
              className="cursor-pointer"
            >
              Correo{" "}
              {sortColumn === "email" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              onClick={() => handleSort("role")}
              className="cursor-pointer"
            >
              Rol{" "}
              {sortColumn === "role" && (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead
              onClick={() => handleSort("isBlocked")}
              className="cursor-pointer"
            >
              Estado{" "}
              {sortColumn === "isBlocked" &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows />
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.document}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.isBlocked ? "Bloqueado" : "Activo"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.isBlocked ? (
                        <DropdownMenuItem
                          onClick={() => handleBlock(user.id, false)}
                        >
                          <Unlock className="mr-2 h-4 w-4" /> Desbloquear
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleBlock(user.id, true)}
                        >
                          <Lock className="mr-2 h-4 w-4" /> Bloquear
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
  onClick={() => {
    setUserToDelete(user.id);
    setIsDeleteDialogOpen(true);
  }}
  className="text-red-500 focus:bg-red-500 focus:text-white"
>
  <Trash2 className="mr-2 h-4 w-4" />
  Eliminar
</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción no se puede deshacer. El usuario se eliminará de forma permanente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
        Cancelar
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={() => {
          if (userToDelete) {
            handleDelete(userToDelete);
            setIsDeleteDialogOpen(false);
          }
        }}
      >
        Continuar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
