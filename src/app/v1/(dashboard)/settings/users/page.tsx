// src/app/v1/(dashboard)/admin/users/page.tsx (Already exists)
// app/v1/(dashboard)/users/page.tsx
"use client";
import { ContentLayout } from "@/components/panel-layout/content-layout";
import { UserTable } from "@/components/users/UserTable";
import { UserForm } from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { User } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const UsersPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refresh, setRefresh] = useState(false); // Add a refresh state

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedUser(null); // Clear selected user when dialog closes
    }
  };

  // Callback that's triggered when a user is successfully created/edited
  const handleSuccess = () => {
    // Toggle the flag to force UserTable to re-mount and fetch updated data
    setRefresh((prev) => !prev);
  };

  return (
    <ContentLayout title="User Management">

    <div className="flex justify-end mb-4">
      <Dialog open={isFormOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button>Crear usuario</Button>
        </DialogTrigger>
        <DialogContent className="max-w-[425px] md:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Editar Usuario" : "Crear Usuario"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Actualizar la información del usuario."
                : "Agregar un nuevo usuario al sistema."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleSuccess} // Pass the success callback
          />
        </DialogContent>
      </Dialog>
    </div>
    <UserTable key={refresh.toString()} onEdit={handleEdit} />  {/* Use refresh as key */}
  </ContentLayout>
);
};

export default UsersPage;